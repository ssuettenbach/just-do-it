import { Link, useLocation } from 'react-router-dom';

export function AddTaskFab() {
  const location = useLocation();

  if (location.pathname === '/tasks/new') {
    return null;
  }

  return (
    <Link
      to="/tasks/new"
      aria-label="Aufgabe hinzufügen"
      className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] right-6 w-14 h-14 bg-accent rounded-full flex items-center justify-center text-accent-fg hover:bg-accent-hover transition-colors shadow-lg"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-7 h-7"
        aria-hidden="true"
      >
        <path d="M12 5v14M5 12h14"/>
      </svg>
    </Link>
  );
}
