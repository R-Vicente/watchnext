/**
 * [CONFIG] Application constants and configuration
 * Centralized place for all app settings
 */

// ============================================
// [TMDB API CONFIGURATION]
// Get your free API key at: https://www.themoviedb.org/settings/api
// ============================================

// TODO: Replace with your TMDB API key
// Steps to get API key:
// 1. Create account at themoviedb.org
// 2. Go to Settings > API
// 3. Request an API key (choose "Developer" option)
// 4. Copy the "API Key (v3 auth)" value
export const TMDB_API_KEY = '2d65fac307d4124b9defb97a93a8d1c2';

export const TMDB_CONFIG = {
  baseUrl: 'https://api.themoviedb.org/3',
  imageBaseUrl: 'https://image.tmdb.org/t/p',
  
  // Image sizes available from TMDB
  posterSizes: {
    small: 'w185',
    medium: 'w342',
    large: 'w500',
    original: 'original',
  },
  
  // Default request params
  defaultParams: {
    language: 'en-US',
    include_adult: false,
  },
};

// ============================================
// [ADMOB CONFIGURATION]
// Using test ad unit IDs for development
// ============================================

// IMPORTANT: These are Google's official TEST ad unit IDs
// They will show test ads and won't generate real revenue
// Replace with your real ad unit IDs before publishing!

export const ADMOB_CONFIG = {
  // Test ad unit IDs (safe for development)
  // Source: https://developers.google.com/admob/android/test-ads
  testBannerId: 'ca-app-pub-3940256099942544/6300978111',
  
  // TODO: Replace with your real ad unit IDs for production
  // Steps to get real ad unit IDs:
  // 1. Create AdMob account at admob.google.com
  // 2. Add your app
  // 3. Create a Banner ad unit
  // 4. Copy the ad unit ID (format: ca-app-pub-XXXXXXXXXXXXXXXX/YYYYYYYYYY)
  
  // productionBannerId: 'ca-app-pub-YOUR_APP_ID/YOUR_AD_UNIT_ID',
  
  // Set to true when using real ads
  useTestAds: true,
};

// Helper to get the correct ad unit ID
export const getAdUnitId = () => {
  if (ADMOB_CONFIG.useTestAds) {
    return ADMOB_CONFIG.testBannerId;
  }
  // Uncomment and use when ready for production:
  // return ADMOB_CONFIG.productionBannerId;
  return ADMOB_CONFIG.testBannerId;
};

// ============================================
// [MOVIE/TV GENRES]
// TMDB genre IDs mapping
// ============================================

export const MOVIE_GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
];

export const TV_GENRES = [
  { id: 10759, name: 'Action & Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 10762, name: 'Kids' },
  { id: 9648, name: 'Mystery' },
  { id: 10763, name: 'News' },
  { id: 10764, name: 'Reality' },
  { id: 10765, name: 'Sci-Fi & Fantasy' },
  { id: 10766, name: 'Soap' },
  { id: 10767, name: 'Talk' },
  { id: 10768, name: 'War & Politics' },
  { id: 37, name: 'Western' },
];

// ============================================
// [DECADE FILTERS]
// For filtering by release decade
// ============================================

export const DECADES = [
  { id: '2020s', label: '2020s', startYear: 2020, endYear: 2029 },
  { id: '2010s', label: '2010s', startYear: 2010, endYear: 2019 },
  { id: '2000s', label: '2000s', startYear: 2000, endYear: 2009 },
  { id: '1990s', label: '1990s', startYear: 1990, endYear: 1999 },
  { id: '1980s', label: '1980s', startYear: 1980, endYear: 1989 },
  { id: '1970s', label: '1970s', startYear: 1970, endYear: 1979 },
  { id: 'classic', label: 'Classic (<1970)', startYear: 1900, endYear: 1969 },
];

// ============================================
// [APP SETTINGS]
// General app configuration
// ============================================

export const APP_CONFIG = {
  // Number of items to pre-fetch for smooth swiping
  prefetchCount: 10,
  
  // Minimum rating for "High Rated Only" filter
  highRatingThreshold: 7.0,
  
  // Swipe animation duration (ms)
  swipeAnimationDuration: 300,
  
  // Haptic feedback intensity
  hapticIntensity: 'light', // 'light', 'medium', 'heavy'
  
  // API request timeout (ms)
  apiTimeout: 10000,
  
  // Max items per page from API
  itemsPerPage: 20,
  
  // Storage keys
  storageKeys: {
    watchlist: '@swipewatch_watchlist',
    swipedIds: '@swipewatch_swiped_ids',
    filters: '@swipewatch_filters',
    dailyCount: '@swipewatch_daily_count',
    lastSwipeDate: '@swipewatch_last_swipe_date',
  },
};

// ============================================
// [CONTENT TYPES]
// Movie vs TV Show toggle
// ============================================

export const CONTENT_TYPES = {
  MOVIE: 'movie',
  TV: 'tv',
};

// ============================================
// [DEFAULT FILTER STATE]
// Initial filter values
// ============================================

export const DEFAULT_FILTERS = {
  genres: [],           // Array of selected genre IDs
  decade: null,         // Selected decade ID or null for all
  highRatedOnly: false, // Only show rating > 7.0
};
