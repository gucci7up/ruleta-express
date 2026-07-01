import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, className, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={clsx(
          'font-semibold rounded-xl transition-all duration-150 active:scale-95 select-none',
          'disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100',
          {
            'bg-yellow-500 hover:bg-yellow-400 text-gray-950': variant === 'primary',
            'bg-red-600 hover:bg-red-500 text-white': variant === 'danger',
            'bg-green-600 hover:bg-green-500 text-white': variant === 'success',
            'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700': variant === 'ghost',
            'px-3 py-1.5 text-sm min-h-[36px]': size === 'sm',
            'px-5 py-3 text-base min-h-[48px]': size === 'md',
            'px-6 py-4 text-lg min-h-[56px]': size === 'lg',
          },
          className,
        )}
        {...props}
      >
        {loading ? (
          <span className="flex items-center gap-2 justify-center">
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            {children}
          </span>
        ) : children}
      </button>
    );
  },
);
Button.displayName = 'Button';
