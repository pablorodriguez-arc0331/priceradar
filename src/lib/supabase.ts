import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Check your .env file.')
}

// Use explicit app URL in production so OAuth redirects survive CDN edge nodes
// where window.location.origin may differ from the canonical domain.
const appUrl: string = import.meta.env.VITE_APP_URL ?? window.location.origin

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: 'price-radar-auth',
    storage: window.localStorage,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})

// Auth helpers
export const signInWithGoogle = () =>
  supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${appUrl}/auth/callback`,
      queryParams: { access_type: 'offline', prompt: 'consent' },
    },
  })

export const signInWithEmail = (email: string, password: string) =>
  supabase.auth.signInWithPassword({ email, password })

export const signUpWithEmail = (email: string, password: string, name: string) =>
  supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: name } },
  })

export const signOut = () => supabase.auth.signOut()

export const getSession = () => supabase.auth.getSession()
