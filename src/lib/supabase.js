import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Only create client if real URLs are provided (not placeholders)
const isValidUrl = (url) =>
  url &&
  typeof url === 'string' &&
  (url.startsWith('https://') || url.startsWith('http://')) &&
  url.includes('.supabase.co')

export const supabase = isValidUrl(supabaseUrl) && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null
