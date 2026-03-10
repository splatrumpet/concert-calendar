import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function isMissingSessionError(message: string): boolean {
  return message === 'Auth session missing!'
}

export async function getCurrentUser() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error && !isMissingSessionError(error.message)) {
    throw new Error(error.message)
  }

  return { supabase, user: user ?? null }
}

export async function requireUser(redirectPath = '/login') {
  const { supabase, user } = await getCurrentUser()

  if (!user) {
    redirect(redirectPath)
  }

  return { supabase, user }
}
