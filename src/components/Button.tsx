import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from 'react';

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
type ButtonSize = 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-accent text-accent-fg hover:bg-accent-hover',
  secondary: 'bg-surface-muted text-fg hover:bg-surface-strong',
  danger: 'bg-red-600 text-white hover:bg-red-700',
  ghost: 'text-fg-soft hover:text-fg hover:bg-surface',
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
      className={`rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus inline-flex items-center justify-center gap-2 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
});

Button.displayName = 'Button';
