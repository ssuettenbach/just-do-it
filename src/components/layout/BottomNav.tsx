import { Link, useLocation } from 'react-router-dom';

export function BottomNav() {
  const location = useLocation();

  const isActive = (path: string): boolean => {
    if (path === '/') {
      return location.pathname === '/' || location.pathname.startsWith('/pick/');
    }
    if (path === '/manage') {
      return location.pathname.startsWith('/manage') || location.pathname === '/settings';
    }
    return location.pathname === path;
  };

  return (
     <nav aria-label="Hauptnavigation" className="fixed bottom-0 left-0 right-0 bg-surface-alt border-t border-border-subtle pb-[env(safe-area-inset-bottom)]">
       <div className="flex justify-around items-center h-16">
         <Link
           to="/"
           aria-current={isActive('/') ? 'page' : undefined}
           className={`flex-1 flex items-center justify-center min-h-11 py-2 ${isActive('/') ? 'text-accent-text font-semibold' : 'text-fg-muted hover:text-fg-soft'} focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus`}
         >
           Dashboard
         </Link>
         <Link
           to="/manage"
           aria-current={isActive('/manage') ? 'page' : undefined}
           className={`flex-1 flex items-center justify-center min-h-11 py-2 ${isActive('/manage') ? 'text-accent-text font-semibold' : 'text-fg-muted hover:text-fg-soft'} focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus`}
         >
           Alle Aufgaben
         </Link>
      </div>
    </nav>
  );
}
