export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          name: string
          avatar_url: string | null
          bio: string | null
          xp: number
          level: number
          role: 'user' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          name: string
          avatar_url?: string | null
          bio?: string | null
          xp?: number
          level?: number
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          name?: string
          avatar_url?: string | null
          bio?: string | null
          xp?: number
          level?: number
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: number
          name: string
          slug: string
          icon: string
          color: string
          created_at: string
        }
        Insert: {
          id?: number
          name: string
          slug: string
          icon?: string
          color?: string
          created_at?: string
        }
        Update: {
          id?: number
          name?: string
          slug?: string
          icon?: string
          color?: string
          created_at?: string
        }
      }
      quotes: {
        Row: {
          id: number
          user_id: string
          category_id: number | null
          content: string
          song_title: string | null
          song_artist: string | null
          song_lyric_snippet: string | null
          spotify_url: string | null
          bg_color: string
          is_quote_of_day: boolean
          status: 'pending' | 'approved' | 'rejected'
          likes_count: number
          dislikes_count: number
          comments_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          user_id: string
          category_id?: number | null
          content: string
          song_title?: string | null
          song_artist?: string | null
          song_lyric_snippet?: string | null
          spotify_url?: string | null
          bg_color?: string
          is_quote_of_day?: boolean
          status?: 'pending' | 'approved' | 'rejected'
          likes_count?: number
          dislikes_count?: number
          comments_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          category_id?: number | null
          content?: string
          song_title?: string | null
          song_artist?: string | null
          song_lyric_snippet?: string | null
          spotify_url?: string | null
          bg_color?: string
          is_quote_of_day?: boolean
          status?: 'pending' | 'approved' | 'rejected'
          likes_count?: number
          dislikes_count?: number
          comments_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: number
          user_id: string
          quote_id: number
          content: string
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          quote_id: number
          content: string
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          quote_id?: number
          content?: string
          created_at?: string
        }
      }
      votes: {
        Row: {
          id: number
          user_id: string
          quote_id: number
          vote_type: 'like' | 'dislike'
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          quote_id: number
          vote_type: 'like' | 'dislike'
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          quote_id?: number
          vote_type?: 'like' | 'dislike'
          created_at?: string
        }
      }
      bookmarks: {
        Row: {
          user_id: string
          quote_id: number
          created_at: string
        }
        Insert: {
          user_id: string
          quote_id: number
          created_at?: string
        }
        Update: {
          user_id?: string
          quote_id?: number
          created_at?: string
        }
      }
      follows: {
        Row: {
          follower_id: string
          following_id: string
          created_at: string
        }
        Insert: {
          follower_id: string
          following_id: string
          created_at?: string
        }
        Update: {
          follower_id?: string
          following_id?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: number
          user_id: string
          sender_id: string | null
          quote_id: number | null
          type: string
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          sender_id?: string | null
          quote_id?: number | null
          type: string
          message: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: string
          sender_id?: string | null
          quote_id?: number | null
          type?: string
          message?: string
          is_read?: boolean
          created_at?: string
        }
      }
    }
  }
}
