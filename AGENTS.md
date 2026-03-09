# AGENTS.md - Bodo Development Guide

## Project Overview

Bodo is a TanStack Start application using React 19, TypeScript, Bun, and Vite. It features Convex backend, TanStack Router for file-based routing, Tailwind CSS v4, Shadcn/ui components, and Better Auth for authentication.

## Build Commands

### Development

```bash
bun run dev          # Start development server
bun --bun run dev    # Run with bun binary directly
```

### Production

```bash
bun run build        # Build for production
bun --bun run build  # Run with bun binary directly
```

### Testing

```bash
bun run test                    # Run all tests with Vitest
bun run test --watch            # Run tests in watch mode
bun run test src/specific.test.ts # Run a single test file
bun --bun vitest run src/foo.test.ts  # Alternative: run single test
```

### Linting & Formatting

```bash
bun run lint        # Run Biome linting
bun run format      # Format code with Biome
bun run check       # Run Biome check (lint + import sorting)
```

### Convex (Backend)

```bash
bunx --bun convex dev  # Start Convex dev server
```

### Shadcn/ui Components

```bash
bunx shadcn@latest add button  # Add new component (uses bun)
```

---

## Code Style Guidelines

### General Principles

- Use TypeScript for all files (`.ts` or `.tsx`)
- Prefer functional components with hooks
- Keep components small and focused
- Use explicit typing over `any`

### Formatting (Biome)

The project uses Biome with the following settings:

- **Indentation**: Tabs (not spaces)
- **Quotes**: Double quotes
- **Semicolons**: Yes
- **Trailing commas**: All

Run `bun run format` before committing. Configure your editor to format on save.

### Imports

Organize imports in the following order (Biome does this automatically):

1. Node built-ins (e.g., `path`, `fs`)
2. External libraries (e.g., `@tanstack/react-router`, `react`)
3. Internal modules (e.g., `../components`, `./lib`)
4. Relative imports (e.g., `./utils`)

```typescript
// Example import order
import { useState, useEffect } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { LocalWhiteboardCanvas } from "../components/canvas/LocalWhiteboardCanvas";
import { cn } from "../lib/utils";
import type { Board } from "../types";
```

Use path aliases defined in `tsconfig.json`:

- `#/components` → `src/components`
- `#/lib` → `src/lib`
- `#/hooks` → `src/hooks`
- `#/components/ui` → `src/components/ui`

### Naming Conventions

- **Components**: PascalCase (e.g., `LocalWhiteboardCanvas`)
- **Hooks**: camelCase starting with `use` (e.g., `useAuth`, `useBoard`)
- **Utility functions**: camelCase (e.g., `cn`, `formatDate`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `MAX_UPLOAD_SIZE`)
- **Types/Interfaces**: PascalCase (e.g., `Board`, `User`)
- **Files**: kebab-case for routes (e.g., `board.$boardId.tsx`), PascalCase for components

### File Organization

```
src/
├── components/       # React components
│   ├── ui/           # Shadcn/ui components
│   └── canvas/       # Feature-specific components
├── hooks/            # Custom React hooks
├── lib/              # Utilities (auth, utils, etc.)
├── routes/           # TanStack Router file-based routes
└── integrations/     # Third-party integrations
```

### TypeScript Guidelines

- Use explicit return types for exported functions
- Prefer interfaces over types for object shapes
- Use `type` for unions, primitives, and mapped types
- Never use `any` - use `unknown` if type is truly unknown

```typescript
// Good
interface Board {
  id: string;
  name: string;
  createdAt: number;
}

function getBoard(id: string): Promise<Board | null> {
  // ...
}

// Avoid
function getBoard(id: string): any {
  // ...
}
```

### React Patterns

- Destructure props when possible
- Use functional components exclusively
- Keep `useState` initializers simple (lazy init for expensive operations)
- Memoize expensive computations with `useMemo`
- Memoize callbacks with `useCallback` when passed to child components

```typescript
// Good component pattern
interface ButtonProps {
  onClick: () => void
  children: React.ReactNode
}

export function Button({ onClick, children }: ButtonProps) {
  return (
    <button onClick={onClick} className="btn">
      {children}
    </button>
  )
}
```

### Error Handling

- Use try/catch for async operations
- Handle errors gracefully with user feedback
- Log errors appropriately for debugging

```typescript
// Good error handling
async function fetchBoard(id: string) {
  try {
    const board = await convex.query("boards:get", { id });
    return board;
  } catch (error) {
    console.error("Failed to fetch board:", error);
    return null;
  }
}
```

### Tailwind CSS

- Use Tailwind utility classes in components
- Use `cn()` utility for conditional classes (from `lib/utils.ts`)
- Follow Shadcn/ui patterns for component styling
- Use dark mode classes: `dark:bg-[#1e1e1e]`

```typescript
import { cn } from '../lib/utils'

<div className={cn(
  'flex items-center',
  isActive && 'bg-primary',
  className
)} />
```

---

## Database & Backend (Convex)

### Schema Definition

Use `defineSchema` and `defineTable` from `convex/server`:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  boards: defineTable({
    name: v.string(),
    ownerId: v.id("users"),
  }).index("ownerId", ["ownerId"]),

  users: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
  }),
});
```

### Validators

Use `v` from `convex/values`:

- `v.string()`, `v.number()`, `v.boolean()`
- `v.id("tableName")` for references
- `v.optional(v.string())` for optional fields
- `v.union()` for discriminated unions

---

## Testing

This project uses Vitest. Create test files with `.test.ts` or `.test.tsx` extension.

```typescript
import { describe, it, expect } from "vitest";

describe("utility function", () => {
  it("should format date correctly", () => {
    expect(formatDate(1700000000000)).toBe("2023-11-15");
  });
});
```

Run tests: `bun run test`

---

## Additional Notes

### Environment Variables

Create a `.env.local` file with:

```
VITE_CONVEX_URL=your_convex_url
CONVEX_DEPLOYMENT=your_deployment
BETTER_AUTH_SECRET=your_secret
DATABASE_URL=your_database_url
```

### Cursor Rules

See `.cursorrules` for Convex-specific guidance and shadcn/ui installation instructions.

---

## Quick Reference

| Task          | Command                              |
| ------------- | ------------------------------------ |
| Start dev     | `bun run dev`                        |
| Build         | `bun run build`                      |
| Test          | `bun run test`                       |
| Lint          | `bun run lint`                       |
| Format        | `bun run format`                     |
| Add component | `bunx shadcn@latest add <component>` |
