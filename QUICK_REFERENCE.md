# TrustChain Frontend - Quick Reference Guide

## Getting Started

### 1. Installation (5 minutes)
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Visit `http://localhost:5173`

### 2. Login
- Email: `demo@trustchain.com`
- Password: `demo123`

---

## Project Structure at a Glance

```
src/
├── pages/          # Route components
├── components/     # Reusable UI components
├── context/        # Global state (theme, toasts)
├── services/       # API client (axios)
├── hooks/          # Custom React hooks
├── utils/          # Helper functions
├── constants/      # Configuration
├── App.jsx         # Root component
└── index.css       # Tailwind + global styles
```

---

## Most Important Files

| File | Purpose | Key Function |
|------|---------|---------------|
| `App.jsx` | Routes & Auth | Protected routes, theme provider |
| `src/services/api.js` | API Client | Axios with interceptors |
| `src/context/ThemeContext.jsx` | Dark Mode | `useTheme()` hook |
| `src/context/ToastContext.jsx` | Notifications | `useToast()` hook |
| `tailwind.config.js` | Styling | Color theme, animations |

---

## Common Tasks

### Add a New Page
```jsx
// src/pages/NewPage.jsx
import { useToast } from '../context/ToastContext';

export default function NewPage() {
  const { success, error } = useToast();
  
  return <div>Content</div>;
}
```

Then add route in `App.jsx`:
```jsx
<Route path="/new-page" element={<NewPage />} />
```

### Show Toast Notification
```jsx
import { useToast } from '../context/ToastContext';

function MyComponent() {
  const { success, error } = useToast();
  
  return (
    <button onClick={() => success('Done!')}>
      Click Me
    </button>
  );
}
```

### Use Dark Mode
```jsx
import { useTheme } from '../context/ThemeContext';

function MyComponent() {
  const { isDark } = useTheme();
  
  return (
    <div className={isDark ? 'dark' : ''}>
      Dark or Light
    </div>
  );
}
```

### Make API Call
```jsx
import api from '../services/api';

const fetchData = async () => {
  try {
    const res = await api.get('/endpoint');
    console.log(res.data);
  } catch (err) {
    console.error(err.response?.data?.message);
  }
};
```

### Create Reusable Component
```jsx
// src/components/MyComponent.jsx
export default function MyComponent({ title, onClick }) {
  return (
    <div className="card p-6">
      <h3 className="text-lg font-bold">{title}</h3>
      <button className="btn-primary" onClick={onClick}>
        Action
      </button>
    </div>
  );
}
```

---

## Styling Cheat Sheet

### Common Classes
```jsx
// Layout
<div className="container-main">   {/* Max-width container */}
<div className="card">             {/* Card styling */}

// Buttons
<button className="btn-primary">   {/* Primary button */}
<button className="btn-secondary"> {/* Secondary button */}

// Text
<h1 className="text-3xl font-bold">  {/* Heading */}
<p className="text-gray-600">        {/* Body text */}

// Colors (Dark/Light)
className="text-light-text dark:text-dark-text"
className="bg-light-card dark:bg-dark-card"

// Responsive
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

### Theme Colors
```
Dark:  bg: #0B1E2D, accent: #3BAFDA, text: #E6F1FF
Light: bg: #F5F7FA, accent: #2563EB, text: #1F2937
```

---

## Debugging

### Check API Calls
- Open DevTools → Network tab
- Look for API requests
- Check response status and data

### Check Console Errors
- DevTools → Console tab
- Look for red errors
- Check Toast notifications

### Theme Not Working
- Clear localStorage: `localStorage.clear()`
- Reload page: `Ctrl+Shift+R`
- Check `darkMode: 'class'` in tailwind.config.js

### Not Logged In
- Check localStorage: `localStorage.getItem('token')`
- Verify backend login endpoint works
- Try demo credentials

---

## Available Hooks

```jsx
// Custom hooks in src/hooks/useCustom.js
useAsync(asyncFn)           // Async state management
useForm(initialValues)      // Form state & validation
useDebounce(value, delay)   // Debounce values
useLocalStorage(key, init)  // Persist to localStorage
useMediaQuery(query)        // Responsive media queries
useClickOutside(ref, cb)    // Detect outside clicks

// Context hooks
useTheme()                  // Dark/Light mode
useToast()                  // Notifications
```

---

## API Endpoints Used

```
POST   /auth/login                 → Login
GET    /products                   → Get all products
POST   /products/:id/accept        → Accept product
POST   /products/:id/ship          → Ship product
GET    /products/:id/events        → Get timeline
POST   /otp/verify/:id             → Verify OTP
GET    /users/trust/:id            → Get trust score
GET    /blockchain/verify/:id      → Verify on blockchain
```

---

## Environment Variables

```env
VITE_API_URL=http://localhost:3000/api
```

---

## npm Scripts

```bash
npm run dev      # Start dev server (hot reload)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Check code style
```

---

## Component Props Reference

### ProductCard
```jsx
<ProductCard 
  product={{id, name, status, trust_score, ...}}
  onUpdate={(updatedProduct) => {}}
/>
```

### TrustScore
```jsx
<TrustScore 
  score={85}           // 0-100
  size="md"            // sm, md, lg
/>
```

### StatusBadge
```jsx
<StatusBadge 
  status="in-transit"  // pending, accepted, etc.
/>
```

---

## Performance Tips

1. Use React DevTools Profiler for optimization
2. Check Network tab for large assets
3. Use lighthouse for performance audit
4. Keep components small and reusable
5. Avoid unnecessary state updates

---

## Deployment

### Build
```bash
npm run build
```

### Deploy to Vercel (Recommended)
```bash
npm i -g vercel
vercel --prod
```

### Deploy to Netlify
```bash
npm i -g netlify-cli
netlify deploy --prod --dir=dist
```

---

## Resources

- **React:** https://react.dev/
- **Vite:** https://vitejs.dev/
- **Tailwind:** https://tailwindcss.com/
- **Lucide Icons:** https://lucide.dev/
- **Axios:** https://axios-http.com/

---

## Need Help?

1. **Check SETUP_GUIDE.md** for detailed setup
2. **Read FRONTEND_README.md** for full documentation
3. **Review BUILD_SUMMARY.md** for what's implemented
4. **Look at component comments** in source files
5. **Check browser console** for error messages

---

**Last Updated:** April 2026
**Status:** Production-Ready ✅
