# concert-calender

Supabase をバックエンドに使ったコンサート情報アプリです。公開ページでは一覧検索とカレンダー閲覧ができ、ログインユーザーは自分のコンサートを登録、編集、削除できます。

## Features

- 当日公演の表示
- 公演一覧の検索
- 月間カレンダー表示
- メールアドレス + パスワード認証
- 公演と演目の登録、更新、削除
- 公演更新時の `concerts` / `programs` 全置換をトランザクション化した RPC

検索条件:

- 日付
- 都道府県
- 曲名
- 作曲家

## Tech Stack

- Next.js 16
- React 19
- TypeScript
- Supabase SSR
- Supabase Auth / Postgres
- ESLint

## Prerequisites

- Node.js 20 以上
- npm
- Supabase プロジェクト

## Setup

1. 依存関係をインストールします。

```bash
npm ci
```

2. ルートに `.env.local` を作成し、以下を設定します。

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

3. 既存の Supabase スキーマに対して、必要な SQL を `supabase/` から適用します。

推奨順:

```text
supabase/composer_hybrid.sql
supabase/add_open_time.sql
supabase/add_conductor_and_soloist.sql
supabase/rls_policies.sql
supabase/update_concert_transaction.sql
```

補足:

- このリポジトリには `concerts` / `programs` の初期作成 SQL は含まれていません。
- `supabase/seed_test_data.sql` はテストデータ投入用です。

4. 開発サーバーを起動します。

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開いて動作確認します。

## npm scripts

```bash
npm run dev        # 開発サーバー
npm run build      # 本番ビルド
npm run start      # 本番ビルドを起動
npm run lint       # ESLint
npm run lint:fix   # ESLint 自動修正
npm run typecheck  # TypeScript 型チェック
npm run check      # lint + typecheck
```

## Application Notes

- 認証が必要な画面は `/concerts/new`、`/concerts/[id]/edit`、`/mypage` です。
- 公演更新は Supabase 関数 `replace_concert_and_programs` を通して実行されます。
- RLS により、作成者本人のみが自分の公演と紐づく演目を更新、削除できます。

## Directory Guide

```text
app/        Next.js App Router
lib/        Supabase client, auth, date/search helpers
supabase/   適用用 SQL
types/      ドメイン型定義
```
