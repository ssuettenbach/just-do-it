import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface PageHeaderProps {
  title: string;
  actions?: ReactNode;
  backTo?: string;
}

export function PageHeader({ title, actions, backTo }: PageHeaderProps) {
  return (
    <header className="flex items-center justify-between mb-6">
       {backTo ? (
          <Link
            to={backTo}
            aria-label="Zurück"
            className="text-fg-muted hover:text-fg transition-colors"
          >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-6 h-6"
            aria-hidden="true"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </Link>
      ) : (
        <div aria-hidden="true" className="w-6" />
      )}
       <h1 className="text-xl font-semibold text-fg truncate">{title}</h1>
      {actions && <div className="flex gap-2">{actions}</div>}
    </header>
  );
}
