/**
 * [STORAGE] AsyncStorage utility functions
 * Handles all local data persistence with robust error handling
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { APP_CONFIG } from '../config/constants';

const { storageKeys } = APP_CONFIG;

// ============================================
// [GENERIC STORAGE OPERATIONS]
// Base functions for reading/writing data
// ============================================

/**
 * Save data to AsyncStorage
 * @param {string} key - Storage key
 * @param {any} value - Value to store (will be JSON stringified)
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const saveData = async (key, value) => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
    return { success: true };
  } catch (error) {
    console.error(`[Storage] Error saving data for key "${key}":`, error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Load data from AsyncStorage
 * @param {string} key - Storage key
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {Promise<{success: boolean, data: any, error?: string}>}
 */
export const loadData = async (key, defaultValue = null) => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    
    if (jsonValue === null) {
      return { success: true, data: defaultValue };
    }
    
    const parsedValue = JSON.parse(jsonValue);
    return { success: true, data: parsedValue };
  } catch (error) {
    console.error(`[Storage] Error loading data for key "${key}":`, error.message);
    return { success: false, data: defaultValue, error: error.message };
  }
};

/**
 * Remove data from AsyncStorage
 * @param {string} key - Storage key
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const removeData = async (key) => {
  try {
    await AsyncStorage.removeItem(key);
    return { success: true };
  } catch (error) {
    console.error(`[Storage] Error removing data for key "${key}":`, error.message);
    return { success: false, error: error.message };
  }
};

// ============================================
// [WATCHLIST OPERATIONS]
// Functions for managing the user's watchlist
// ============================================

/**
 * Get the user's watchlist
 * @returns {Promise<Array>} Array of watchlist items
 */
export const getWatchlist = async () => {
  const result = await loadData(storageKeys.watchlist, []);
  return result.data;
};

/**
 * Add item to watchlist
 * @param {Object} item - Movie or TV show object
 * @returns {Promise<{success: boolean, watchlist: Array}>}
 */
export const addToWatchlist = async (item) => {
  try {
    const watchlist = await getWatchlist();
    
    // Check if already in watchlist (prevent duplicates)
    const exists = watchlist.some(
      (existing) => existing.id === item.id && existing.mediaType === item.mediaType
    );
    
    if (exists) {
      console.log('[Storage] Item already in watchlist, skipping');
      return { success: true, watchlist };
    }
    
    // Add timestamp for sorting
    const itemWithTimestamp = {
      ...item,
      addedAt: new Date().toISOString(),
    };
    
    const updatedWatchlist = [itemWithTimestamp, ...watchlist];
    await saveData(storageKeys.watchlist, updatedWatchlist);
    
    return { success: true, watchlist: updatedWatchlist };
  } catch (error) {
    console.error('[Storage] Error adding to watchlist:', error.message);
    return { success: false, watchlist: [], error: error.message };
  }
};

/**
 * Remove item from watchlist
 * @param {number} id - Item ID
 * @param {string} mediaType - 'movie' or 'tv'
 * @returns {Promise<{success: boolean, watchlist: Array}>}
 */
export const removeFromWatchlist = async (id, mediaType) => {
  try {
    const watchlist = await getWatchlist();
    const updatedWatchlist = watchlist.filter(
      (item) => !(item.id === id && item.mediaType === mediaType)
    );
    
    await saveData(storageKeys.watchlist, updatedWatchlist);
    return { success: true, watchlist: updatedWatchlist };
  } catch (error) {
    console.error('[Storage] Error removing from watchlist:', error.message);
    return { success: false, watchlist: [], error: error.message };
  }
};

/**
 * Clear entire watchlist
 * @returns {Promise<{success: boolean}>}
 */
export const clearWatchlist = async () => {
  return await saveData(storageKeys.watchlist, []);
};

// ============================================
// [SWIPED IDS OPERATIONS]
// Track which items have been swiped to avoid showing again
// ============================================

/**
 * Get all swiped item IDs
 * @returns {Promise<{movies: Array<number>, tv: Array<number>}>}
 */
export const getSwipedIds = async () => {
  const result = await loadData(storageKeys.swipedIds, { movies: [], tv: [] });
  return result.data;
};

/**
 * Add ID to swiped list
 * @param {number} id - Item ID
 * @param {string} mediaType - 'movie' or 'tv'
 * @returns {Promise<{success: boolean}>}
 */
export const addSwipedId = async (id, mediaType) => {
  try {
    const swipedIds = await getSwipedIds();
    const key = mediaType === 'movie' ? 'movies' : 'tv';
    
    if (!swipedIds[key].includes(id)) {
      swipedIds[key].push(id);
      await saveData(storageKeys.swipedIds, swipedIds);
    }
    
    return { success: true };
  } catch (error) {
    console.error('[Storage] Error adding swiped ID:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Remove ID from swiped list (for undo functionality)
 * @param {number} id - Item ID
 * @param {string} mediaType - 'movie' or 'tv'
 * @returns {Promise<{success: boolean}>}
 */
export const removeSwipedId = async (id, mediaType) => {
  try {
    const swipedIds = await getSwipedIds();
    const key = mediaType === 'movie' ? 'movies' : 'tv';
    
    swipedIds[key] = swipedIds[key].filter((swipedId) => swipedId !== id);
    await saveData(storageKeys.swipedIds, swipedIds);
    
    return { success: true };
  } catch (error) {
    console.error('[Storage] Error removing swiped ID:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Clear all swiped IDs (reset history)
 * @returns {Promise<{success: boolean}>}
 */
export const clearSwipedIds = async () => {
  return await saveData(storageKeys.swipedIds, { movies: [], tv: [] });
};

// ============================================
// [FILTERS OPERATIONS]
// Save and restore user's filter preferences
// ============================================

/**
 * Get saved filters
 * @param {Object} defaultFilters - Default filter values
 * @returns {Promise<Object>}
 */
export const getFilters = async (defaultFilters) => {
  const result = await loadData(storageKeys.filters, defaultFilters);
  return result.data;
};

/**
 * Save filters
 * @param {Object} filters - Filter values to save
 * @returns {Promise<{success: boolean}>}
 */
export const saveFilters = async (filters) => {
  return await saveData(storageKeys.filters, filters);
};

// ============================================
// [DAILY SWIPE COUNTER]
// Track number of swipes per day
// ============================================

/**
 * Get today's swipe count
 * @returns {Promise<number>}
 */
export const getDailySwipeCount = async () => {
  try {
    const today = new Date().toDateString();
    const lastDateResult = await loadData(storageKeys.lastSwipeDate, null);
    const countResult = await loadData(storageKeys.dailyCount, 0);
    
    // If it's a new day, reset counter
    if (lastDateResult.data !== today) {
      await saveData(storageKeys.lastSwipeDate, today);
      await saveData(storageKeys.dailyCount, 0);
      return 0;
    }
    
    return countResult.data;
  } catch (error) {
    console.error('[Storage] Error getting daily swipe count:', error.message);
    return 0;
  }
};

/**
 * Increment today's swipe count
 * @returns {Promise<number>} New count
 */
export const incrementDailySwipeCount = async () => {
  try {
    const today = new Date().toDateString();
    await saveData(storageKeys.lastSwipeDate, today);
    
    const currentCount = await getDailySwipeCount();
    const newCount = currentCount + 1;
    
    await saveData(storageKeys.dailyCount, newCount);
    return newCount;
  } catch (error) {
    console.error('[Storage] Error incrementing daily swipe count:', error.message);
    return 0;
  }
};

// ============================================
// [UTILITY FUNCTIONS]
// ============================================

/**
 * Clear all app data (for debugging/reset)
 * @returns {Promise<{success: boolean}>}
 */
export const clearAllData = async () => {
  try {
    const keys = Object.values(storageKeys);
    await AsyncStorage.multiRemove(keys);
    console.log('[Storage] All data cleared');
    return { success: true };
  } catch (error) {
    console.error('[Storage] Error clearing all data:', error.message);
    return { success: false, error: error.message };
  }
};

/**
 * Get storage stats (for debugging)
 * @returns {Promise<Object>}
 */
export const getStorageStats = async () => {
  try {
    const watchlist = await getWatchlist();
    const swipedIds = await getSwipedIds();
    const dailyCount = await getDailySwipeCount();
    
    return {
      watchlistCount: watchlist.length,
      swipedMoviesCount: swipedIds.movies.length,
      swipedTvCount: swipedIds.tv.length,
      dailySwipeCount: dailyCount,
    };
  } catch (error) {
    console.error('[Storage] Error getting storage stats:', error.message);
    return {
      watchlistCount: 0,
      swipedMoviesCount: 0,
      swipedTvCount: 0,
      dailySwipeCount: 0,
    };
  }
};
