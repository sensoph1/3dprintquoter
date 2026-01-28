# AGENTS.md

This file contains guidelines and commands for agentic coding agents working on this 3D pricing calculator project.

## Project Overview

This is a React + Vite application for 3D printing job costing and quotation management. The app uses:
- React 19 with functional components and hooks
- Vite for build tooling
- Tailwind CSS for styling
- Local storage for data persistence
- Supabase integration for potential backend features
- ESLint for code quality

## Development Commands

### Core Commands
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run lint` - Run ESLint for code quality checks
- `npm run preview` - Preview production build locally

### Testing
No test framework is currently configured. When adding tests, check for test scripts in package.json first.

## Code Style Guidelines

### File Structure & Naming
- Use `.jsx` extension for React components (not `.tsx` - no TypeScript)
- Components in `src/components/` directory
- Main entry point: `src/main.jsx`
- Global styles: `src/index.css`
- Use PascalCase for component names
- Use camelCase for variables and functions
- Use kebab-case for CSS class names where appropriate

### React Patterns
- Use functional components with React hooks
- Prefer `const` for component declarations
- Use arrow functions for components
- Destructure props in function parameters: `({ job, setJob, library }) => {`
- Use spread operator for state updates: `setJob({ ...job, [field]: val })`
- Initialize state with functions for expensive computations: `useState(() => { ... })`

### Import Organization
1. React imports first
2. External library imports (lucide-react, etc.)
3. Internal component imports
4. No unused imports (ESLint rule configured)

```jsx
import React, { useState } from 'react';
import { Calculator, Settings } from 'lucide-react';
import CalculatorTab from './components/CalculatorTab';
import FilamentTab from './components/FilamentTab';
```

### Styling Guidelines
- Use Tailwind utility classes extensively
- Custom CSS only for complex layout patterns (see `.studio-cockpit` in index.css)
- Follow existing custom class patterns: `.rounded-studio`, `.left-workbench`, `.right-engine`
- Use consistent spacing: `gap-8`, `gap-6`, `gap-4`
- Apply consistent color scheme: blue (#1e60ff, #3b82f6), slate (#64748b, #f8fafc)
- Font: Inter family with various weights (400, 700, 800, 900)

### State Management Patterns
- Local component state with `useState`
- Lift state to parent components when sharing between siblings
- Use localStorage for persistence:
  ```jsx
  const [library, setLibrary] = useState(() => {
    const saved = localStorage.getItem('studio_db');
    return saved ? JSON.parse(saved) : defaultData;
  });
  ```
- Create save functions that update both state and localStorage

### Data Structures
- Use arrays for collections: `filaments`, `printers`, `materials`
- Use numeric IDs with `parseInt()` when working with form values
- Include default fallback values: `|| library.filaments[0]`
- Use descriptive property names: `laborMinutes`, `shopHourlyRate`, `kwhRate`

### Form Handling
- Use controlled components with value/onChange patterns
- Parse numbers safely: `parseFloat(e.target.value) || 0`
- Use parseInt for integers: `parseInt(e.target.value) || 1`
- Update nested objects with helper functions: `updateMat(index, field, val)`

### Error Handling
- Use fallback values for data lookups
- Provide default objects when array methods might fail
- Use try-catch for localStorage operations when appropriate

### ESLint Configuration
- Uses flat config format
- Extends recommended, react-hooks, and react-refresh configs
- Special rule: unused vars starting with uppercase are ignored (`^[A-Z_]`)
- Target: browser, ES2020+, JSX, modules

## Component Patterns

### Tab Structure
- Main app uses `activeTab` state for navigation
- Tab content rendered conditionally from `activeTab` value
- Tab names: 'calculator', 'materials', 'hardware', 'ledger', 'settings'

### Input Components
- Standard input height: 44px with rounded corners (0.75rem)
- Consistent label styling: uppercase, tracking, slate color
- Shadow effects on inputs for depth
- White background for inputs

### Layout Patterns
- Max-width containers: `max-w-[1600px]` for main content
- Grid layouts for forms: `grid-cols-2`, `grid-cols-3`
- Flexible layouts with flexbox
- Responsive design with Tailwind breakpoints

## Performance Considerations
- Use React.memo for expensive components (not currently implemented)
- Avoid unnecessary re-renders when updating localStorage
- Use function initializers for expensive state calculations
- Consider virtualization for long lists in future

## Browser Compatibility
- Targets modern browsers (ES2020+)
- Uses modern React features (createRoot, strict mode)
- Inter font loaded from Google Fonts with display=swap

## Adding New Features
1. Check if similar functionality exists in components
2. Follow existing naming conventions
3. Add to appropriate tab if extending current UI
4. Update localStorage structure if changing data model
5. Run `npm run lint` before committing
6. Test in development server with `npm run dev`

## Known Issues & Technical Debt
- No TypeScript configured (uses .jsx files)
- No testing framework
- Some commented-out code in App.jsx for other tabs
- App.css contains unused Vite template styles
- No error boundaries for React error handling

## Security Notes
- No authentication currently implemented (Supabase client imported but unused)
- Local storage used for data persistence (client-side only)
- No input validation beyond basic type parsing
- Consider adding CSRF protection if forms submit to backend