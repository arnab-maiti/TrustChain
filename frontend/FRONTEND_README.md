# TrustChain Frontend

A production-level React frontend for a blockchain-based supply chain system built with Vite, Tailwind CSS, and modern best practices.

## Features

- 🎨 **Beautiful UI** - Clean, minimal design with dark/light mode toggle
- 📱 **Fully Responsive** - Mobile-first design that works on all devices
- ⚡ **Fast & Lightweight** - Built with Vite for instant HMR and optimized builds
- 🔒 **Secure** - JWT token-based authentication
- 🌙 **Dark Mode** - Automatic theme detection with localStorage persistence
- 📊 **Real-time Updates** - Smooth UI updates with loading states
- 🎯 **Type-Safe** - Component-based architecture with reusable components
- 🚀 **Production-Ready** - Error handling, toast notifications, and skeleton loading

## Tech Stack

- **React 19** - Latest React with hooks
- **Vite** - Next-generation build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client with interceptors
- **React Router** - Client-side routing
- **Lucide Icons** - Beautiful SVG icons

## Project Structure

```
frontend/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Navbar.jsx      # Navigation with theme toggle
│   │   ├── ProductCard.jsx # Product card with actions
│   │   ├── StatusBadge.jsx # Status indicator
│   │   ├── TrustScore.jsx  # Circular progress indicator
│   │   ├── Toast.jsx       # Toast notifications
│   │   ├── Skeleton.jsx    # Loading skeletons
│   │   └── EmptyState.jsx  # Empty state UI
│   ├── context/            # React Context providers
│   │   ├── ThemeContext.jsx # Dark/light mode
│   │   └── ToastContext.jsx # Toast notification system
│   ├── pages/              # Page components
│   │   ├── Dashboard.jsx   # Product list
│   │   ├── Verify.jsx      # Blockchain verification
│   │   ├── Timeline.jsx    # Event timeline
│   │   ├── CheckTrust.jsx  # Trust score lookup
│   │   └── Login.jsx       # Authentication
│   ├── services/           # API service
│   │   └── api.js          # Axios instance with interceptors
│   ├── App.jsx             # Main app component
│   ├── main.jsx            # Entry point
│   └── index.css           # Tailwind CSS + global styles
├── tailwind.config.js      # Tailwind configuration
├── postcss.config.js       # PostCSS configuration
├── vite.config.js          # Vite configuration
├── package.json            # Dependencies
└── index.html              # HTML template
```

## Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Setup

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Create environment file:**
```bash
cp .env.example .env
```

3. **Update API URL (if needed):**
```env
VITE_API_URL=http://localhost:3000/api
```

## Development

### Start development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build for production:
```bash
npm run build
```

### Preview production build:
```bash
npm run preview
```

### Lint code:
```bash
npm run lint
```

## Color Theme

### Dark Mode (Default)
- **Background**: #0B1E2D (Deep Navy Blue)
- **Cards**: #112B3C
- **Accent**: #3BAFDA (Soft Cyan-Blue)
- **Success**: #22C55E
- **Warning**: #F59E0B
- **Error**: #EF4444
- **Text**: #E6F1FF

### Light Mode
- **Background**: #F5F7FA (Light Bluish-Gray)
- **Cards**: #FFFFFF
- **Accent**: #2563EB (Blue)
- **Text**: #1F2937

## Authentication

The frontend uses JWT token-based authentication:

1. Login credentials are sent to `/auth/login`
2. Token is stored in `localStorage`
3. Token is automatically attached to all API requests via Axios interceptor
4. Users are redirected to login if token is missing

## Pages

### Dashboard (`/`)
- Displays all products in a grid
- Shows product name, status, and trust score
- Quick action buttons:
  - Accept
  - Out for Delivery
  - Verify OTP
- View timeline for each product
- Refresh and stats cards

### Verify (`/verify`)
- Enter product ID to verify authenticity
- Shows blockchain verification result
- Displays transaction hash and verification timestamp
- Error handling for invalid products

### Timeline (`/timeline/:id`)
- Vertical timeline of product events
- Event type, actor, timestamp, and notes
- Color-coded event types with icons
- Latest event badge
- Back navigation

### Check Trust (`/check-trust`)
- Search for courier by ID
- Display trust score with circular progress
- Show trust level (Excellent/Good/Fair/Poor)
- Display delivery statistics
- Success rate percentage

### Login (`/login`)
- Email and password authentication
- Show/hide password toggle
- Demo account for testing
- Loading states and error handling
- Redirect to dashboard on success

## Components

### Navbar
- Logo with gradient background
- Navigation links with active states
- Theme toggle (Moon/Sun icon)
- Logout button
- Mobile responsive menu

### ProductCard
- Product information (name, ID, category, location)
- Trust score circular indicator
- Status badge with color coding
- Action buttons based on product status
- OTP verification input
- Timeline link

### TrustScore
- Circular progress indicator
- Color-based on score (Green > 75, Yellow 50-74, Red < 50)
- Configurable sizes (sm, md, lg)
- Smooth animations

### StatusBadge
- Color-coded status display
- Supports: pending, in-transit, delivered, verified, failed
- Dark/light mode support

### Toast Notifications
- Auto-dismiss after 3 seconds
- Types: success, error, warning, info
- Slide-up animation
- Close button

## API Integration

### Endpoints Used

#### Products
- `GET /api/products` - Fetch all products
- `POST /api/products/:id/accept` - Accept product
- `POST /api/products/:id/ship` - Mark as shipped
- `GET /api/products/:id/events` - Get product timeline

#### Authentication
- `POST /api/auth/login` - User login

#### OTP
- `POST /api/otp/verify/:id` - Verify OTP

#### Trust Score
- `GET /api/users/trust/:id` - Get user trust score

#### Blockchain
- `GET /api/blockchain/verify/:id` - Verify product on blockchain

## Customization

### Adding New Pages
1. Create new file in `src/pages/`
2. Add route in `App.jsx`
3. Use `useToast()` for notifications
4. Use `useTheme()` for theme access

### Styling
- Use Tailwind utility classes
- Custom colors defined in `tailwind.config.js`
- Component-level Tailwind classes in `@layer components`
- Dark mode uses `dark:` prefix

### Adding New Components
1. Create in `src/components/`
2. Use reusable patterns from existing components
3. Accept props for flexibility
4. Use Lucide icons for consistency

## Performance Optimizations

- Code splitting with React Router
- Image optimization
- Lazy loading with React.lazy()
- CSS minification via Tailwind
- Efficient re-renders with proper key usage
- Axios request caching via interceptors

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Troubleshooting

### API Connection Issues
- Verify backend is running on `http://localhost:3000`
- Check `VITE_API_URL` in `.env` file
- Open DevTools > Network tab to inspect requests

### Dark Mode Not Working
- Clear browser cache and localStorage
- Check `ThemeContext` is properly wrapped in `App.jsx`
- Verify Tailwind `darkMode: 'class'` in config

### Build Errors
- Delete `node_modules` and reinstall: `npm install`
- Clear Vite cache: `rm -rf node_modules/.vite`
- Check Node.js version: `node --version`

## Contributing

1. Follow the existing code structure
2. Use Tailwind CSS for styling
3. Create reusable components
4. Add proper error handling
5. Use toast notifications for user feedback

## License

MIT License - See LICENSE file for details
