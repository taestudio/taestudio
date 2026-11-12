import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Tables = {
  leads: {
    id: string
    email: string
    source: string
    consent: boolean
    created_at: string
  }
  purchases: {
    id: string
    email: string
    product: string
    amount: number
    stripe_session_id: string | null
    created_at: string
  }
  applications: {
    id: string
    name: string
    email: string
    business_stage: string
    goals: string
    challenges: string
    budget_range: string
    referral_source: string | null
    created_at: string
  }
  strategy_sessions: {
    id: string
    session_id: string
    engine_id: string
    email: string | null
    created_at: string
  }
  saved_outputs: {
    id: string
    session_id: string
    engine_id: string
    content: string
    preview: string
    created_at: string
  }
}
