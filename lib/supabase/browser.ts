// ./lib/supabase/client.ts
import {createBrowserClient} from '@supabase/auth-helpers-nextjs'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

export const createBrowserSupabaseClient = () => createBrowserClient(supabaseUrl, supabaseAnonKey)
