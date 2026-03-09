import Link from 'next/link'
import { signUpAction } from '@/app/actions/auth'

type Props = {
  searchParams: Promise<{ error?: string }>
}

export default async function SignupPage({ searchParams }: Props) {
  const { error } = await searchParams

  return (
    <main className="mx-auto max-w-md space-y-6 p-6">
      <h1 className="text-2xl font-bold">新規登録</h1>

      {error && <p className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <form action={signUpAction} className="space-y-4 rounded border bg-white p-4">
        <div>
          <label htmlFor="name" className="mb-1 block">表示名</label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="email" className="mb-1 block">メールアドレス</label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label htmlFor="password" className="mb-1 block">パスワード</label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <button type="submit" className="rounded border bg-slate-900 px-4 py-2 text-white">
          登録する
        </button>
      </form>

      <p className="text-sm">
        すでにアカウントをお持ちですか？ <Link href="/login" className="underline">ログイン</Link>
      </p>
    </main>
  )
}
