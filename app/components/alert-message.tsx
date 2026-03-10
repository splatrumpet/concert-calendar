type Props = {
  children: React.ReactNode
  tone?: 'error' | 'info'
}

const TONE_CLASS_NAMES = {
  error: 'border-red-300 bg-red-50 text-red-700',
  info: 'border-blue-300 bg-blue-50 text-blue-700',
} as const

export default function AlertMessage({ children, tone = 'error' }: Props) {
  return <p className={`rounded border p-3 text-sm ${TONE_CLASS_NAMES[tone]}`}>{children}</p>
}
