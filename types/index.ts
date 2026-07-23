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
