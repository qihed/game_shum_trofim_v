import { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'negative' | 'outline';
  children: React.ReactNode;
}

export function Badge({ variant = 'default', children, className = '', ...props }: BadgeProps) {
  const variantStyles = {
    default: 'bg-primary/20 text-primary border border-primary/30',
    success: 'bg-success/20 text-success border border-success/30',
    negative: 'bg-negative/20 text-negative border border-negative/30',
    outline: 'bg-transparent text-foreground border border-border'
  };

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-md text-xs uppercase tracking-wider ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
