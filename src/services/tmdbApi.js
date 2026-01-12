/**
 * [SERVICE] TMDB API Integration
 * Handles all communication with The Movie Database API
 * 
 * API Documentation: https://developers.themoviedb.org/3
 */

import axios from 'axios';
import { 
  TMDB_API_KEY, 
  TMDB_CONFIG, 
  APP_CONFIG,
  CONTENT_TYPES 
} from '../config/constants';
import { debugLog, isApiKeyConfigured, removeDuplicatesById } from '../utils/helpers';

// ============================================
// [AXIOS INSTANCE]
// Configured axios instance for TMDB requests
// ============================================

const tmdbApi = axios.create({
  baseURL: TMDB_CONFIG.baseUrl,
  timeout: APP_CONFIG.apiTimeout,
  params: {
    api_key: TMDB_API_KEY,
    ...TMDB_CONFIG.defaultParams,
  },
});

// Request interceptor for logging
tmdbApi.interceptors.request.use(
  (config) => {
    debugLog('TMDB', `Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    debugLog('TMDB', 'Request error:', error.message);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
tmdbApi.interceptors.response.use(
  (response) => {
    debugLog('TMDB', `Response: ${response.status} from ${response.config.url}`);
    return response;
  },
  (error) => {
    const errorMessage = error.response?.data?.status_message || error.message;
    debugLog('TMDB', `Response error: ${errorMessage}`);
    return Promise.reject(error);
  }
);

// ============================================
// [API KEY VALIDATION]
// ============================================

/**
 * Check if API key is properly configured
 * @returns {{valid: boolean, message: string}}
 */
export const validateApiKey = () => {
  if (!isApiKeyConfigured(TMDB_API_KEY)) {
    return {
      valid: false,
      message: 'TMDB API key not configured. Please add your API key in src/config/constants.js',
    };
  }
  return { valid: true, message: 'API key configured' };
};

// ============================================
// [DISCOVER ENDPOINTS]
// Main endpoints for fetching movies/TV shows
// ============================================

/**
 * Fetch discover results (movies or TV shows)
 * @param {Object} options - Query options
 * @param {string} options.contentType - 'movie' or 'tv'
 * @param {number} options.page - Page number (default: 1)
 * @param {Array<number>} options.genres - Array of genre IDs to filter
 * @param {number} options.minYear - Minimum release year
 * @param {number} options.maxYear - Maximum release year
 * @param {number} options.minRating - Minimum vote average
 * @param {string} options.sortBy - Sort field (default: popularity.desc)
 * @returns {Promise<{success: boolean, data: Array, totalPages: number, error?: string}>}
 */
export const fetchDiscover = async ({
  contentType = CONTENT_TYPES.MOVIE,
  page = 1,
  genres = [],
  minYear = null,
  maxYear = null,
  minRating = null,
  sortBy = 'popularity.desc',
} = {}) => {
  try {
    // Validate API key first
    const keyValidation = validateApiKey();
    if (!keyValidation.valid) {
      return { success: false, data: [], totalPages: 0, error: keyValidation.message };
    }

    // Build query params
    const params = {
      page,
      sort_by: sortBy,
      'vote_count.gte': 100, // Ensure we get items with enough votes
    };

    // Add genre filter
    if (genres.length > 0) {
      params.with_genres = genres.join(',');
    }

    // Add year filters (different param names for movies vs TV)
    if (contentType === CONTENT_TYPES.MOVIE) {
      if (minYear) params['primary_release_date.gte'] = `${minYear}-01-01`;
      if (maxYear) params['primary_release_date.lte'] = `${maxYear}-12-31`;
    } else {
      if (minYear) params['first_air_date.gte'] = `${minYear}-01-01`;
      if (maxYear) params['first_air_date.lte'] = `${maxYear}-12-31`;
    }

    // Add rating filter
    if (minRating) {
      params['vote_average.gte'] = minRating;
    }

    const endpoint = contentType === CONTENT_TYPES.MOVIE ? '/discover/movie' : '/discover/tv';
    const response = await tmdbApi.get(endpoint, { params });

    // Normalize results (movies use 'title', TV uses 'name')
    const normalizedResults = response.data.results.map((item) => 
      normalizeItem(item, contentType)
    );

    return {
      success: true,
      data: normalizedResults,
      totalPages: response.data.total_pages,
      currentPage: response.data.page,
    };
  } catch (error) {
    console.error('[TMDB] fetchDiscover error:', error.message);
    
    // Return user-friendly error message
    let errorMessage = 'Failed to load content. Please try again.';
    
    if (error.response) {
      // Server responded with error
      if (error.response.status === 401) {
        errorMessage = 'Invalid API key. Please check your TMDB API key.';
      } else if (error.response.status === 429) {
        errorMessage = 'Too many requests. Please wait a moment.';
      }
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = 'Request timed out. Please check your connection.';
    } else if (!error.response) {
      errorMessage = 'Network error. Please check your internet connection.';
    }

    return { success: false, data: [], totalPages: 0, error: errorMessage };
  }
};

/**
 * Fetch popular movies
 * @param {number} page - Page number
 * @returns {Promise<{success: boolean, data: Array, totalPages: number, error?: string}>}
 */
export const fetchPopularMovies = async (page = 1) => {
  try {
    const keyValidation = validateApiKey();
    if (!keyValidation.valid) {
      return { success: false, data: [], totalPages: 0, error: keyValidation.message };
    }

    const response = await tmdbApi.get('/movie/popular', { params: { page } });
    
    const normalizedResults = response.data.results.map((item) => 
      normalizeItem(item, CONTENT_TYPES.MOVIE)
    );

    return {
      success: true,
      data: normalizedResults,
      totalPages: response.data.total_pages,
      currentPage: response.data.page,
    };
  } catch (error) {
    console.error('[TMDB] fetchPopularMovies error:', error.message);
    return { success: false, data: [], totalPages: 0, error: 'Failed to load movies.' };
  }
};

/**
 * Fetch popular TV shows
 * @param {number} page - Page number
 * @returns {Promise<{success: boolean, data: Array, totalPages: number, error?: string}>}
 */
export const fetchPopularTVShows = async (page = 1) => {
  try {
    const keyValidation = validateApiKey();
    if (!keyValidation.valid) {
      return { success: false, data: [], totalPages: 0, error: keyValidation.message };
    }

    const response = await tmdbApi.get('/tv/popular', { params: { page } });
    
    const normalizedResults = response.data.results.map((item) => 
      normalizeItem(item, CONTENT_TYPES.TV)
    );

    return {
      success: true,
      data: normalizedResults,
      totalPages: response.data.total_pages,
      currentPage: response.data.page,
    };
  } catch (error) {
    console.error('[TMDB] fetchPopularTVShows error:', error.message);
    return { success: false, data: [], totalPages: 0, error: 'Failed to load TV shows.' };
  }
};

// ============================================
// [DETAILS ENDPOINTS]
// Get full details for a single item
// ============================================

/**
 * Fetch movie details
 * @param {number} movieId - Movie ID
 * @returns {Promise<{success: boolean, data: Object|null, error?: string}>}
 */
export const fetchMovieDetails = async (movieId) => {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}`);
    return {
      success: true,
      data: normalizeItem(response.data, CONTENT_TYPES.MOVIE),
    };
  } catch (error) {
    console.error('[TMDB] fetchMovieDetails error:', error.message);
    return { success: false, data: null, error: 'Failed to load movie details.' };
  }
};

/**
 * Fetch TV show details
 * @param {number} tvId - TV show ID
 * @returns {Promise<{success: boolean, data: Object|null, error?: string}>}
 */
export const fetchTVShowDetails = async (tvId) => {
  try {
    const response = await tmdbApi.get(`/tv/${tvId}`);
    return {
      success: true,
      data: normalizeItem(response.data, CONTENT_TYPES.TV),
    };
  } catch (error) {
    console.error('[TMDB] fetchTVShowDetails error:', error.message);
    return { success: false, data: null, error: 'Failed to load TV show details.' };
  }
};

// ============================================
// [BATCH FETCHING]
// Fetch multiple pages for pre-loading
// ============================================

/**
 * Fetch multiple pages of content
 * @param {Object} options - Same as fetchDiscover plus pagesToFetch
 * @param {number} options.startPage - Starting page (default: 1)
 * @param {number} options.pagesToFetch - Number of pages to fetch (default: 3)
 * @returns {Promise<{success: boolean, data: Array, error?: string}>}
 */
export const fetchMultiplePages = async ({
  startPage = 1,
  pagesToFetch = 3,
  ...discoverOptions
} = {}) => {
  try {
    const pageNumbers = Array.from(
      { length: pagesToFetch }, 
      (_, i) => startPage + i
    );

    const results = await Promise.all(
      pageNumbers.map((page) => 
        fetchDiscover({ ...discoverOptions, page })
      )
    );

    // Combine all successful results
    const allItems = results
      .filter((result) => result.success)
      .flatMap((result) => result.data);

    // Remove duplicates
    const uniqueItems = removeDuplicatesById(allItems);

    // Check if any requests failed
    const hasErrors = results.some((result) => !result.success);
    const firstError = results.find((result) => !result.success)?.error;

    return {
      success: !hasErrors || uniqueItems.length > 0,
      data: uniqueItems,
      error: hasErrors && uniqueItems.length === 0 ? firstError : null,
    };
  } catch (error) {
    console.error('[TMDB] fetchMultiplePages error:', error.message);
    return { success: false, data: [], error: 'Failed to load content.' };
  }
};

// ============================================
// [DATA NORMALIZATION]
// Normalize TMDB response to consistent format
// ============================================

/**
 * Normalize movie/TV item to consistent format
 * @param {Object} item - Raw TMDB item
 * @param {string} mediaType - 'movie' or 'tv'
 * @returns {Object} Normalized item
 */
const normalizeItem = (item, mediaType) => {
  const isMovie = mediaType === CONTENT_TYPES.MOVIE;

  return {
    // Core identifiers
    id: item.id,
    mediaType: mediaType,
    
    // Title (movies use 'title', TV uses 'name')
    title: isMovie ? item.title : item.name,
    originalTitle: isMovie ? item.original_title : item.original_name,
    
    // Dates
    releaseDate: isMovie ? item.release_date : null,
    firstAirDate: !isMovie ? item.first_air_date : null,
    
    // Images
    posterPath: item.poster_path,
    backdropPath: item.backdrop_path,
    
    // Details
    overview: item.overview || 'No overview available.',
    rating: item.vote_average || 0,
    voteCount: item.vote_count || 0,
    popularity: item.popularity || 0,
    
    // Genres (array of IDs from discover, or full objects from details)
    genreIds: item.genre_ids || [],
    genres: item.genres || [],
    
    // Language
    originalLanguage: item.original_language,
    
    // TV specific
    ...(mediaType === CONTENT_TYPES.TV && {
      numberOfSeasons: item.number_of_seasons,
      numberOfEpisodes: item.number_of_episodes,
    }),
    
    // Movie specific
    ...(mediaType === CONTENT_TYPES.MOVIE && {
      runtime: item.runtime,
    }),
  };
};

// ============================================
// [GENRE HELPERS]
// ============================================

/**
 * Fetch genre list for content type
 * @param {string} contentType - 'movie' or 'tv'
 * @returns {Promise<{success: boolean, data: Array, error?: string}>}
 */
export const fetchGenres = async (contentType = CONTENT_TYPES.MOVIE) => {
  try {
    const endpoint = contentType === CONTENT_TYPES.MOVIE 
      ? '/genre/movie/list' 
      : '/genre/tv/list';
    
    const response = await tmdbApi.get(endpoint);
    
    return {
      success: true,
      data: response.data.genres,
    };
  } catch (error) {
    console.error('[TMDB] fetchGenres error:', error.message);
    return { success: false, data: [], error: 'Failed to load genres.' };
  }
};

// ============================================
// [EXPORTS]
// ============================================

export default {
  validateApiKey,
  fetchDiscover,
  fetchPopularMovies,
  fetchPopularTVShows,
  fetchMovieDetails,
  fetchTVShowDetails,
  fetchMultiplePages,
  fetchGenres,
};
