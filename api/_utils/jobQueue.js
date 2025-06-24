import { supabaseAdmin } from './supabase.js';

export class JobQueue {
  static async addJob(type, data, priority = 'normal') {
    try {
      const { data: job, error } = await supabaseAdmin
        .from('job_queue')
        .insert({
          type,
          data,
          priority,
          status: 'pending',
          created_at: new Date().toISOString(),
          attempts: 0,
          max_attempts: 3,
        })
        .select()
        .single();

      if (error) throw error;
      
      console.log(`Job ${job.id} added to queue:`, { type, priority });
      return job;
    } catch (error) {
      console.error('Error adding job to queue:', error);
      throw error;
    }
  }

  static async getNextJob() {
    try {
      // Get the next pending job with highest priority
      const { data: jobs, error } = await supabaseAdmin
        .from('job_queue')
        .select('*')
        .eq('status', 'pending')
        .lt('attempts', 3) // Don't retry jobs that have failed 3 times
        .order('priority', { ascending: true }) // high priority first
        .order('created_at', { ascending: true }) // oldest first
        .limit(1);

      if (error) throw error;
      
      if (!jobs || jobs.length === 0) {
        return null;
      }

      const job = jobs[0];

      // Mark job as processing
      const { error: updateError } = await supabaseAdmin
        .from('job_queue')
        .update({
          status: 'processing',
          started_at: new Date().toISOString(),
          attempts: job.attempts + 1,
        })
        .eq('id', job.id);

      if (updateError) throw updateError;

      return { ...job, attempts: job.attempts + 1 };
    } catch (error) {
      console.error('Error getting next job:', error);
      throw error;
    }
  }

  static async completeJob(jobId, result = null) {
    try {
      const { error } = await supabaseAdmin
        .from('job_queue')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          result,
        })
        .eq('id', jobId);

      if (error) throw error;
      
      console.log(`Job ${jobId} completed successfully`);
    } catch (error) {
      console.error('Error completing job:', error);
      throw error;
    }
  }

  static async failJob(jobId, errorMessage) {
    try {
      const { error } = await supabaseAdmin
        .from('job_queue')
        .update({
          status: 'failed',
          failed_at: new Date().toISOString(),
          error_message: errorMessage,
        })
        .eq('id', jobId);

      if (error) throw error;
      
      console.log(`Job ${jobId} marked as failed:`, errorMessage);
    } catch (error) {
      console.error('Error failing job:', error);
      throw error;
    }
  }

  static async retryJob(jobId) {
    try {
      const { error } = await supabaseAdmin
        .from('job_queue')
        .update({
          status: 'pending',
          started_at: null,
          failed_at: null,
          error_message: null,
        })
        .eq('id', jobId);

      if (error) throw error;
      
      console.log(`Job ${jobId} queued for retry`);
    } catch (error) {
      console.error('Error retrying job:', error);
      throw error;
    }
  }

  static async getJobStatus(jobId) {
    try {
      const { data: job, error } = await supabaseAdmin
        .from('job_queue')
        .select('*')
        .eq('id', jobId)
        .single();

      if (error) throw error;
      return job;
    } catch (error) {
      console.error('Error getting job status:', error);
      throw error;
    }
  }

  // Clean up old completed jobs (run periodically)
  static async cleanup(olderThanDays = 7) {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const { error } = await supabaseAdmin
        .from('job_queue')
        .delete()
        .eq('status', 'completed')
        .lt('completed_at', cutoffDate.toISOString());

      if (error) throw error;
      
      console.log(`Cleaned up jobs older than ${olderThanDays} days`);
    } catch (error) {
      console.error('Error cleaning up jobs:', error);
      throw error;
    }
  }
} 