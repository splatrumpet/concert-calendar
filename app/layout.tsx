import type { Metadata } from 'next'
import Link from 'next/link'
import SignOutButton from '@/app/components/sign-out-button'
import { getCurrentUser } from '@/lib/auth'
import './globals.css'

export const metadata: Metadata = {
  title: 'Concert Calendar',
  description: 'オーケストラ演奏会の共有・検索アプリ',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user } = await getCurrentUser()

  return (
    <html lang="ja">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <header className="border-b bg-white">
          <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
            <Link href="/" className="text-lg font-semibold">
              Concert Calendar
            </Link>
            <nav className="flex items-center gap-3 text-sm">
              <Link href="/concerts" className="underline">
                一覧
              </Link>
              <Link href="/concerts/calendar" className="underline">
                カレンダー
              </Link>
              {user ? (
                <>
                  <Link href="/concerts/new" className="underline">
                    投稿
                  </Link>
                  <Link href="/mypage" className="underline">
                    マイページ
                  </Link>
                  <SignOutButton />
                </>
              ) : (
                <>
                  <Link href="/login" className="underline">
                    ログイン
                  </Link>
                  <Link href="/signup" className="underline">
                    新規登録
                  </Link>
                </>
              )}
            </nav>
          </div>
        </header>
        {children}
      </body>
    </html>
  )
}
