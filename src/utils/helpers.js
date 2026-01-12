/**
 * [UTILS] Helper utility functions
 * General purpose utilities used throughout the app
 */

import { TMDB_CONFIG, DECADES } from '../config/constants';
import { colors } from '../theme/colors';

// ============================================
// [IMAGE HELPERS]
// Functions for handling TMDB images
// ============================================

/**
 * Get full poster URL from TMDB path
 * @param {string|null} posterPath - TMDB poster path (e.g., "/abc123.jpg")
 * @param {string} size - Size key from TMDB_CONFIG.posterSizes
 * @returns {string|null} Full URL or null if no poster
 */
export const getPosterUrl = (posterPath, size = 'large') => {
  if (!posterPath) return null;
  
  const sizeValue = TMDB_CONFIG.posterSizes[size] || TMDB_CONFIG.posterSizes.large;
  return `${TMDB_CONFIG.imageBaseUrl}/${sizeValue}${posterPath}`;
};

/**
 * Get placeholder image URL when no poster available
 * @returns {string} Placeholder image URL
 */
export const getPlaceholderPoster = () => {
  // Return a simple gray placeholder
  // In production, you might want to use a local asset instead
  return 'https://via.placeholder.com/500x750/1A1A1A/666666?text=No+Poster';
};

// ============================================
// [DATE/TIME HELPERS]
// ============================================

/**
 * Extract year from date string
 * @param {string|null} dateString - Date in YYYY-MM-DD format
 * @returns {string} Year or 'N/A'
 */
export const getYear = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    return dateString.split('-')[0];
  } catch {
    return 'N/A';
  }
};

/**
 * Get decade from year
 * @param {string|number} year - Year
 * @returns {string} Decade label (e.g., "2020s")
 */
export const getDecadeFromYear = (year) => {
  const numYear = parseInt(year, 10);
  if (isNaN(numYear)) return 'Unknown';
  
  const decade = Math.floor(numYear / 10) * 10;
  return `${decade}s`;
};

/**
 * Check if year falls within a decade
 * @param {string|number} year - Year to check
 * @param {string} decadeId - Decade ID from DECADES constant
 * @returns {boolean}
 */
export const isInDecade = (year, decadeId) => {
  const numYear = parseInt(year, 10);
  if (isNaN(numYear)) return false;
  
  const decade = DECADES.find((d) => d.id === decadeId);
  if (!decade) return false;
  
  return numYear >= decade.startYear && numYear <= decade.endYear;
};

// ============================================
// [RATING HELPERS]
// ============================================

/**
 * Format rating for display
 * @param {number|null} rating - Rating value (0-10)
 * @returns {string} Formatted rating
 */
export const formatRating = (rating) => {
  if (rating === null || rating === undefined || isNaN(rating)) {
    return 'N/A';
  }
  return rating.toFixed(1);
};

/**
 * Get rating color based on value
 * @param {number} rating - Rating value (0-10)
 * @returns {string} Color hex code
 */
export const getRatingColor = (rating) => {
  if (rating === null || rating === undefined || isNaN(rating)) {
    return colors.textSecondary;
  }
  
  if (rating >= 7.0) return colors.ratingHigh;
  if (rating >= 5.0) return colors.ratingMedium;
  return colors.ratingLow;
};

// ============================================
// [TEXT HELPERS]
// ============================================

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export const truncateText = (text, maxLength = 150) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  
  // Try to cut at a word boundary
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  
  if (lastSpace > maxLength * 0.8) {
    return truncated.substring(0, lastSpace) + '...';
  }
  
  return truncated + '...';
};

/**
 * Format genres array to string
 * @param {Array<{id: number, name: string}>} genres - Genre objects
 * @param {number} maxGenres - Maximum genres to show
 * @returns {string} Comma-separated genre names
 */
export const formatGenres = (genres, maxGenres = 3) => {
  if (!genres || !Array.isArray(genres) || genres.length === 0) {
    return 'Unknown Genre';
  }
  
  const genreNames = genres.slice(0, maxGenres).map((g) => g.name);
  return genreNames.join(', ');
};

// ============================================
// [WATCHLIST EXPORT]
// ============================================

/**
 * Generate shareable text from watchlist
 * @param {Array} watchlist - Array of watchlist items
 * @returns {string} Formatted text for sharing
 */
export const generateWatchlistText = (watchlist) => {
  if (!watchlist || watchlist.length === 0) {
    return 'My Watchlist is empty!';
  }
  
  const header = '🎬 My Swipe Watch List\n';
  const separator = '─'.repeat(30) + '\n';
  
  const movieItems = watchlist.filter((item) => item.mediaType === 'movie');
  const tvItems = watchlist.filter((item) => item.mediaType === 'tv');
  
  let text = header + separator;
  
  if (movieItems.length > 0) {
    text += '\n📽️ MOVIES:\n';
    movieItems.forEach((item, index) => {
      const year = getYear(item.releaseDate || item.firstAirDate);
      text += `${index + 1}. ${item.title} (${year})\n`;
    });
  }
  
  if (tvItems.length > 0) {
    text += '\n📺 TV SHOWS:\n';
    tvItems.forEach((item, index) => {
      const year = getYear(item.firstAirDate || item.releaseDate);
      text += `${index + 1}. ${item.title} (${year})\n`;
    });
  }
  
  text += '\n' + separator;
  text += 'Created with Swipe Watch 🎬';
  
  return text;
};

// ============================================
// [VALIDATION HELPERS]
// ============================================

/**
 * Check if TMDB API key is configured
 * @param {string} apiKey - API key to check
 * @returns {boolean}
 */
export const isApiKeyConfigured = (apiKey) => {
  return apiKey && 
         apiKey !== 'YOUR_TMDB_API_KEY_HERE' && 
         apiKey.length > 10;
};

/**
 * Validate item has required properties for display
 * @param {Object} item - Movie or TV show object
 * @returns {boolean}
 */
export const isValidItem = (item) => {
  return item && 
         item.id && 
         (item.title || item.name);
};

// ============================================
// [ARRAY HELPERS]
// ============================================

/**
 * Shuffle array (Fisher-Yates algorithm)
 * @param {Array} array - Array to shuffle
 * @returns {Array} Shuffled copy of array
 */
export const shuffleArray = (array) => {
  const shuffled = [...array];
  
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled;
};

/**
 * Remove duplicates from array by ID
 * @param {Array} array - Array with objects containing id property
 * @returns {Array} Array without duplicates
 */
export const removeDuplicatesById = (array) => {
  const seen = new Set();
  return array.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
};

// ============================================
// [DEBUG HELPERS]
// ============================================

/**
 * Log with timestamp and tag (only in development)
 * @param {string} tag - Log tag/category
 * @param {string} message - Log message
 * @param {any} data - Optional data to log
 */
export const debugLog = (tag, message, data = null) => {
  if (__DEV__) {
    const timestamp = new Date().toISOString().split('T')[1].split('.')[0];
    const logMessage = `[${timestamp}] [${tag}] ${message}`;
    
    if (data) {
      console.log(logMessage, data);
    } else {
      console.log(logMessage);
    }
  }
};
