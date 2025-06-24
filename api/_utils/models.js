import { supabaseAdmin } from './supabase.js';

export class UserModel {
  static async findById(id) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async create(userData) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async update(id, updates) {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}

export class VideoModel {
  static async findByUserId(userId, limit = 10, offset = 0) {
    const { data, error } = await supabaseAdmin
      .from('videos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data || [];
  }

  static async findById(id) {
    const { data, error } = await supabaseAdmin
      .from('videos')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async create(videoData) {
    const { data, error } = await supabaseAdmin
      .from('videos')
      .insert(videoData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async update(id, updates) {
    const { data, error } = await supabaseAdmin
      .from('videos')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}

export class ClipModel {
  static async findByUserId(userId, limit = 10, offset = 0) {
    const { data, error } = await supabaseAdmin
      .from('clips')
      .select(`
        *,
        videos!inner(title, filename)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)
      .range(offset, offset + limit - 1);
    
    if (error) throw error;
    return data || [];
  }

  static async findById(id) {
    const { data, error } = await supabaseAdmin
      .from('clips')
      .select(`
        *,
        videos!inner(title, filename)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async findByRenderID(renderId) {
    const { data, error } = await supabaseAdmin
      .from('clips')
      .select(`
        *,
        videos!inner(title, filename)
      `)
      .eq('file_path', renderId) // render ID is stored in file_path during processing
      .single();
    
    if (error) throw error;
    return data;
  }

  static async create(clipData) {
    const { data, error } = await supabaseAdmin
      .from('clips')
      .insert(clipData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async update(id, updates) {
    const { data, error } = await supabaseAdmin
      .from('clips')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
} 