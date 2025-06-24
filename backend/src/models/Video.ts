import { supabaseAdmin } from '../config/supabase.js'

export interface IEngagementSegment {
  id: string
  video_id: string
  start_time: number
  end_time: number
  score: number
  reasons: string[]
  volume?: number
  pitch?: number
  speech_rate?: number
  emotional_tone?: 'positive' | 'negative' | 'neutral' | 'excited' | 'calm'
  motion_intensity?: number
  face_count?: number
  scene_change?: boolean
  text_present?: boolean
  created_at: string
}

export interface IHook {
  id: string
  video_id: string
  timestamp: number
  type: 'question' | 'statement' | 'visual' | 'audio' | 'transition'
  confidence: number
  text?: string
  description: string
  suggested_clip_start: number
  suggested_clip_end: number
  created_at: string
}

export interface IVideo {
  id: string
  user_id: string
  team_id?: string
  title: string
  description?: string
  filename: string
  original_filename: string
  file_size: number
  duration: number
  width: number
  height: number
  format: string
  url: string
  thumbnail_url?: string
  source: 'upload' | 'youtube'
  youtube_url?: string
  analysis_status: 'pending' | 'processing' | 'completed' | 'failed'
  transcript?: string
  processing_progress: number
  processing_error?: string
  ai_suggestions: {
    clips: Array<{
      id: string
      startTime: number
      endTime: number
      score: number
      title: string
      description: string
      hookType: string
      trendingTags: string[]
    }>
    bestMoments: number[]
    overallScore: number
  }
  tags: string[]
  is_public: boolean
  view_count: number
  created_at: string
  updated_at: string
}

export class VideoModel {
  static async findById(id: string): Promise<IVideo | null> {
    const { data, error } = await supabaseAdmin
      .from('videos')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null
    return data as IVideo
  }

  static async findByUserId(userId: string, limit?: number, offset?: number): Promise<IVideo[]> {
    let query = supabaseAdmin
      .from('videos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (limit) query = query.limit(limit)
    if (offset) query = query.range(offset, offset + (limit || 10) - 1)

    const { data, error } = await query

    if (error || !data) return []
    return data as IVideo[]
  }

  static async create(videoData: Partial<IVideo>): Promise<IVideo | null> {
    const { data, error } = await supabaseAdmin
      .from('videos')
      .insert([videoData])
      .select()
      .single()

    if (error || !data) return null
    return data as IVideo
  }

  static async update(id: string, updates: Partial<IVideo>): Promise<IVideo | null> {
    const { data, error } = await supabaseAdmin
      .from('videos')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error || !data) return null
    return data as IVideo
  }

  static async delete(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('videos')
      .delete()
      .eq('id', id)

    return !error
  }

  static async canBeAccessedBy(videoId: string, userId: string): Promise<boolean> {
    const { data, error } = await supabaseAdmin
      .from('videos')
      .select('user_id')
      .eq('id', videoId)
      .single()

    if (error || !data) return false
    return data.user_id === userId
  }

  static async updateAnalysisProgress(id: string, progress: number): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('videos')
      .update({ processing_progress: progress })
      .eq('id', id)

    return !error
  }

  static async getByAnalysisStatus(status: 'pending' | 'processing' | 'completed' | 'failed'): Promise<IVideo[]> {
    const { data, error } = await supabaseAdmin
      .from('videos')
      .select('*')
      .eq('analysis_status', status)

    if (error || !data) return []
    return data as IVideo[]
  }
}

export class EngagementSegmentModel {
  static async findByVideoId(videoId: string): Promise<IEngagementSegment[]> {
    const { data, error } = await supabaseAdmin
      .from('engagement_segments')
      .select('*')
      .eq('video_id', videoId)
      .order('start_time', { ascending: true })

    if (error || !data) return []
    return data as IEngagementSegment[]
  }

  static async create(segmentData: Partial<IEngagementSegment>): Promise<IEngagementSegment | null> {
    const { data, error } = await supabaseAdmin
      .from('engagement_segments')
      .insert([segmentData])
      .select()
      .single()

    if (error || !data) return null
    return data as IEngagementSegment
  }

  static async createBatch(segments: Partial<IEngagementSegment>[]): Promise<IEngagementSegment[]> {
    const { data, error } = await supabaseAdmin
      .from('engagement_segments')
      .insert(segments)
      .select()

    if (error || !data) return []
    return data as IEngagementSegment[]
  }

  static async deleteByVideoId(videoId: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('engagement_segments')
      .delete()
      .eq('video_id', videoId)

    return !error
  }
}

export class HookModel {
  static async findByVideoId(videoId: string): Promise<IHook[]> {
    const { data, error } = await supabaseAdmin
      .from('hooks')
      .select('*')
      .eq('video_id', videoId)
      .order('timestamp', { ascending: true })

    if (error || !data) return []
    return data as IHook[]
  }

  static async create(hookData: Partial<IHook>): Promise<IHook | null> {
    const { data, error } = await supabaseAdmin
      .from('hooks')
      .insert([hookData])
      .select()
      .single()

    if (error || !data) return null
    return data as IHook
  }

  static async createBatch(hooks: Partial<IHook>[]): Promise<IHook[]> {
    const { data, error } = await supabaseAdmin
      .from('hooks')
      .insert(hooks)
      .select()

    if (error || !data) return []
    return data as IHook[]
  }

  static async deleteByVideoId(videoId: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('hooks')
      .delete()
      .eq('video_id', videoId)

    return !error
  }
} 