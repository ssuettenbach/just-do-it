import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
  secondary: 'bg-slate-700 text-slate-100 hover:bg-slate-600',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'text-slate-300 hover:text-slate-100 hover:bg-slate-800',
};

const sizeClasses: Record<ButtonSize, string> = {
  md: 'px-4 py-2 text-sm min-h-11',
  lg: 'px-6 py-3 text-base min-h-11',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    type = 'button',
    className = '',
    children,
    ...props
  },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      {...props}
      className={`rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-300 inline-flex items-center justify-center gap-2 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';
