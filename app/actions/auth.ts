'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const AUTH_ROUTES = {
  home: '/',
  login: '/login',
  signup: '/signup',
} as const

type AuthRoute = (typeof AUTH_ROUTES)[keyof typeof AUTH_ROUTES]

type Credentials = {
  email: string
  password: string
}

type SignUpCredentials = Credentials & {
  name: string
}

const SIGN_UP_SUCCESS_MESSAGE =
  '確認メールを送信しました。メール内のリンクを開いてからログインしてください。'

function getFormValue(formData: FormData, key: string): string {
  return String(formData.get(key) ?? '').trim()
}

function getCredentials(formData: FormData): Credentials {
  return {
    email: getFormValue(formData, 'email'),
    password: getFormValue(formData, 'password'),
  }
}

function getSignUpCredentials(formData: FormData): SignUpCredentials {
  return {
    name: getFormValue(formData, 'name'),
    ...getCredentials(formData),
  }
}

function redirectWithError(path: AuthRoute, message: string): never {
  redirect(`${path}?error=${encodeURIComponent(message)}`)
}

function redirectWithMessage(path: AuthRoute, message: string): never {
  redirect(`${path}?message=${encodeURIComponent(message)}`)
}

function mapAuthErrorMessage(message: string): string {
  if (message.includes('Email not confirmed')) {
    return 'メール確認が完了していません。受信した確認メールのリンクを開いてからログインしてください。'
  }

  return message
}

function handleAuthError(path: AuthRoute, message: string): never {
  redirectWithError(path, mapAuthErrorMessage(message))
}

export async function signUpAction(formData: FormData): Promise<void> {
  const { name, email, password } = getSignUpCredentials(formData)

  if (!name || !email || !password) {
    redirectWithError(AUTH_ROUTES.signup, '必須項目を入力してください。')
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
    handleAuthError(AUTH_ROUTES.signup, error.message)
  }

  redirectWithMessage(AUTH_ROUTES.login, SIGN_UP_SUCCESS_MESSAGE)
}

export async function signInAction(formData: FormData): Promise<void> {
  const { email, password } = getCredentials(formData)

  if (!email || !password) {
    redirectWithError(AUTH_ROUTES.login, 'メールアドレスとパスワードを入力してください。')
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    handleAuthError(AUTH_ROUTES.login, error.message)
  }

  redirect(AUTH_ROUTES.home)
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect(AUTH_ROUTES.home)
}
