---
name: react-frontend
description: Conventions for writing React frontend code in this project. Use when creating, modifying, or reviewing any React component, hook, or page in src/. Covers React 19 idioms, barrel imports from components/hooks index.ts, file placement, and folder structure.
---

# React Frontend Conventions (POC)

POC priorities: efficient, cleanly structured, uniform. Pick the simplest solution that works. Stack: React 19 + TypeScript strict + Vite + Tailwind CSS v4 + react-router + Dexie.

## React 19

- Automatic JSX runtime: import named hooks and types from `'react'`, e.g. `import { useState, type ReactNode } from 'react'`.
- Type props with an `interface`; extend the native attributes when wrapping an element (`interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>`); type children as `ReactNode`.
- Pass `ref` as a plain prop typed `Ref<HTMLElement>` in the props interface; keep `forwardRef` only when editing components that already use it.
- Handle async with `use`, `useActionState`, `useOptimistic`, `useTransition`, and form actions.
- Render loading/empty states via early `return` branches.
- Apply `React.memo` once a measured re-render problem exists.
- Define style variants as `Record<Variant, string>` constant maps; accept `className = ''` as the last prop and append it to the computed classes.

## Barrel Imports

Every consumer imports reusable code from the folder root:

```tsx
import { Button, EmptyState, formatDate } from '../components';
import { useOpenTasks, useTaskActions } from '../hooks';
```

New reusable component:

1. Create the file in `src/components/` (generic UI at root, feature-specific pieces in a subfolder like `tasks/` whose `index.ts` re-exports up).
2. Append the export to the root barrel: `export { MyWidget } from './tasks/MyWidget';` in `src/components/index.ts`.

New hook:

1. Create `src/hooks/useMyThing.ts` with a named function export, one hook per file.
2. Append `export { useMyThing } from './useMyThing';` to `src/hooks/index.ts`.

Pages in `src/pages/` are the exception: route entry points with `export default`, composed purely from hooks and components.

## Component Template

```tsx
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
```

## Component Organization

- Avoid functions returning components within page components. Instead, extract them into separate component files.
- Each component should be in its own file with a clear, descriptive name.
- Complex pages should be composed of multiple smaller, focused components rather than large functions returning JSX.

## Hooks

- Thin adapters over `db/taskRepository` or `dexie-react-hooks` (`useLiveQuery`).
- Normalize loading — `useLiveQuery` returns `undefined` until resolved: `return { data: data ?? [], isLoading: data === undefined };`
- Keep state logic in hooks; put pure logic in `src/domain/` as plain functions.

## Structure & Dependency Direction

```
src/
  components/   reusable UI — root index.ts barrel (subfolders re-export up)
  hooks/        custom hooks — index.ts barrel, one hook per file
  pages/        route components, default export
  domain/       pure business logic + types, framework-free, unit-tested
  db/           Dexie database + repository (sole db access point)
  test/         setup, TestData.ts, _mocks/
```

Dependencies flow one way: `pages → components/hooks → domain/db`. Use relative imports inside `src/`.

## Styling

Tailwind utility classes inline in JSX. Dark palette: `slate-*` text/backgrounds, `indigo-*` accents, `min-h-11` tap targets. User-facing copy in German.

## Tests

Mock hooks in `src/test/_mocks/hooks/<hook>.mock.ts` as `Partial`-typed `vi.spyOn`-based mocks exposed via the static `Mock` class in `src/test/_mocks/Mock.ts`. Build fixtures with `createTest...` methods in `src/test/TestData.ts`. Render pages with `renderWithRouter`. Run `npm test`.

## Comments

Comment complex mechanisms and edge cases on public APIs. Everything else is expressed through blank lines and small, well-named functions.
