import type { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  message?: string;
  children?: ReactNode;
}

export function EmptyState({ title, message, children }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <h2 className="text-xl font-semibold text-slate-200 mb-2">{title}</h2>
      {message && <p className="text-slate-400 mb-6">{message}</p>}
      {children && <div className="flex justify-center gap-3">{children}</div>}
    </div>
  );
}
