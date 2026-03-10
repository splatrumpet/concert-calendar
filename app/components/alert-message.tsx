type Props = {
  children: React.ReactNode
  tone?: 'error' | 'info'
}

const TONE_CLASS_NAMES = {
  error: 'border-red-200 bg-red-50/90 text-red-700',
  info: 'border-blue-200 bg-blue-50/90 text-[var(--primary-strong)]',
} as const

export default function AlertMessage({ children, tone = 'error' }: Props) {
  return (
    <p className={`rounded-2xl border px-4 py-3 text-sm shadow-sm ${TONE_CLASS_NAMES[tone]}`}>
      {children}
    </p>
  )
}
