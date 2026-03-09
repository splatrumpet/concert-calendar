import { signOutAction } from '@/app/actions/auth'

export default function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button type="submit" className="rounded border px-3 py-1">
        ログアウト
      </button>
    </form>
  )
}
