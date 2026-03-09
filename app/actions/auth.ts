'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function toErrorRedirect(path: string, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`)
}

function mapAuthErrorMessage(message: string): string {
  if (message.includes('Email not confirmed')) {
    return 'メール確認が完了していません。受信した確認メールのリンクを開いてからログインしてください。'
  }

  return message
}

export async function signUpAction(formData: FormData): Promise<void> {
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '').trim()

  if (!name || !email || !password) {
    toErrorRedirect('/signup', '必須項目を入力してください。')
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
    },
  })

  if (error) {
    toErrorRedirect('/signup', mapAuthErrorMessage(error.message))
  }

  redirect('/login?message=確認メールを送信しました。メール内のリンクを開いてからログインしてください。')
}

export async function signInAction(formData: FormData): Promise<void> {
  const email = String(formData.get('email') ?? '').trim()
  const password = String(formData.get('password') ?? '').trim()

  if (!email || !password) {
    toErrorRedirect('/login', 'メールアドレスとパスワードを入力してください。')
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    toErrorRedirect('/login', mapAuthErrorMessage(error.message))
  }

  redirect('/')
}

export async function signOutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/')
}
