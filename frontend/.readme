# Project: Job Aggregator Frontend

This is the frontend for the Job Aggregator project, built with **React 19**, **TypeScript**, and **Vite**.

## Project Overview

-   **Purpose:** Aggregates job listings and provides user authentication (login/register) and profile management.
-   **Main Technologies:**
    -   **Framework:** React 19
    -   **Language:** TypeScript
    -   **Build Tool:** Vite
    -   **Routing:** React Router DOM (v7+)
    -   **API Client:** Axios
    -   **Styling:** CSS Modules and global CSS

## Architecture

-   `src/pages/`: Contains the main page components (Login, Register, Profile).
-   `src/services/`: Centralized API service functions using Axios.
-   `src/types/`: Shared TypeScript interfaces and types.
-   `src/App.tsx`: Main routing configuration.
-   `src/main.tsx`: Application entry point.

## Building and Running

### Development
```bash
npm run dev
```
Starts the Vite development server.

### Build
```bash
npm run build
```
Type-checks the project and builds it for production into the `dist/` directory.

### Linting
```bash
npm run lint
```
Runs ESLint to check for code quality and style issues.

### Preview
```bash
npm run preview
```
Locally previews the production build.

## Development Conventions

-   **TypeScript:** Always use TypeScript for all new files. Prefer explicit types for function parameters and return values.
-   **API Services:** Place all API-related logic in `src/services/`. Use the pre-configured Axios instance in `authService.ts` which includes a token interceptor.
-   **Types:** Define shared types in `src/types/auth.ts` or other relevant files in that directory.
-   **Styling:** Use CSS Modules (`*.module.css`) for component-specific styles to avoid global namespace collisions.
-   **Path Aliases:** Use the `@/` alias to refer to the `src/` directory (configured in `vite.config.ts`).
-   **Routing:** New routes should be added in `src/App.tsx`.
-   **State Management:** Currently uses standard React `useState` and `useEffect`.
-   **Interceptors:** The Axios instance in `src/services/authService.ts` automatically attaches the JWT token from `localStorage` to outgoing requests.

## Key Files

-   `package.json`: Dependencies and scripts.
-   `vite.config.ts`: Vite and path alias configuration.
-   `src/App.tsx`: Routing logic.
-   `src/services/authService.ts`: Axios configuration and authentication services.
-   `eslint.config.js`: Linting rules.
