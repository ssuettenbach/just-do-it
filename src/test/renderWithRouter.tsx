import { render } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { ReactElement } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

interface RenderWithRouterOptions {
  route?: string;
  path?: string;
}

export function renderWithRouter(ui: ReactElement, {route = '/', path}: RenderWithRouterOptions = {}) {
  const wrapper = path ? (
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path={path} element={ui}/>
      </Routes>
    </MemoryRouter>
  ) : (
    <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
  );

  const user = userEvent.setup();
  return {user, ...render(wrapper)};
}
