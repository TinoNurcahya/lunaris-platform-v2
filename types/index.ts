import { Database } from './database'

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Category = Database['public']['Tables']['categories']['Row']
export type QuoteRow = Database['public']['Tables']['quotes']['Row']
export type CommentRow = Database['public']['Tables']['comments']['Row']
export type NotificationRow = Database['public']['Tables']['notifications']['Row']

export interface UserProfile extends Profile {
  quotes_count?: number
  followers_count?: number
  following_count?: number
  is_following?: boolean
}

export interface QuoteItem extends QuoteRow {
  user?: Profile
  category?: Category
  user_vote?: 'like' | 'dislike' | null
  is_bookmarked?: boolean
  is_owner?: boolean
  mood?: string | null
}

export interface CommentItem extends CommentRow {
  user?: Profile
  is_owner?: boolean
  parent_id?: number | null
  replies?: CommentItem[]
}

export interface NotificationItem extends NotificationRow {
  sender?: Profile
  quote?: QuoteRow
}

export interface QuoteCollection {
  id: number
  user_id: string
  name: string
  description?: string | null
  is_public: boolean
  cover_gradient: string
  created_at: string
  updated_at: string
  user?: Profile
  items_count?: number
  quotes?: QuoteItem[]
}

export interface AuditLogItem {
  id: number
  created_at: string
  user_id?: string | null
  user_email?: string | null
  action: string
  ip_address?: string | null
  user_agent?: string | null
  location?: string | null
  path?: string | null
  method?: string | null
  details?: Record<string, unknown> | null
  user?: Profile | null
}

export interface AuditLogStats {
  total_logs: number
  today_logs: number
  unique_ips: number
  admin_actions: number
  top_browser: string
}
