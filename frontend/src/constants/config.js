// Color palette
export const COLORS = {
  // Dark mode
  dark: {
    bg: '#0B1E2D',
    card: '#112B3C',
    accent: '#3BAFDA',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    text: '#E6F1FF',
  },
  // Light mode
  light: {
    bg: '#F5F7FA',
    card: '#FFFFFF',
    accent: '#2563EB',
    success: '#22C55E',
    warning: '#F59E0B',
    error: '#EF4444',
    text: '#1F2937',
  },
};

// Status options
export const STATUS_OPTIONS = [
  { label: 'Pending', value: 'pending', color: 'yellow' },
  { label: 'Accepted', value: 'accepted', color: 'blue' },
  { label: 'In Transit', value: 'in-transit', color: 'cyan' },
  { label: 'Delivered', value: 'delivered', color: 'green' },
  { label: 'Verified', value: 'verified', color: 'emerald' },
  { label: 'Failed', value: 'failed', color: 'red' },
];

// Event types
export const EVENT_TYPES = {
  CREATED: 'created',
  ACCEPTED: 'accepted',
  OUT_FOR_DELIVERY: 'out_for_delivery',
  IN_TRANSIT: 'in_transit',
  OTP_GENERATED: 'otp_generated',
  OTP_VERIFIED: 'otp_verified',
  DELIVERED: 'delivered',
};

// Toast duration (ms)
export const TOAST_DURATION = {
  SHORT: 2000,
  NORMAL: 3000,
  LONG: 5000,
};

// API timeout (ms)
export const API_TIMEOUT = 10000;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
};

// Trust score levels
export const TRUST_LEVELS = {
  EXCELLENT: { min: 80, label: 'Excellent', color: 'green' },
  GOOD: { min: 60, label: 'Good', color: 'blue' },
  FAIR: { min: 40, label: 'Fair', color: 'yellow' },
  POOR: { min: 0, label: 'Poor', color: 'red' },
};

// Animations
export const ANIMATIONS = {
  FADE_IN: 'animate-fadeIn',
  SLIDE_UP: 'animate-slideUp',
  PULSE: 'animate-pulse-subtle',
};

// Local storage keys
export const STORAGE_KEYS = {
  TOKEN: 'token',
  THEME: 'theme',
  USER: 'user',
  PREFERENCES: 'preferences',
};

// Routes
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  DASHBOARD: '/',
  VERIFY: '/verify',
  CHECK_TRUST: '/check-trust',
  TIMELINE: '/timeline',
};
