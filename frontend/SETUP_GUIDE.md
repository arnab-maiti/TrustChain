# TrustChain Frontend - Installation & Setup Guide

## Quick Start

### 1. Prerequisites
- **Node.js**: v16 or higher
- **npm**: v7 or higher (or yarn)
- **Backend**: TrustChain backend running on `http://localhost:3000`

### 2. Install Dependencies

```bash
cd frontend
npm install
```

This installs all required packages including:
- React 19
- Vite
- Tailwind CSS
- Axios
- React Router
- Lucide Icons

### 3. Environment Setup

Create `.env` file:

```bash
cp .env.example .env
```

Update `.env` with your API URL (if different from default):

```env
VITE_API_URL=http://localhost:3000/api
```

### 4. Start Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## Architecture Overview

### Component Hierarchy

```
App
├── ThemeProvider (Context)
│   └── ToastProvider (Context)
│       ├── Navbar
│       └── Routes
│           ├── Login
│           ├── Dashboard
│           │   └── ProductCard (×N)
│           │       ├── TrustScore
│           │       └── StatusBadge
│           ├── Verify
│           ├── Timeline
│           └── CheckTrust
```

### Data Flow

1. **Authentication**
   - User logs in → Token stored in localStorage
   - Token attached to all API requests via Axios interceptor
   - Unauthorized responses redirect to login

2. **Products**
   - Fetch from `/products` endpoint
   - Display in grid layout
   - Update status with action buttons
   - View timeline for each product

3. **Theme**
   - Dark/Light mode toggle in Navbar
   - Persisted in localStorage
   - Applies to entire app via Tailwind CSS `dark:` classes

4. **Notifications**
   - Toast messages managed globally via Context
   - Auto-dismiss after 3 seconds
   - Types: success, error, warning, info

---

## File Structure Explained

### `src/pages/` - Page Components
- **Dashboard.jsx** - Main product listing page
- **Login.jsx** - Authentication page
- **Verify.jsx** - Blockchain verification
- **Timeline.jsx** - Product event history
- **CheckTrust.jsx** - Courier trust score lookup

### `src/components/` - Reusable Components
- **Navbar.jsx** - Navigation with theme toggle
- **ProductCard.jsx** - Product display with actions
- **TrustScore.jsx** - Circular progress indicator
- **StatusBadge.jsx** - Status color indicator
- **Toast.jsx** - Notification display
- **Skeleton.jsx** - Loading skeleton
- **EmptyState.jsx** - Empty state UI

### `src/context/` - Global State
- **ThemeContext.jsx** - Dark/Light mode management
- **ToastContext.jsx** - Notification system

### `src/services/` - API Layer
- **api.js** - Axios instance with interceptors

### `src/hooks/` - Custom Hooks
- **useCustom.js** - Reusable React hooks

### `src/utils/` - Utilities
- **helpers.js** - Utility functions

### `src/constants/` - Configuration
- **config.js** - App constants and settings

---

## Key Features Implementation

### 1. Dark/Light Mode Toggle

Located in `src/context/ThemeContext.jsx`:

```jsx
import { useTheme } from './context/ThemeContext';

function MyComponent() {
  const { isDark, toggleTheme } = useTheme();
  
  return (
    <div className={isDark ? 'dark' : ''}>
      <button onClick={toggleTheme}>Toggle Theme</button>
    </div>
  );
}
```

Styling uses Tailwind CSS `dark:` prefix:
```html
<div class="bg-white dark:bg-gray-900">
  Light background in light mode, dark background in dark mode
</div>
```

### 2. Toast Notifications

Located in `src/context/ToastContext.jsx`:

```jsx
import { useToast } from './context/ToastContext';

function MyComponent() {
  const { success, error, info, warning } = useToast();
  
  return (
    <button onClick={() => success('Operation successful!')}>
      Show Success
    </button>
  );
}
```

### 3. Product Actions

Located in `src/components/ProductCard.jsx`:

- **Accept**: Status: pending → accepted
- **Ship**: Status: accepted → in-transit
- **Verify OTP**: Status: in-transit → delivered
- **View Timeline**: Navigate to `/timeline/:id`

### 4. Authentication Flow

1. User enters credentials in Login page
2. API call to `/auth/login`
3. Token stored in localStorage
4. Redirect to Dashboard
5. Token auto-attached to all requests
6. 401 response → Logout & redirect to Login

### 5. Protected Routes

Implemented in `App.jsx` with `ProtectedRoute` component:

```jsx
<Route
  path="/"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>
```

---

## Styling Guide

### Tailwind CSS Setup

Configuration in `tailwind.config.js`:

- **Custom Colors**: Defined in `theme.extend.colors`
- **Dark Mode**: `darkMode: 'class'` enables dark mode toggle
- **Custom Components**: Using `@layer components` in `index.css`

### Color System

**Dark Mode (Default)**
```css
--bg: #0B1E2D
--card: #112B3C
--accent: #3BAFDA
--text: #E6F1FF
```

**Light Mode**
```css
--bg: #F5F7FA
--card: #FFFFFF
--accent: #2563EB
--text: #1F2937
```

### Using Colors

```jsx
{/* Tailwind classes */}
<div className="bg-light-bg dark:bg-dark-bg text-light-text dark:text-dark-text">
  Content
</div>

{/* Or with CSS variables in dark mode */}
<div className="dark:bg-dark-card">
  Content
</div>
```

### Animations

Pre-defined in `tailwind.config.js`:
- `animate-fadeIn` - Fade in effect (0.3s)
- `animate-slideUp` - Slide up effect (0.4s)
- `animate-pulse-subtle` - Subtle pulse (2s)

Usage:
```jsx
<div className="animate-fadeIn">
  Content fades in
</div>
```

---

## API Integration

### Base Configuration

File: `src/services/api.js`

```javascript
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  timeout: 10000,
});
```

### Request Interceptor

Automatically adds JWT token:

```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Response Interceptor

Handles errors globally:

```javascript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Making API Calls

```jsx
import api from '../services/api';

const fetchProducts = async () => {
  try {
    const res = await api.get('/products');
    console.log(res.data.data); // Products array
  } catch (err) {
    console.error(err.response?.data?.message);
  }
};
```

---

## Deployment

### Build for Production

```bash
npm run build
```

Creates `dist/` folder with optimized build.

### Preview Production Build

```bash
npm run preview
```

Test production build locally at `http://localhost:4173`.

### Deploy to Hosting

**Option 1: Vercel (Recommended)**
```bash
npm i -g vercel
vercel
```

**Option 2: Netlify**
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

**Option 3: Traditional Hosting**
1. Copy `dist/` contents to web server
2. Configure server to serve `index.html` for all routes
3. Update API URL in environment variables

### Environment Variables for Production

Create `.env.production`:

```env
VITE_API_URL=https://api.yourdomain.com/api
```

---

## Common Issues & Solutions

### Issue: API 404 Errors

**Solution:**
- Verify backend is running on correct port
- Check `VITE_API_URL` in `.env`
- Inspect Network tab in DevTools

### Issue: Dark Mode Not Working

**Solution:**
- Clear browser cache and localStorage
- Verify `ThemeProvider` wraps entire app
- Check `darkMode: 'class'` in Tailwind config

### Issue: Token Not Persisting

**Solution:**
- Check localStorage is enabled
- Verify token is being saved in login handler
- Check interceptor adds token to headers

### Issue: CORS Errors

**Solution:**
- Backend must have CORS enabled
- Check allowed origins in backend config
- Verify API URL matches backend domain

### Issue: Blank Page / 401 Loop

**Solution:**
- Check if user is logged in (check localStorage)
- Verify token is valid and not expired
- Check backend auth endpoint responds correctly

---

## Performance Optimization Tips

1. **Code Splitting**
   ```jsx
   const Dashboard = lazy(() => import('./pages/Dashboard'));
   ```

2. **Image Optimization**
   - Use modern formats (WebP)
   - Serve responsive images
   - Lazy load images below fold

3. **Memoization**
   ```jsx
   const MemoizedComponent = memo(MyComponent);
   ```

4. **State Management**
   - Keep state as close to usage as possible
   - Use Context only for global state
   - Avoid unnecessary re-renders

5. **CSS**
   - Tailwind automatically removes unused CSS
   - Build output is ~30KB gzipped

---

## Development Workflow

### Adding a New Feature

1. **Create component** in `src/components/`
2. **Create hook** if needed in `src/hooks/`
3. **Add utility** if needed in `src/utils/`
4. **Add constants** if needed in `src/constants/`
5. **Use in page** from `src/pages/`
6. **Test** with `npm run dev`
7. **Build** with `npm run build`

### Code Standards

- **Components**: PascalCase (ProductCard.jsx)
- **Files**: camelCase or kebab-case
- **Functions**: camelCase (handleSubmit)
- **Constants**: UPPER_SNAKE_CASE
- **Styling**: Tailwind utility classes

### ESLint

```bash
npm run lint
```

Catches common issues and enforces code style.

---

## Troubleshooting Checklist

- [ ] Node.js version is 16+
- [ ] All dependencies installed (`npm install`)
- [ ] `.env` file created with `VITE_API_URL`
- [ ] Backend is running and accessible
- [ ] No console errors in DevTools
- [ ] Token exists in localStorage after login
- [ ] API requests shown in Network tab
- [ ] Dark mode toggle works in Navbar

---

## Resources

- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Documentation](https://react.dev/)
- [Lucide Icons](https://lucide.dev/)
- [Axios](https://axios-http.com/)

---

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review code comments in component files
3. Check browser DevTools Console for errors
4. Review Backend API documentation
