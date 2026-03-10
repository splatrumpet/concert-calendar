import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error) {
    throw new Error(error.message)
  }

  return { supabase, user }
}

export async function requireUser(redirectPath = '/login') {
  const { supabase, user } = await getCurrentUser()

  if (!user) {
    redirect(redirectPath)
  }

  return { supabase, user }
}
