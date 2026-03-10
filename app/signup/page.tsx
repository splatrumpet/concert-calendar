import Link from 'next/link'
import { signUpAction } from '@/app/actions/auth'
import AlertMessage from '@/app/components/alert-message'

type Props = {
  searchParams: Promise<{ error?: string }>
}

export default async function SignupPage({ searchParams }: Props) {
  const { error } = await searchParams

  return (
    <main className="mx-auto max-w-xl pt-2 md:pt-4">
      <section className="panel-strong p-6 md:p-9">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--accent)]">
          Create Account
        </p>
        <h1 className="section-title mt-2">新規登録</h1>
        <p className="mt-4 text-sm leading-7 text-[color:var(--muted)] md:text-base">
          表示名とメールアドレスを登録して、演奏会カレンダーを使い始めます。
        </p>

        {error && (
          <div className="mt-6">
            <AlertMessage>{error}</AlertMessage>
          </div>
        )}

        <form action={signUpAction} className="mt-7 space-y-5 md:space-y-6">
          <div>
            <label htmlFor="name" className="label-text">
              表示名
            </label>
            <input id="name" name="name" type="text" required className="field" />
          </div>

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
            登録する
          </button>
        </form>

        <p className="mt-7 text-sm leading-7 text-[color:var(--muted)] md:text-base">
          すでにアカウントをお持ちの方は{' '}
          <Link href="/login" className="text-link">
            ログイン
          </Link>
          へお進みください。
        </p>
      </section>
    </main>
  )
}
