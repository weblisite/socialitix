import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { supabase, signIn, signUp, signOut, getCurrentUser, getSession } from '../lib/supabase'
import type { User as SupabaseUser, Session } from '@supabase/supabase-js'

export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  subscription_tier: 'free' | 'basic' | 'pro' | 'enterprise'
  subscription_status: 'active' | 'inactive' | 'trial' | 'cancelled'
  subscription_expires_at?: string
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

interface AuthState {
  user: User | null
  session: Session | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: Partial<User>) => void
  setLoading: (loading: boolean) => void
  initialize: () => Promise<void>
  refreshSession: () => Promise<void>
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: false,

      initialize: async () => {
        set({ isLoading: true })
        try {
          const session = await getSession()
          if (session?.user) {
            // Try to fetch user profile from our backend
            try {
              const response = await fetch('/api/auth/profile', {
                headers: {
                  'Authorization': `Bearer ${session.access_token}`,
                },
              })
              
              if (response.ok) {
                const { user } = await response.json()
                set({
                  user,
                  session,
                  isAuthenticated: true,
                  isLoading: false,
                })
                return
              }
            } catch (apiError) {
              console.warn('Failed to fetch user profile from API:', apiError)
            }
            
            // If API call fails, still mark as authenticated with basic user info
            set({
              user: {
                id: session.user.id,
                email: session.user.email || '',
                name: session.user.user_metadata?.name || session.user.email || 'User',
                subscription_tier: 'free',
                subscription_status: 'active',
                uploads_used: 0,
                uploads_limit: 10,
                clips_used: 0,
                clips_limit: 50,
                storage_used: 0,
                storage_limit: 1000,
                role: 'viewer',
                notifications_enabled: true,
                auto_subtitles: true,
                default_format: 'tiktok',
                default_quality: '1080p',
                created_at: session.user.created_at || new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              session,
              isAuthenticated: true,
              isLoading: false,
            })
          } else {
            set({ isLoading: false })
          }
        } catch (error) {
          console.error('Auth initialization error:', error)
          set({ isLoading: false })
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          const { data, error } = await signIn(email, password)
          
          if (error) {
            throw new Error(error.message)
          }

          if (data.session && data.user) {
            // Fetch user profile from our backend
            const response = await fetch('/api/auth/profile', {
              headers: {
                'Authorization': `Bearer ${data.session.access_token}`,
              },
            })
            
            if (response.ok) {
              const { user } = await response.json()
              set({
                user,
                session: data.session,
                isAuthenticated: true,
                isLoading: false,
              })
            } else {
              throw new Error('Failed to fetch user profile')
            }
          }
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      register: async (email: string, password: string, name: string) => {
        set({ isLoading: true })
        try {
          // First create user via our backend API
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, name }),
          })

          if (!response.ok) {
            const error = await response.json()
            throw new Error(error.message || 'Registration failed')
          }

          // Then sign in the user
          const { data, error } = await signIn(email, password)
          
          if (error) {
            throw new Error(error.message)
          }

          if (data.session && data.user) {
            // Fetch user profile from our backend
            const profileResponse = await fetch('/api/auth/profile', {
              headers: {
                'Authorization': `Bearer ${data.session.access_token}`,
              },
            })
            
            if (profileResponse.ok) {
              const { user } = await profileResponse.json()
              set({
                user,
                session: data.session,
                isAuthenticated: true,
                isLoading: false,
              })
            } else {
              throw new Error('Failed to fetch user profile')
            }
          }
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },

      logout: async () => {
        try {
          await signOut()
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
          })
        } catch (error) {
          console.error('Logout error:', error)
          // Force logout even if API call fails
          set({
            user: null,
            session: null,
            isAuthenticated: false,
            isLoading: false,
          })
        }
      },

      refreshSession: async () => {
        try {
          const { data, error } = await supabase.auth.refreshSession()
          
          if (error) {
            throw error
          }

          if (data.session) {
            set({ session: data.session })
          }
        } catch (error) {
          console.error('Session refresh error:', error)
          // If refresh fails, logout user
          get().logout()
        }
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } })
        }
      },

      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        session: state.session,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

// Listen for auth state changes
supabase.auth.onAuthStateChange(async (event, session) => {
  const store = useAuthStore.getState()
  
  if (event === 'SIGNED_IN' && session) {
    // User signed in, fetch profile
    try {
      const response = await fetch('/api/auth/profile', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      })
      
      if (response.ok) {
        const { user } = await response.json()
        useAuthStore.setState({
          user,
          session,
          isAuthenticated: true,
        })
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  } else if (event === 'SIGNED_OUT') {
    // User signed out
    useAuthStore.setState({
      user: null,
      session: null,
      isAuthenticated: false,
    })
  } else if (event === 'TOKEN_REFRESHED' && session) {
    // Token refreshed
    useAuthStore.setState({ session })
  }
}) 