import { createClient, type User as SbUser } from '@supabase/supabase-js'
import type { User } from './store'

// Project credentials. The publishable (anon) key is safe to ship in client
// code; override at build time with VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.
const env = import.meta.env as unknown as Record<string, string | undefined>
const url = env.VITE_SUPABASE_URL || 'https://pdebesxkkqzbcrkporcs.supabase.co'
const anonKey = env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_qF5zodM7aED_jshPUdyU4w_rAyYhWwR'

export const supabaseEnabled = !!(url && anonKey)

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

function nameFromEmail(email: string): string {
  const local = email.split('@')[0] || 'there'
  return local.charAt(0).toUpperCase() + local.slice(1)
}

/** Map a Supabase auth user to the app's User shape. */
export function userFromSupabase(u: SbUser): User {
  const email = u.email ?? ''
  const name = (u.user_metadata?.name as string | undefined)?.trim() || nameFromEmail(email)
  return { name, email }
}
