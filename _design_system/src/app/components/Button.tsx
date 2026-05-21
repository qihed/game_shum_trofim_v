import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'ghost' | 'secondary';
  children: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', className = '', children, disabled, ...props }, ref) => {
    const baseStyles = 'px-8 py-3 rounded-lg transition-all duration-300 relative overflow-hidden';

    const variantStyles = {
      primary: `bg-primary text-primary-foreground hover:shadow-[0_0_20px_var(--glow)] disabled:opacity-50 disabled:cursor-not-allowed`,
      ghost: `bg-transparent border border-border text-foreground hover:bg-surface hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed`,
      secondary: `bg-surface border border-border text-foreground hover:border-primary disabled:opacity-50 disabled:cursor-not-allowed`
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
