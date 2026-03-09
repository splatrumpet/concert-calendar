import Link from 'next/link'
import { signInAction } from '@/app/actions/auth'

type Props = {
  searchParams: Promise<{ error?: string; message?: string }>
}

export default async function LoginPage({ searchParams }: Props) {
  const { error, message } = await searchParams

  return (
    <main className="mx-auto max-w-md space-y-6 p-6">
      <h1 className="text-2xl font-bold">ログイン</h1>

      {message && <p className="rounded border border-blue-300 bg-blue-50 p-3 text-sm text-blue-700">{message}</p>}
      {error && <p className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      <form action={signInAction} className="space-y-4 rounded border bg-white p-4">
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
          ログイン
        </button>
      </form>

      <p className="text-sm">
        アカウントをお持ちでないですか？ <Link href="/signup" className="underline">新規登録</Link>
      </p>
    </main>
  )
}
