import { supabaseAdmin } from '../config/supabase.js'
import crypto from 'crypto'

export interface IUser {
  id: string
  email: string
  name: string
  avatar?: string
  email_verified: boolean
  subscription_tier: 'free' | 'basic' | 'pro' | 'enterprise'
  subscription_status: 'active' | 'inactive' | 'trial' | 'cancelled'
  polar_subscription_id?: string
  subscription_expires_at?: string
  trial_ends_at?: string
  uploads_used: number
  uploads_limit: number
  clips_used: number
  clips_limit: number
  storage_used: number
  storage_limit: number
  team_id?: string
  role: 'admin' | 'editor' | 'viewer'
  notifications_enabled: boolean
  auto_subtitles: boolean
  default_format: 'tiktok' | 'instagram' | 'twitter' | 'youtube'
  default_quality: '720p' | '1080p' | '4k'
  api_key?: string
  last_login_at?: string
  created_at: string
  updated_at: string
}

export class UserModel {
  static async findById(id: string): Promise<IUser | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', id)
      .single()

    if (error || !data) return null
    return data as IUser
  }

  static async findByEmail(email: string): Promise<IUser | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('email', email)
      .single()

    if (error || !data) return null
    return data as IUser
  }

  static async findByApiKey(apiKey: string): Promise<IUser | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('api_key', apiKey)
      .single()

    if (error || !data) return null
    return data as IUser
  }

  static async create(userData: Partial<IUser>): Promise<IUser | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .insert([userData])
      .select()
      .single()

    if (error || !data) return null
    return data as IUser
  }

  static async update(id: string, updates: Partial<IUser>): Promise<IUser | null> {
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error || !data) return null
    return data as IUser
  }

  static async delete(id: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', id)

    return !error
  }

  static generateApiKey(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  static canUpload(user: IUser, fileSize: number): boolean {
    return (user.storage_used + fileSize) <= user.storage_limit
  }

  static canCreateClip(user: IUser): boolean {
    return user.clips_used < user.clips_limit
  }

  static resetUsage(userId: string): Promise<IUser | null> {
    return this.update(userId, {
      uploads_used: 0,
      clips_used: 0,
      storage_used: 0
    })
  }

  static updateUsageLimits(user: IUser): Partial<IUser> {
    const limits = {
      free: {
        uploads_limit: 52428800, // 50MB
        clips_limit: 3,
        storage_limit: 52428800 // 50MB
      },
      basic: {
        uploads_limit: 2147483648, // 2GB
        clips_limit: 50,
        storage_limit: 2147483648 // 2GB
      },
      pro: {
        uploads_limit: 10737418240, // 10GB
        clips_limit: 500,
        storage_limit: 10737418240 // 10GB
      },
      enterprise: {
        uploads_limit: 107374182400, // 100GB
        clips_limit: 5000,
        storage_limit: 107374182400 // 100GB
      }
    }

    const tierLimits = limits[user.subscription_tier]
    return {
      uploads_limit: tierLimits.uploads_limit,
      clips_limit: tierLimits.clips_limit,
      storage_limit: tierLimits.storage_limit
    }
  }
} 