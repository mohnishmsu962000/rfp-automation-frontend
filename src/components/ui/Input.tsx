import React from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', label, error, helperText, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="text-sm font-medium text-foreground">
            {label}
            {props.required && <span className="text-brand-primary ml-1">*</span>}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'flex h-14 w-full rounded-[12px] border-2 border-brand-primary bg-white px-4 py-4',
            'text-base placeholder:text-gray-400 font-normal',
            'focus:outline-none focus:ring-0 focus:border-brand-primary',
            'transition-colors',
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100',
            error && 'border-red-400 focus:border-red-500',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        {helperText && !error && (
          <p className="text-sm text-gray-500">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;