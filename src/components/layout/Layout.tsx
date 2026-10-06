import { Outlet } from 'react-router-dom';
import { AddTaskFab } from './AddTaskFab';
import { BottomNav } from './BottomNav';

export function Layout() {
  return (
    <div className="flex flex-col min-h-screen safe-inset">
      <main className="flex-1 mx-auto w-full max-w-md pb-24">
        <Outlet/>
      </main>
      <BottomNav/>
      <AddTaskFab/>
    </div>
  );
}
