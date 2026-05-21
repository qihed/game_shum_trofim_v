import * as RadixAccordion from '@radix-ui/react-accordion';
import { ChevronDown } from 'lucide-react';

interface AccordionItemProps {
  value: string;
  trigger: string;
  children: React.ReactNode;
}

export function AccordionItem({ value, trigger, children }: AccordionItemProps) {
  return (
    <RadixAccordion.Item value={value} className="border-b border-border">
      <RadixAccordion.Header>
        <RadixAccordion.Trigger className="flex items-center justify-between w-full py-4 text-left text-sm text-muted-foreground hover:text-primary transition-colors group">
          {trigger}
          <ChevronDown className="w-4 h-4 transition-transform duration-300 group-data-[state=open]:rotate-180" />
        </RadixAccordion.Trigger>
      </RadixAccordion.Header>
      <RadixAccordion.Content className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
        <div className="pb-4 text-sm text-foreground/80 space-y-2">
          {children}
        </div>
      </RadixAccordion.Content>
    </RadixAccordion.Item>
  );
}

interface AccordionProps {
  type?: 'single' | 'multiple';
  children: React.ReactNode;
  className?: string;
}

export function Accordion({ type = 'single', children, className = '' }: AccordionProps) {
  return (
    <RadixAccordion.Root type={type} className={className} collapsible>
      {children}
    </RadixAccordion.Root>
  );
}
