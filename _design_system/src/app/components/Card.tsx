import { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export function Card({ children, className = '', ...props }: CardProps) {
  return (
    <div
      className={`bg-surface border border-border rounded-lg p-6 shadow-lg backdrop-blur-sm relative z-10 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
