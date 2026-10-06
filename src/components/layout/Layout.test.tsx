import { describe, it, expect } from 'vitest';
import { Layout } from './Layout';
import { renderWithRouter } from '../../test/renderWithRouter';

describe('Layout', () => {
   it('renders AddTaskFab and BottomNav with Dashboard and Manage links', () => {
     const { getByRole, getByLabelText } = renderWithRouter(<Layout />, {
       route: '/',
       path: '/*',
     });

     expect(getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
     expect(getByLabelText('Add task')).toBeInTheDocument();
     expect(getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
     expect(getByRole('link', { name: 'Manage' })).toBeInTheDocument();
   });

   it('sets aria-current="page" on Dashboard for route /', () => {
     const { getByRole } = renderWithRouter(<Layout />, {
       route: '/',
       path: '/*',
     });

     const dashboardLink = getByRole('link', { name: 'Dashboard' });
     expect(dashboardLink).toHaveAttribute('aria-current', 'page');
   });

   it('sets aria-current="page" on Manage for route /settings', () => {
     const { getByRole } = renderWithRouter(<Layout />, {
       route: '/settings',
       path: '/*',
     });

     const manageLink = getByRole('link', { name: 'Manage' });
     expect(manageLink).toHaveAttribute('aria-current', 'page');
   });

   it('sets aria-current="page" on Dashboard for route /pick/quick', () => {
     const { getByRole } = renderWithRouter(<Layout />, {
       route: '/pick/quick',
       path: '/*',
     });

     const dashboardLink = getByRole('link', { name: 'Dashboard' });
     expect(dashboardLink).toHaveAttribute('aria-current', 'page');
   });
});
