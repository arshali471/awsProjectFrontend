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

## Design System & Shared Components

### Resource Page Pattern

All AWS resource pages (EC2, S3, RDS, Volumes) follow a **consistent 3-part layout**:

1. **Page Header**: Icon + title + subtitle
2. **Stats Cards**: 3 cards showing:
   - Total count (e.g., Total Instances, Total Buckets)
   - Total size/storage (in GB)
   - Filtered results count
3. **Search Bar**: Real-time filtering with search icon
4. **DataGrid Table**: MUI X DataGrid with CSV export button

**Shared CSS**: `src/component/View/Private/SharedPage.css` provides:
- `.page-wrapper` - Main page container with gradient background
- `.page-header` - Title section with icon
- `.stats-container` - Grid layout for stat cards
- `.stat-card` - Individual stat card with hover effects
- `.search-box` - Professional search input with icon
- `.table-container` - Table wrapper

All resource pages **must import** this file for consistency.

### Table Component Pattern

Tables are located in `src/component/Table/[ResourceName].table.tsx` and follow this structure:
- Use `@mui/x-data-grid` DataGrid component
- Include CSV export button (gradient-styled, top-right)
- Built-in pagination with options: 10, 25, 50, 100 rows
- Paper wrapper with `elevation={0}` and `borderRadius: '12px'`
- Props: `tableData: any[]`, `loading?: boolean`
- Export uses `file-saver` library

Example tables: `S3.table.tsx`, `Volumes.table.tsx`, `RDS.table.tsx`, `Instance.table.tsx`

### Dark Mode System

**Implementation:**
- Theme state: `src/component/context/ThemeContext.tsx`
- Dark mode CSS: `src/styles/darkmode.css`
- Toggle button: TopBar component (Moon/Sun icons)
- Persistence: localStorage with `data-theme="dark"` attribute

**CSS Variables:**
- Light mode: `src/index.css` (`:root` selectors)
- Dark mode: `src/styles/darkmode.css` (`[data-theme="dark"]` selectors)
- Variables include: `--bg-primary`, `--text-primary`, `--primary-color`, `--border-color`, etc.

Dark mode **must be tested** for all new components by checking:
- Text visibility (contrast)
- DataGrid readability
- Button states
- Border visibility

## Key Technical Details

- TypeScript strict mode is disabled (`strict: false` in tsconfig.json)
- Uses react-hot-toast for notifications
- Terminal functionality uses xterm library with fit addon
- Tables use Material-UI DataGrid (@mui/x-data-grid)
- Styling uses Bootstrap + custom CSS + MUI components
- Date handling with moment.js primarily
- CSV export via `file-saver` library

## Route Configuration Pattern

When adding new routes, follow the pattern in `iff.routes.tsx`:
- Set `navbarShow: true` for routes that should appear in the sidebar
- Use nested children array for grouped routes
- Include icon from react-icons library
- Register the route element component

## Common Patterns & Best Practices

### Adding a New Resource Page

1. Create page component in `src/component/View/Private/[ResourceName]/[ResourceName].tsx`
2. Import SharedPage.css: `import "../SharedPage.css"`
3. Use the 3-card stat pattern (Total Count, Total Size, Filtered Results)
4. Create table component in `src/component/Table/[ResourceName].table.tsx`
5. Add route to `src/component/routes/iff.routes.tsx`
6. Add API endpoint in `src/component/api/urls.tsx`
7. Create service method in `src/component/services/admin.service.tsx`

### ESLint Pattern for useEffect

When adding `useEffect` with dependencies, always add eslint-disable comment:
```tsx
useEffect(() => {
    if (selectedRegion?.value) {
        fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [selectedRegion?.value]);
```

### Data Fetching Pattern

All resource pages follow this pattern:
```tsx
const [data, setData] = useState<any[]>([]);
const [filteredData, setFilteredData] = useState<any[]>([]);
const [searchText, setSearchText] = useState<string>('');

const fetchData = async () => {
    setLoading(true);
    try {
        const res = await AdminService.getResource(selectedRegion.value);
        if (res.status === 200) {
            setData(res.data);
            setFilteredData(res.data);
        }
    } catch (error) {
        console.error("Error fetching data", error);
    }
    setLoading(false);
};

// Search filtering
useEffect(() => {
    if (searchText) {
        const filtered = data.filter(item =>
            String(item.field).toLowerCase().includes(searchText.toLowerCase())
        );
        setFilteredData(filtered);
    } else {
        setFilteredData(data);
    }
}, [searchText, data]);
```

### Total Size Calculation Pattern

```tsx
const totalSize = filteredData.reduce((acc: number, item: any) => {
    const size = parseInt(item?.size || 0);
    return acc + (isNaN(size) ? 0 : size);
}, 0);
```

## Troubleshooting

### Blank White Page Issues

If a page shows blank white screen:
1. Check browser console for errors
2. Verify all imports are correct (especially SharedPage.css)
3. Check useEffect dependencies - add eslint-disable comments
4. Ensure context providers are wrapping the component
5. Verify API responses are in expected format

### Dark Mode Not Working

1. Check `ThemeContext.tsx` is imported in `main.tsx`
2. Verify `darkmode.css` is imported in `main.tsx`
3. Ensure CSS variables are defined in both light and dark modes
4. Check `data-theme` attribute is set on `documentElement`

### DataGrid Pagination Issues

- Use `paginationModel` state with `onPaginationModelChange`
- Don't mix custom pagination with DataGrid's built-in pagination
- Use `autoHeight` prop for dynamic height
- Set `pageSizeOptions={[10, 25, 50, 100]}`

## Environment Variables

Required environment variables (create `.env` file):
```
VITE_REACT_APP_API_URL=<backend-api-url>
VITE_REACT_APP_API_VER=<api-version-path>
```
