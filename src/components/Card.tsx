import type { HTMLAttributes, PropsWithChildren } from 'react'

export function Card({
  children,
  className,
  ...rest
}: PropsWithChildren<HTMLAttributes<HTMLElement>>) {
  return (
    <section className={className ? `card ${className}` : 'card'} {...rest}>
      {children}
    </section>
  )
}

