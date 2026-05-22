export type ContactStatus = 'not_contacted' | 'reached_out' | 'scheduled' | 'completed' | 'declined'

export type WouldJoin = 'yes' | 'no' | 'maybe'

export interface Contact {
  id: string
  name: string
  linkedin_url: string | null
  company: string | null
  title: string | null
  years_experience: number | null
  location: string | null
  status: ContactStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Conversation {
  id: string
  contact_id: string
  date: string | null
  duration_minutes: number | null
  hardest_part: string | null
  ai_gaps: string | null
  would_join_exchange: WouldJoin | null
  other_notes: string | null
  themes: string[]
  created_at: string
}

export interface ResearchQuestion {
  id: string
  question_text: string
  category: string
  sort_order: number
}

export const CONTACT_STATUSES: ContactStatus[] = [
  'not_contacted',
  'reached_out',
  'scheduled',
  'completed',
  'declined',
]

export const STATUS_LABELS: Record<ContactStatus, string> = {
  not_contacted: 'Not Contacted',
  reached_out: 'Reached Out',
  scheduled: 'Scheduled',
  completed: 'Completed',
  declined: 'Declined',
}

export const THEMES = [
  'Identity crisis',
  'AI anxiety',
  'Network deterioration',
  'Skill gap — AI tools',
  'Skill gap — Technical',
  'Open to peer exchange',
  'Needs mentorship',
  'Exploring consulting/freelance',
  'Compensation concerns',
  'Still actively networking',
  'Positive about transition',
  'Resistance to change',
  'Leadership relevance concerns',
  'Domain expertise undervalued',
]
