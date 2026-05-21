import { HTMLAttributes } from 'react';

interface ChoiceCardProps extends HTMLAttributes<HTMLButtonElement> {
  letter: string;
  title: string;
  description: string;
  selected?: boolean;
}

export function ChoiceCard({ letter, title, description, selected, className = '', ...props }: ChoiceCardProps) {
  return (
    <button
      className={`w-full text-left bg-surface border rounded-lg p-5 transition-all duration-300 hover:border-primary hover:shadow-[0_0_15px_var(--glow)] group relative z-10
        ${selected ? 'border-primary shadow-[0_0_15px_var(--glow)]' : 'border-border'}
        ${className}`}
      {...props}
    >
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-md bg-primary/20 border border-primary flex items-center justify-center text-primary uppercase tracking-wider">
          {letter}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="mb-2 text-foreground group-hover:text-primary transition-colors">
            {title}
          </h4>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}
