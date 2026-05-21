import type { PropsWithChildren } from 'react'

export function Button({
  children,
  onClick,
  variant = 'primary',
  disabled,
}: PropsWithChildren<{
  onClick?: () => void
  variant?: 'primary' | 'ghost'
  disabled?: boolean
}>) {
  return (
    <button
      type="button"
      className={`btn ${variant}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

