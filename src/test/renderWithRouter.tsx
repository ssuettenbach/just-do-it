import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { userEvent } from '@testing-library/user-event';
import type { ReactElement } from 'react';

interface RenderWithRouterOptions {
  route?: string;
  path?: string;
}

export function renderWithRouter(ui: ReactElement, { route = '/', path }: RenderWithRouterOptions = {}) {
  const wrapper = path ? (
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path={path} element={ui} />
      </Routes>
    </MemoryRouter>
  ) : (
    <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
  );

  const user = userEvent.setup();
  return { user, ...render(wrapper) };
}
