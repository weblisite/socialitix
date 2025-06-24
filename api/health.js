import { supabaseAdmin } from './_utils/supabase.js';
import { withCors } from './_utils/cors.js';

async function handler(req, res) {
  try {
    const health = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      checks: {}
    };

    // Check Supabase connection
    try {
      const { data, error } = await supabaseAdmin
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_type', 'BASE TABLE');
      
      if (error) {
        health.checks.database = {
          status: 'error',
          error: error.message
        };
      } else {
        const tableNames = data.map(t => t.table_name).sort();
        health.checks.database = {
          status: 'ok',
          tables: tableNames,
          hasVideosTable: tableNames.includes('videos'),
          hasClipsTable: tableNames.includes('clips'),
          hasJobQueueTable: tableNames.includes('job_queue')
        };
      }
    } catch (error) {
      health.checks.database = {
        status: 'error',
        error: error.message
      };
    }

    // Check environment variables
    health.checks.environment = {
      hasSupabaseUrl: !!process.env.SUPABASE_URL,
      hasSupabaseServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      hasShotstackKey: !!process.env.SHOTSTACK_API_KEY,
      hasOpenAiKey: !!process.env.OPENAI_API_KEY,
      hasJwtSecret: !!process.env.JWT_SECRET
    };

    // Check if critical tables exist
    const criticalTables = ['videos', 'clips', 'job_queue'];
    const missingTables = criticalTables.filter(table => 
      !health.checks.database.tables?.includes(table)
    );

    if (missingTables.length > 0) {
      health.status = 'warning';
      health.checks.database.missingTables = missingTables;
      health.message = `Missing critical tables: ${missingTables.join(', ')}`;
    }

    const statusCode = health.status === 'ok' ? 200 : 
                      health.status === 'warning' ? 200 : 500;

    res.status(statusCode).json(health);

  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
}

export default withCors(handler); 