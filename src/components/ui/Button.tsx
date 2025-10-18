import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-offset-2',
        'rounded-[20px]',
        {
          'h-9 px-4 text-sm': size === 'sm',
          'h-11 px-6 text-base': size === 'md',
          'h-14 px-8 text-lg': size === 'lg',
        },
        {
          'bg-brand-primary text-white hover:bg-brand-primary/90 focus:ring-brand-primary/50': variant === 'primary',
          'bg-brand-primary/10 text-brand-primary hover:bg-brand-primary/20 focus:ring-brand-primary/50': variant === 'secondary',
          'border-2 border-brand-primary bg-white text-brand-primary hover:bg-brand-tinted focus:ring-brand-primary/50': variant === 'outline',
          'text-brand-primary hover:bg-brand-tinted focus:ring-brand-primary/50': variant === 'ghost',
        },
        {
          'opacity-50 cursor-not-allowed': disabled || isLoading,
        },
        className
      )}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-3 h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
}