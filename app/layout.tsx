import type { Metadata } from 'next'
import Link from 'next/link'
import SignOutButton from '@/app/components/sign-out-button'
import { getCurrentUser } from '@/lib/auth'
import './globals.css'

export const metadata: Metadata = {
  title: 'Concert Calendar',
  description: 'オーケストラ演奏会を上品に探し、記録するためのカレンダーアプリ',
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const { user } = await getCurrentUser()

  return (
    <html lang="ja">
      <body className="text-slate-900 antialiased">
        <div className="page-shell px-0 py-4 md:py-6">
          <header className="panel-strong mb-8 overflow-hidden">
            <div className="flex flex-col gap-5 px-5 py-5 md:flex-row md:items-center md:justify-between md:px-8">
              <div>
                <Link href="/" className="text-2xl font-bold tracking-[-0.05em] text-[var(--primary-strong)]">
                  Concert Calendar
                </Link>
                <p className="mt-1 text-sm text-[color:var(--muted)]">演奏会の情報を見渡せるカレンダー。</p>
              </div>

              <nav className="flex flex-wrap items-center gap-2 text-sm md:justify-end">
                <Link href="/concerts" className="secondary-button">
                  一覧
                </Link>
                <Link href="/concerts/calendar" className="secondary-button">
                  カレンダー
                </Link>
                {user ? (
                  <>
                    <Link href="/concerts/new" className="primary-button">
                      投稿する
                    </Link>
                    <Link href="/mypage" className="secondary-button">
                      マイページ
                    </Link>
                    <SignOutButton />
                  </>
                ) : (
                  <>
                    <Link href="/login" className="secondary-button">
                      ログイン
                    </Link>
                    <Link href="/signup" className="primary-button">
                      新規登録
                    </Link>
                  </>
                )}
              </nav>
            </div>
          </header>

          <div className="pb-10">{children}</div>
        </div>
      </body>
    </html>
  )
}
