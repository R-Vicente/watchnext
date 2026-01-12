/**
 * [THEME] Color palette for Swipe Watch
 * Dark mode by default - modern, cinema-inspired design
 */

export const colors = {
  // ============================================
  // [PRIMARY COLORS]
  // ============================================
  
  // Main background - deep dark for cinema feel
  background: '#0D0D0D',
  
  // Card background - slightly lighter for contrast
  cardBackground: '#1A1A1A',
  
  // Surface elements (modals, menus, etc.)
  surface: '#242424',
  
  // Elevated surfaces (cards, popups)
  surfaceElevated: '#2D2D2D',

  // ============================================
  // [ACCENT COLORS]
  // ============================================
  
  // Primary accent - vibrant red (like/watchlist)
  primary: '#E50914',
  primaryDark: '#B20710',
  
  // Secondary accent - golden for ratings
  secondary: '#F5C518',
  
  // Success - green for confirmations
  success: '#4CAF50',
  
  // Swipe indicators
  swipeRight: '#4CAF50',  // Green - like
  swipeLeft: '#F44336',   // Red - discard

  // ============================================
  // [TEXT COLORS]
  // ============================================
  
  // Primary text - high contrast white
  textPrimary: '#FFFFFF',
  
  // Secondary text - muted for less important info
  textSecondary: '#B3B3B3',
  
  // Tertiary text - subtle hints, placeholders
  textTertiary: '#666666',
  
  // Text on colored backgrounds
  textOnPrimary: '#FFFFFF',

  // ============================================
  // [UI ELEMENTS]
  // ============================================
  
  // Borders and dividers
  border: '#333333',
  borderLight: '#444444',
  
  // Icons
  iconActive: '#FFFFFF',
  iconInactive: '#666666',
  
  // Tab indicator
  tabActive: '#E50914',
  tabInactive: '#666666',
  
  // Overlay for modals/menus
  overlay: 'rgba(0, 0, 0, 0.7)',
  
  // Shimmer/loading placeholder
  shimmer: '#2A2A2A',
  shimmerHighlight: '#3A3A3A',

  // ============================================
  // [STATUS COLORS]
  // ============================================
  
  error: '#CF6679',
  warning: '#FFB74D',
  info: '#64B5F6',

  // ============================================
  // [RATING COLORS]
  // ============================================
  
  ratingHigh: '#4CAF50',    // 7.0+
  ratingMedium: '#FFC107',  // 5.0-6.9
  ratingLow: '#F44336',     // <5.0
};

// ============================================
// [SPACING SCALE]
// Consistent spacing throughout the app
// ============================================
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// ============================================
// [TYPOGRAPHY]
// Font sizes and weights
// ============================================
export const typography = {
  // Font sizes
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
    title: 28,
    hero: 32,
  },
  // Font weights (React Native uses string values)
  weights: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
};

// ============================================
// [BORDER RADIUS]
// Consistent rounding
// ============================================
export const borderRadius = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 9999, // Full circle
};

// ============================================
// [SHADOWS]
// Elevation shadows for cards/modals
// ============================================
export const shadows = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.30,
    shadowRadius: 4.65,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.44,
    shadowRadius: 10.32,
    elevation: 8,
  },
};

export default {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
};
