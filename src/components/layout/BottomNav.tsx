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
    <nav aria-label="Hauptnavigation" className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-800 pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-16">
        <Link
          to="/"
          aria-current={isActive('/') ? 'page' : undefined}
          className={`flex-1 flex items-center justify-center min-h-11 py-2 ${isActive('/') ? 'text-indigo-500 font-semibold' : 'text-slate-400 hover:text-slate-300'} focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500`}
        >
          Startseite
        </Link>
        <Link
          to="/manage"
          aria-current={isActive('/manage') ? 'page' : undefined}
          className={`flex-1 flex items-center justify-center min-h-11 py-2 ${isActive('/manage') ? 'text-indigo-500 font-semibold' : 'text-slate-400 hover:text-slate-300'} focus:outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500`}
        >
          Verwalten
        </Link>
      </div>
    </nav>
  );
}
