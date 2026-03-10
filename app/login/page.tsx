import Link from 'next/link'
import { signInAction } from '@/app/actions/auth'
import AlertMessage from '@/app/components/alert-message'

type Props = {
  searchParams: Promise<{ error?: string; message?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const { error, message } = await searchParams

  return (
    <main className="mx-auto max-w-xl pt-2 md:pt-4">
      <section className="panel-strong p-6 md:p-9">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]">Sign In</p>
        <h1 className="section-title mt-2">ログイン</h1>
        <p className="mt-4 text-sm leading-7 text-[color:var(--muted)] md:text-base">
          登録済みのアカウントでログインすると、演奏会の投稿や編集を続けて行えます。
        </p>

        <div className="mt-6 space-y-3">
          {message && <AlertMessage tone="info">{message}</AlertMessage>}
          {error && <AlertMessage>{error}</AlertMessage>}
        </div>

        <form action={signInAction} className="mt-7 space-y-5 md:space-y-6">
          <div>
            <label htmlFor="email" className="label-text">
              メールアドレス
            </label>
            <input id="email" name="email" type="email" required className="field" />
          </div>

          <div>
            <label htmlFor="password" className="label-text">
              パスワード
            </label>
            <input id="password" name="password" type="password" required className="field" />
          </div>

          <button type="submit" className="primary-button w-full">
            ログイン
          </button>
        </form>

        <p className="mt-7 text-sm leading-7 text-[color:var(--muted)] md:text-base">
          アカウントをお持ちでない方は{' '}
          <Link href="/signup" className="text-link">
            新規登録
          </Link>
          へお進みください。
        </p>
      </section>
    </main>
  )
}
