# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an AWS management dashboard built with React + TypeScript + Vite. It provides a web interface for managing AWS resources including EC2 instances, S3 buckets, RDS databases, EKS clusters, and volumes. The application includes features for monitoring agent status (Zabbix), SSH terminal connections, and DevOps tool integrations.

## Development Commands

```bash
# Start development server with HMR
npm run dev

# Build for production (runs TypeScript compiler then Vite build)
npm run build

# Lint TypeScript/TSX files
npm run lint

# Preview production build
npm run preview
```

## Architecture

### Routing Structure

The application uses nested routing with two main route configurations:

1. **iffRoutes** (`src/component/routes/iff.routes.tsx`): Main application routes with platform-level resources (EC2, S3, RDS, Volumes, Agent Status)
2. **mainRoutes** (`src/component/routes/routes.tsx`): Legacy/alternative routes (less commonly used)

Routes are organized as:
- `/login` - Public authentication page
- `/dashboard` - Main IFF dashboard (landing page after login)
- `/platform/*` - AWS resource management pages (EC2, S3, RDS, Volumes)
- `/settings/*` - User management, AWS key management, EKS token management
- `/devops` - DevOps tools integration page
- `/eks` - Kubernetes cluster management
- `/terminal` - SSH terminal interface

### Authentication

Authentication is handled through `src/component/Auth/auth.tsx`:
- Uses sessionStorage with an "authKey" token
- PrivateRouter component wraps protected routes
- Redirects to `/login` for unauthenticated users

### API Layer

API configuration is centralized in `src/component/api/`:
- **urls.tsx**: All backend endpoint paths
- **makeRequest.tsx**: Axios wrapper that automatically adds Authorization headers from sessionStorage
- **requestMethode.tsx**: HTTP method utilities
- **uploadRequest.tsx**: File upload handling

Base URL is configured via environment variables:
- `VITE_REACT_APP_API_URL`: Backend API base URL
- `VITE_REACT_APP_API_VER`: API version path

### Context

Two main contexts are used application-wide (`src/component/context/context.tsx`):
- **SelectedRegionContext**: Manages AWS region selection across components
- **LoadingContext**: Global loading state management

### Component Organization

- **View/Private/**: Protected page components (Dashboard, S3, RDS, Volumes, etc.)
- **View/Public/**: Public pages (Login)
- **Table/**: Reusable table components for displaying AWS resources
- **modal/**: Modal dialogs for forms and confirmations
- **SideBar/**: Navigation sidebar
- **TopBar/**: Top navigation bar
- **Pagination/**: Table pagination component
- **Spinner/**: Loading spinner component

### Services

Service layer in `src/component/services/` handles business logic:
- **admin.service.tsx**: Admin and user management operations
- **auth.service.tsx**: Authentication operations

## Key Technical Details

- TypeScript strict mode is disabled (`strict: false` in tsconfig.json)
- Uses react-hot-toast for notifications
- Terminal functionality uses xterm library with fit addon
- Tables use Material-UI DataGrid (@mui/x-data-grid)
- Styling uses a mix of Bootstrap and custom CSS
- Date handling with date-fns and moment libraries

## Route Configuration Pattern

When adding new routes, follow the pattern in `iff.routes.tsx`:
- Set `navbarShow: true` for routes that should appear in the sidebar
- Use nested children array for grouped routes
- Include icon from react-icons library
- Register the route element component

## Environment Variables

Required environment variables (create `.env` file):
```
VITE_REACT_APP_API_URL=<backend-api-url>
VITE_REACT_APP_API_VER=<api-version-path>
```
