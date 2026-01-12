/**
 * [CONTEXT] Global Application State
 * Manages watchlist, filters, swipe history, and daily counter
 */

import React, { 
  createContext, 
  useContext, 
  useState, 
  useEffect, 
  useCallback, 
  useMemo 
} from 'react';
import { 
  DEFAULT_FILTERS, 
  CONTENT_TYPES,
  APP_CONFIG,
  DECADES,
} from '../config/constants';
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  clearWatchlist,
  getSwipedIds,
  addSwipedId,
  removeSwipedId,
  clearSwipedIds,
  getFilters,
  saveFilters,
  getDailySwipeCount,
  incrementDailySwipeCount,
} from '../utils/storage';
import { fetchDiscover, fetchMultiplePages } from '../services/tmdbApi';
import { debugLog } from '../utils/helpers';

// ============================================
// [CONTEXT CREATION]
// ============================================

const AppContext = createContext(null);

// ============================================
// [PROVIDER COMPONENT]
// ============================================

export const AppProvider = ({ children }) => {
  // --------------------------------------------
  // [STATE]
  // --------------------------------------------
  
  // Content type toggle (Movies / TV Shows)
  const [contentType, setContentType] = useState(CONTENT_TYPES.MOVIE);
  
  // Watchlist
  const [watchlist, setWatchlist] = useState([]);
  
  // Swiped IDs (to avoid showing same items)
  const [swipedIds, setSwipedIds] = useState({ movies: [], tv: [] });
  
  // Filters
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  
  // Daily swipe counter
  const [dailySwipeCount, setDailySwipeCount] = useState(0);
  
  // Cards queue for swiping
  const [cards, setCards] = useState([]);
  
  // Undo stack (for reverting last swipe)
  const [undoStack, setUndoStack] = useState([]);
  
  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // Error state
  const [error, setError] = useState(null);
  
  // Current page for pagination
  const [currentPage, setCurrentPage] = useState(1);

  // --------------------------------------------
  // [INITIALIZATION]
  // Load saved data on app start
  // --------------------------------------------
  
  useEffect(() => {
    const initializeApp = async () => {
      debugLog('AppContext', 'Initializing app...');
      setIsLoading(true);
      
      try {
        // Load all persisted data in parallel
        const [
          savedWatchlist,
          savedSwipedIds,
          savedFilters,
          savedDailyCount,
        ] = await Promise.all([
          getWatchlist(),
          getSwipedIds(),
          getFilters(DEFAULT_FILTERS),
          getDailySwipeCount(),
        ]);
        
        setWatchlist(savedWatchlist);
        setSwipedIds(savedSwipedIds);
        setFilters(savedFilters);
        setDailySwipeCount(savedDailyCount);
        
        debugLog('AppContext', 'App initialized successfully', {
          watchlistCount: savedWatchlist.length,
          swipedCount: savedSwipedIds.movies.length + savedSwipedIds.tv.length,
        });
      } catch (err) {
        console.error('[AppContext] Initialization error:', err.message);
        setError('Failed to load saved data');
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeApp();
  }, []);

  // --------------------------------------------
  // [LOAD CARDS]
  // Fetch cards when content type or filters change
  // --------------------------------------------
  
  const loadCards = useCallback(async (reset = false) => {
    debugLog('AppContext', 'Loading cards...', { contentType, filters, reset });
    
    if (reset) {
      setCards([]);
      setCurrentPage(1);
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    
    setError(null);
    
    try {
      // Build filter params
      const filterParams = {
        contentType,
        startPage: reset ? 1 : currentPage,
        pagesToFetch: 2, // Fetch 2 pages at a time for buffer
        genres: filters.genres,
        minRating: filters.highRatedOnly ? APP_CONFIG.highRatingThreshold : null,
      };
      
      // Add decade filter
      if (filters.decade) {
        const decade = DECADES.find(d => d.id === filters.decade);
        if (decade) {
          filterParams.minYear = decade.startYear;
          filterParams.maxYear = decade.endYear;
        }
      }
      
      const result = await fetchMultiplePages(filterParams);
      
      if (!result.success) {
        setError(result.error || 'Failed to load content');
        return;
      }
      
      // Filter out already swiped items
      const swipedIdsForType = contentType === CONTENT_TYPES.MOVIE 
        ? swipedIds.movies 
        : swipedIds.tv;
      
      const newCards = result.data.filter(
        item => !swipedIdsForType.includes(item.id)
      );
      
      if (reset) {
        setCards(newCards);
      } else {
        // Append new cards, avoiding duplicates
        setCards(prev => {
          const existingIds = new Set(prev.map(c => c.id));
          const uniqueNewCards = newCards.filter(c => !existingIds.has(c.id));
          return [...prev, ...uniqueNewCards];
        });
      }
      
      setCurrentPage(prev => prev + 2);
      
      debugLog('AppContext', `Loaded ${newCards.length} new cards`);
    } catch (err) {
      console.error('[AppContext] loadCards error:', err.message);
      setError('Failed to load content. Please try again.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [contentType, filters, currentPage, swipedIds]);

  // Load cards when content type or filters change
  useEffect(() => {
    if (!isLoading) {
      loadCards(true);
    }
  }, [contentType, filters]); // eslint-disable-line react-hooks/exhaustive-deps

  // Load more cards when running low
  useEffect(() => {
    if (cards.length < APP_CONFIG.prefetchCount && !isLoading && !isLoadingMore) {
      debugLog('AppContext', 'Running low on cards, loading more...');
      loadCards(false);
    }
  }, [cards.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // --------------------------------------------
  // [SWIPE ACTIONS]
  // --------------------------------------------
  
  /**
   * Handle swipe right (like) - add to watchlist
   */
  const handleSwipeRight = useCallback(async (item) => {
    debugLog('AppContext', 'Swipe right:', item.title);
    
    try {
      // Add to watchlist
      const result = await addToWatchlist(item);
      if (result.success) {
        setWatchlist(result.watchlist);
      }
      
      // Mark as swiped
      await addSwipedId(item.id, item.mediaType);
      setSwipedIds(await getSwipedIds());
      
      // Add to undo stack
      setUndoStack(prev => [...prev, { item, action: 'right' }]);
      
      // Remove from cards
      setCards(prev => prev.filter(c => c.id !== item.id));
      
      // Increment daily counter
      const newCount = await incrementDailySwipeCount();
      setDailySwipeCount(newCount);
    } catch (err) {
      console.error('[AppContext] handleSwipeRight error:', err.message);
    }
  }, []);

  /**
   * Handle swipe left (discard)
   */
  const handleSwipeLeft = useCallback(async (item) => {
    debugLog('AppContext', 'Swipe left:', item.title);
    
    try {
      // Mark as swiped
      await addSwipedId(item.id, item.mediaType);
      setSwipedIds(await getSwipedIds());
      
      // Add to undo stack
      setUndoStack(prev => [...prev, { item, action: 'left' }]);
      
      // Remove from cards
      setCards(prev => prev.filter(c => c.id !== item.id));
      
      // Increment daily counter
      const newCount = await incrementDailySwipeCount();
      setDailySwipeCount(newCount);
    } catch (err) {
      console.error('[AppContext] handleSwipeLeft error:', err.message);
    }
  }, []);

  /**
   * Undo last swipe
   */
  const handleUndo = useCallback(async () => {
    if (undoStack.length === 0) {
      debugLog('AppContext', 'Nothing to undo');
      return false;
    }
    
    const lastAction = undoStack[undoStack.length - 1];
    debugLog('AppContext', 'Undoing:', lastAction.item.title);
    
    try {
      // Remove from swiped IDs
      await removeSwipedId(lastAction.item.id, lastAction.item.mediaType);
      setSwipedIds(await getSwipedIds());
      
      // If it was a right swipe, remove from watchlist
      if (lastAction.action === 'right') {
        const result = await removeFromWatchlist(
          lastAction.item.id, 
          lastAction.item.mediaType
        );
        if (result.success) {
          setWatchlist(result.watchlist);
        }
      }
      
      // Add back to cards at the beginning
      setCards(prev => [lastAction.item, ...prev]);
      
      // Remove from undo stack
      setUndoStack(prev => prev.slice(0, -1));
      
      return true;
    } catch (err) {
      console.error('[AppContext] handleUndo error:', err.message);
      return false;
    }
  }, [undoStack]);

  // --------------------------------------------
  // [WATCHLIST ACTIONS]
  // --------------------------------------------
  
  /**
   * Remove item from watchlist
   */
  const handleRemoveFromWatchlist = useCallback(async (id, mediaType) => {
    try {
      const result = await removeFromWatchlist(id, mediaType);
      if (result.success) {
        setWatchlist(result.watchlist);
      }
      return result.success;
    } catch (err) {
      console.error('[AppContext] removeFromWatchlist error:', err.message);
      return false;
    }
  }, []);

  /**
   * Clear entire watchlist
   */
  const handleClearWatchlist = useCallback(async () => {
    try {
      await clearWatchlist();
      setWatchlist([]);
      return true;
    } catch (err) {
      console.error('[AppContext] clearWatchlist error:', err.message);
      return false;
    }
  }, []);

  // --------------------------------------------
  // [FILTER ACTIONS]
  // --------------------------------------------
  
  /**
   * Update filters
   */
  const updateFilters = useCallback(async (newFilters) => {
    debugLog('AppContext', 'Updating filters:', newFilters);
    setFilters(newFilters);
    await saveFilters(newFilters);
  }, []);

  /**
   * Reset filters to default
   */
  const resetFilters = useCallback(async () => {
    debugLog('AppContext', 'Resetting filters');
    setFilters(DEFAULT_FILTERS);
    await saveFilters(DEFAULT_FILTERS);
  }, []);

  // --------------------------------------------
  // [CONTENT TYPE TOGGLE]
  // --------------------------------------------
  
  const toggleContentType = useCallback(() => {
    setContentType(prev => 
      prev === CONTENT_TYPES.MOVIE ? CONTENT_TYPES.TV : CONTENT_TYPES.MOVIE
    );
  }, []);

  // --------------------------------------------
  // [REFRESH]
  // --------------------------------------------
  
  const refresh = useCallback(() => {
    loadCards(true);
  }, [loadCards]);

  /**
   * Clear all swiped history (start fresh)
   */
  const clearHistory = useCallback(async () => {
    try {
      await clearSwipedIds();
      setSwipedIds({ movies: [], tv: [] });
      setUndoStack([]);
      loadCards(true);
      return true;
    } catch (err) {
      console.error('[AppContext] clearHistory error:', err.message);
      return false;
    }
  }, [loadCards]);

  // --------------------------------------------
  // [MEMOIZED VALUES]
  // --------------------------------------------
  
  // Current card (top of stack)
  const currentCard = useMemo(() => cards[0] || null, [cards]);
  
  // Watchlist counts
  const watchlistCounts = useMemo(() => ({
    total: watchlist.length,
    movies: watchlist.filter(item => item.mediaType === CONTENT_TYPES.MOVIE).length,
    tv: watchlist.filter(item => item.mediaType === CONTENT_TYPES.TV).length,
  }), [watchlist]);
  
  // Can undo?
  const canUndo = useMemo(() => undoStack.length > 0, [undoStack]);
  
  // Has active filters?
  const hasActiveFilters = useMemo(() => {
    return filters.genres.length > 0 || 
           filters.decade !== null || 
           filters.highRatedOnly;
  }, [filters]);

  // --------------------------------------------
  // [CONTEXT VALUE]
  // --------------------------------------------
  
  const contextValue = useMemo(() => ({
    // State
    contentType,
    watchlist,
    filters,
    dailySwipeCount,
    cards,
    currentCard,
    isLoading,
    isLoadingMore,
    error,
    canUndo,
    hasActiveFilters,
    watchlistCounts,
    
    // Actions - Content
    setContentType,
    toggleContentType,
    
    // Actions - Swipe
    handleSwipeRight,
    handleSwipeLeft,
    handleUndo,
    
    // Actions - Watchlist
    handleRemoveFromWatchlist,
    handleClearWatchlist,
    
    // Actions - Filters
    updateFilters,
    resetFilters,
    
    // Actions - Refresh
    refresh,
    clearHistory,
  }), [
    contentType,
    watchlist,
    filters,
    dailySwipeCount,
    cards,
    currentCard,
    isLoading,
    isLoadingMore,
    error,
    canUndo,
    hasActiveFilters,
    watchlistCounts,
    toggleContentType,
    handleSwipeRight,
    handleSwipeLeft,
    handleUndo,
    handleRemoveFromWatchlist,
    handleClearWatchlist,
    updateFilters,
    resetFilters,
    refresh,
    clearHistory,
  ]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

// ============================================
// [HOOK]
// Custom hook for accessing context
// ============================================

export const useApp = () => {
  const context = useContext(AppContext);
  
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  
  return context;
};

export default AppContext;
