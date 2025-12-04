import { createClient } from '@supabase/supabase-js'

// Supabase configuration
// These will be set as environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

// Log configuration status
if (supabaseUrl && supabaseAnonKey) {
  console.log('✅ Supabase configured:', {
    url: supabaseUrl,
    hasKey: !!supabaseAnonKey,
    keyLength: supabaseAnonKey.length
  })
} else {
  console.warn('⚠️ Supabase credentials not found. Using localStorage fallback.')
  console.warn('Missing:', {
    url: !supabaseUrl,
    key: !supabaseAnonKey
  })
}

// Create Supabase client
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return supabase !== null
}

