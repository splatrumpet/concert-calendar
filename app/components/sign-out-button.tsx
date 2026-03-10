import { signOutAction } from '@/app/actions/auth'

export default function SignOutButton() {
  return (
    <form action={signOutAction}>
      <button type="submit" className="secondary-button">
        ログアウト
      </button>
    </form>
  )
}
