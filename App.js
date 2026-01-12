import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, Text, StyleSheet, Image, TouchableOpacity, Dimensions,
  ActivityIndicator, SafeAreaView, FlatList, Modal, ScrollView,
  TextInput, Linking, Alert, Animated, Switch,
} from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TMDB_API_KEY } from './src/config/constants';

const { width, height } = Dimensions.get('window');

// ============================================
// CONSTANTS
// ============================================

const MOVIE_GENRES = [
  { id: 28, name: 'Action' }, { id: 12, name: 'Adventure' }, { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' }, { id: 80, name: 'Crime' }, { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' }, { id: 10751, name: 'Family' }, { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' }, { id: 27, name: 'Horror' }, { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' }, { id: 10749, name: 'Romance' }, { id: 878, name: 'Sci-Fi' },
  { id: 53, name: 'Thriller' }, { id: 10752, name: 'War' }, { id: 37, name: 'Western' },
];

const TV_GENRES = [
  { id: 10759, name: 'Action & Adventure' }, { id: 16, name: 'Animation' }, { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' }, { id: 99, name: 'Documentary' }, { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' }, { id: 10762, name: 'Kids' }, { id: 9648, name: 'Mystery' },
  { id: 10765, name: 'Sci-Fi & Fantasy' }, { id: 10768, name: 'War & Politics' }, { id: 37, name: 'Western' },
];

const PROVIDERS = [
  { id: 8, name: 'Netflix' }, { id: 9, name: 'Prime Video' }, { id: 337, name: 'Disney+' },
  { id: 384, name: 'HBO Max' }, { id: 350, name: 'Apple TV+' }, { id: 531, name: 'Paramount+' },
  { id: 283, name: 'Crunchyroll' },
];

const RATINGS = [
  { id: null, name: 'Any' }, { id: 5, name: '5+' }, { id: 6, name: '6+' },
  { id: 7, name: '7+' }, { id: 8, name: '8+' },
];

const SORT_FIELDS = [
  { id: 'popularity', name: 'Popularity' },
  { id: 'vote_average', name: 'Rating' },
  { id: 'primary_release_date', name: 'Release Date', tvId: 'first_air_date' },
];

const SCREENS = {
  LOADING: 'loading', HOME: 'home', SWIPE: 'swipe',
  LISTS: 'lists', SEARCH: 'search', DETAILS: 'details', 
  STATS: 'stats', SETTINGS: 'settings', RECOMMEND: 'recommend',
};

const THEMES = {
  dark: {
    background: '#121212', surface: '#1e1e1e', card: '#1a1a1a',
    text: '#ffffff', textSecondary: '#999999', textMuted: '#666666',
    border: '#333333', primary: '#4CAF50', secondary: '#FFB300',
    danger: '#E53935', skip: '#424242',
  },
  light: {
    background: '#f5f5f5', surface: '#ffffff', card: '#ffffff',
    text: '#1a1a1a', textSecondary: '#666666', textMuted: '#999999',
    border: '#e0e0e0', primary: '#4CAF50', secondary: '#FFB300',
    danger: '#E53935', skip: '#9e9e9e',
  },
};

// ============================================
// RECOMMENDATION CONSTANTS
// ============================================



const MOODS = [
  { 
    id: 'laugh', 
    emoji: '😂', 
    label: 'Laugh',
    genres: [35],
    subOptions: [
      { id: 'any', label: 'Any comedy', emoji: '🎭', genres: [35] },
      { id: 'romantic', label: 'Romantic', emoji: '💕', genres: [35, 10749] },
      { id: 'action', label: 'Action comedy', emoji: '💥', genres: [35, 28] },
      { id: 'dark', label: 'Dark / Satire', emoji: '🖤', genres: [35], keywords: 'dark comedy,satire' },
      { id: 'family', label: 'Family friendly', emoji: '👨‍👩‍👧‍👦', genres: [35, 10751] },
    ]
  },
  { 
    id: 'think', 
    emoji: '🧠', 
    label: 'Think',
    genres: [18, 9648],
    subOptions: [
      { id: 'any', label: 'Any', emoji: '🎭', genres: [18, 9648] },
      { id: 'mystery', label: 'Mystery / Whodunit', emoji: '🔍', genres: [9648] },
      { id: 'psychological', label: 'Psychological', emoji: '🌀', genres: [18, 53] },
      { id: 'documentary', label: 'Documentary', emoji: '📹', genres: [99] },
      { id: 'historical', label: 'Historical', emoji: '📜', genres: [18, 36] },
    ]
  },
  { 
    id: 'adrenaline', 
    emoji: '💥', 
    label: 'Adrenaline',
    genres: [28, 53],
    subOptions: [
      { id: 'any', label: 'Any action', emoji: '🎭', genres: [28, 53] },
      { id: 'pure', label: 'Pure action', emoji: '🔫', genres: [28] },
      { id: 'thriller', label: 'Thriller / Suspense', emoji: '😰', genres: [53] },
      { id: 'crime', label: 'Crime / Heist', emoji: '🦹', genres: [80, 53] },
      { id: 'war', label: 'War', emoji: '⚔️', genres: [10752, 28] },
    ]
  },
  { 
    id: 'cry', 
    emoji: '😢', 
    label: 'Feel',
    genres: [18, 10749],
    subOptions: [
      { id: 'any', label: 'Any drama', emoji: '🎭', genres: [18] },
      { id: 'romance', label: 'Romance', emoji: '💕', genres: [10749] },
      { id: 'family', label: 'Family / Heartwarming', emoji: '🏠', genres: [18, 10751] },
      { id: 'tragedy', label: 'Tragedy / Heavy', emoji: '💔', genres: [18] },
      { id: 'inspiring', label: 'Inspiring / Uplifting', emoji: '✨', genres: [18], keywords: 'inspiring,uplifting' },
    ]
  },
  { 
    id: 'escape', 
    emoji: '🚀', 
    label: 'Escape',
    genres: [878, 14],
    subOptions: [
      { id: 'any', label: 'Any', emoji: '🎭', genres: [878, 14, 12] },
      { id: 'scifi', label: 'Sci-Fi', emoji: '🛸', genres: [878] },
      { id: 'fantasy', label: 'Fantasy', emoji: '🧙', genres: [14] },
      { id: 'adventure', label: 'Adventure', emoji: '🗺️', genres: [12] },
      { id: 'superhero', label: 'Superhero', emoji: '🦸', genres: [28, 878], keywords: 'superhero,marvel,dc' },
    ]
  },
  { 
    id: 'chill', 
    emoji: '😌', 
    label: 'Chill',
    genres: [35, 10749],
    subOptions: [
      { id: 'any', label: 'Easy watch', emoji: '🎭', genres: [35, 10749] },
      { id: 'feelgood', label: 'Feel-good', emoji: '☀️', genres: [35, 10749] },
      { id: 'animated', label: 'Animated', emoji: '🎨', genres: [16] },
      { id: 'music', label: 'Musical', emoji: '🎵', genres: [10402] },
    ]
  },
  { 
    id: 'scare', 
    emoji: '👻', 
    label: 'Scare',
    genres: [27],
    subOptions: [
      { id: 'any', label: 'Any horror', emoji: '🎭', genres: [27] },
      { id: 'supernatural', label: 'Supernatural', emoji: '👻', genres: [27], keywords: 'supernatural,ghost,demon' },
      { id: 'slasher', label: 'Slasher', emoji: '🔪', genres: [27], keywords: 'slasher' },
      { id: 'psychological', label: 'Psychological', emoji: '🧠', genres: [27, 53] },
      { id: 'thriller', label: 'Creepy thriller', emoji: '😨', genres: [53, 9648] },
    ]
  },
  { 
    id: 'surprise', 
    emoji: '🎲', 
    label: 'Surprise me',
    genres: [],
    subOptions: null // No sub-options for surprise
  },
];

// Onboarding movies - diverse, polarizing, well-known
// Mix of genres to quickly understand taste
// Onboarding content - diverse, polarizing, well-known
const ONBOARDING_CONTENT = {
  movie: [
    { id: 299536, title: 'Avengers: Infinity War', genre: 'Action/Superhero' },
    { id: 27205, title: 'Inception', genre: 'Sci-Fi/Thriller' },
    { id: 278, title: 'The Shawshank Redemption', genre: 'Drama' },
    { id: 120, title: 'The Lord of the Rings: Fellowship', genre: 'Fantasy' },
    { id: 807, title: 'Se7en', genre: 'Thriller/Dark' },
    { id: 438631, title: 'Dune', genre: 'Sci-Fi/Epic' },
    { id: 550, title: 'Fight Club', genre: 'Drama/Psychological' },
    { id: 238, title: 'The Godfather', genre: 'Crime/Drama' },
    { id: 19404, title: 'Dilwale Dulhania Le Jayenge', genre: 'Romance' },
    { id: 862, title: 'Toy Story', genre: 'Animation/Family' },
    { id: 680, title: 'Pulp Fiction', genre: 'Crime/Dark Comedy' },
    { id: 155, title: 'The Dark Knight', genre: 'Action/Superhero' },
    { id: 13, title: 'Forrest Gump', genre: 'Drama/Feel-good' },
    { id: 603, title: 'The Matrix', genre: 'Sci-Fi/Action' },
  ],
  tv: [
    { id: 1399, title: 'Game of Thrones', genre: 'Fantasy/Drama' },
    { id: 1396, title: 'Breaking Bad', genre: 'Crime/Drama' },
    { id: 66732, title: 'Stranger Things', genre: 'Sci-Fi/Horror' },
    { id: 1418, title: 'The Big Bang Theory', genre: 'Comedy' },
    { id: 456, title: 'The Simpsons', genre: 'Animation/Comedy' },
    { id: 71446, title: 'Money Heist', genre: 'Crime/Thriller' },
    { id: 94605, title: 'Arcane', genre: 'Animation/Action' },
    { id: 60735, title: 'The Flash', genre: 'Superhero/Action' },
    { id: 2734, title: 'Law & Order: SVU', genre: 'Crime/Procedural' },
    { id: 4614, title: "Grey's Anatomy", genre: 'Medical/Drama' },
    { id: 63174, title: 'Lucifer', genre: 'Fantasy/Crime' },
    { id: 1402, title: 'The Walking Dead', genre: 'Horror/Drama' },
    { id: 69050, title: 'Riverdale', genre: 'Teen/Mystery' },
    { id: 76479, title: 'The Boys', genre: 'Superhero/Dark' },
  ],
};

const ONBOARDING_THRESHOLD = 20; // Stop asking after 20 rated items
const ONBOARDING_INITIAL_COUNT = 10; // First time: 10 items
const ONBOARDING_FOLLOWUP_COUNT = 3; // Subsequent: 3 items

const DURATION_OPTIONS = [
  { id: 'short', label: '< 90 min', emoji: '⚡', max: 90 },
  { id: 'medium', label: '90-120 min', emoji: '🎬', min: 90, max: 120 },
  { id: 'long', label: '2h+', emoji: '🍿', min: 120 },
  { id: 'any', label: 'Any length', emoji: '🤷', min: 0, max: 999 },
];

const COMMITMENT_OPTIONS = [
  { id: 'one', label: '1 episode', emoji: '📺', seasons: 1 },
  { id: 'night', label: 'One night', emoji: '🌙', seasons: 1 },
  { id: 'weekend', label: 'Weekend binge', emoji: '🛋️', seasons: [1, 2] },
  { id: 'long', label: 'Long journey', emoji: '🗺️', seasons: 3 },
];

const LANGUAGE_OPTIONS = [
  { id: 'any', label: 'Any language', emoji: '🌍' },
  { id: 'original', label: 'English only', emoji: '🇬🇧', code: 'en' },
  { id: 'local', label: 'My language', emoji: '🏠' },
];

// ============================================
// TOAST COMPONENT
// ============================================

const Toast = ({ visible, message, type, onUndo }) => {
  const translateY = useRef(new Animated.Value(100)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 100, duration: 300, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  const getBgColor = () => {
    switch (type) {
      case 'success': return '#4CAF50';
      case 'error': return '#E53935';
      case 'warning': return '#FFB300';
      default: return '#333';
    }
  };

  if (!visible && !message) return null;

  return (
    <Animated.View style={[styles.toastContainer, { transform: [{ translateY }], opacity, backgroundColor: getBgColor() }]}>
      <Text style={styles.toastMessage}>{message}</Text>
      {onUndo && (
        <TouchableOpacity onPress={onUndo} style={styles.toastUndoBtn}>
          <Text style={styles.toastUndoText}>Undo</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

// ============================================
// MAIN APP
// ============================================

const App = () => {
  // Theme
  const [isDarkMode, setIsDarkMode] = useState(true);
  const theme = isDarkMode ? THEMES.dark : THEMES.light;
  
  // Navigation
  const [currentScreen, setCurrentScreen] = useState(SCREENS.LOADING);
  const [previousScreen, setPreviousScreen] = useState(null);
  
  // Data
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [watchlist, setWatchlist] = useState([]);
  const [likedList, setLikedList] = useState([]);
  const [skippedList, setSkippedList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [contentType, setContentType] = useState('movie');
  
  // Details
  const [movieDetails, setMovieDetails] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [trailers, setTrailers] = useState([]);
  const [similarContent, setSimilarContent] = useState([]);
  
  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchTimeout = useRef(null);
  
  // Filters
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [selectedRating, setSelectedRating] = useState(null);
  const [sortField, setSortField] = useState('popularity');
  const [sortDirection, setSortDirection] = useState('desc');
  
  // Modals
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSortModal, setShowSortModal] = useState(false);
  const [showAddToListModal, setShowAddToListModal] = useState(false);
  const [itemToAdd, setItemToAdd] = useState(null);
  
  // Lists
  const [activeListTab, setActiveListTab] = useState('watchlist');
  const [listTypeFilter, setListTypeFilter] = useState('all');

  // Toast
  const [toast, setToast] = useState({ visible: false, message: '', type: 'info', onUndo: null });
  const toastTimeout = useRef(null);

  // Recommendation Flow
  const [recommendStep, setRecommendStep] = useState(0);
  const [recommendType, setRecommendType] = useState(null); // 'movie' or 'tv'
  const [recommendMood, setRecommendMood] = useState(null);
  const [recommendSubMood, setRecommendSubMood] = useState(null);
  const [recommendDuration, setRecommendDuration] = useState(null);
  const [recommendLanguage, setRecommendLanguage] = useState(null);
  const [recommendation, setRecommendation] = useState(null);
  const [recommendationExplanation, setRecommendationExplanation] = useState(null);
  const [recommendLoading, setRecommendLoading] = useState(false);
  const [userLanguage, setUserLanguage] = useState(null); // detected/set language
  const [suggestedIds, setSuggestedIds] = useState([]); // Track suggested movies in session

// Onboarding
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [onboardingMovies, setOnboardingMovies] = useState([]);
  const [onboardingIndex, setOnboardingIndex] = useState(0);
  const [onboardingRatings, setOnboardingRatings] = useState({});
  const [onboardingLoading, setOnboardingLoading] = useState(false);
  const [totalRated, setTotalRated] = useState(0); // Track total items user has rated
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  // ============================================
  // TOAST FUNCTIONS
  // ============================================

  const showToast = (message, type = 'info', duration = 3000, undoAction = null) => {
    if (toastTimeout.current) clearTimeout(toastTimeout.current);
    setToast({ visible: true, message, type, onUndo: undoAction ? () => { undoAction(); hideToast(); } : null });
    toastTimeout.current = setTimeout(() => hideToast(), duration);
  };

  const hideToast = () => setToast(prev => ({ ...prev, visible: false }));

  // ============================================
  // INITIALIZATION
  // ============================================
  
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    await loadSettings();
    await loadLists();
    setTimeout(() => setCurrentScreen(SCREENS.HOME), 1500);
  };

  // ============================================
  // STORAGE
  // ============================================

  const loadSettings = async () => {
    try {
      const saved = await AsyncStorage.getItem('@isDarkMode');
      if (saved !== null) setIsDarkMode(JSON.parse(saved));
    } catch (e) { console.error('Error loading settings:', e); }
  };

  const saveTheme = async (isDark) => {
    try { await AsyncStorage.setItem('@isDarkMode', JSON.stringify(isDark)); }
    catch (e) { console.error('Error saving theme:', e); }
  };

  const loadLists = async () => {
    try {
      const [w, l, s] = await Promise.all([
        AsyncStorage.getItem('@watchlist'),
        AsyncStorage.getItem('@likedList'),
        AsyncStorage.getItem('@skippedList'),
      ]);
      if (w) setWatchlist(JSON.parse(w));
      if (l) setLikedList(JSON.parse(l));
      if (s) setSkippedList(JSON.parse(s));
    } catch (e) {
      console.error('Error loading lists:', e);
      showToast('Error loading lists', 'error');
    }
  };

  const saveWatchlist = async (list) => {
    try { await AsyncStorage.setItem('@watchlist', JSON.stringify(list)); }
    catch (e) { showToast('Error saving', 'error'); }
  };

  const saveLikedList = async (list) => {
    try { await AsyncStorage.setItem('@likedList', JSON.stringify(list)); }
    catch (e) { showToast('Error saving', 'error'); }
  };

  const saveSkippedList = async (list) => {
    try { await AsyncStorage.setItem('@skippedList', JSON.stringify(list)); }
    catch (e) { console.error('Error saving skipped:', e); }
  };

  // ============================================
  // API CALLS
  // ============================================

  const fetchContent = useCallback(async (type, genres, provider, rating, sField, sDirection) => {
    setLoading(true);
    setMovieDetails(null);
    
    try {
      let sortFieldApi = sField;
      if (sField === 'primary_release_date' && type === 'tv') sortFieldApi = 'first_air_date';
      
      const params = {
        api_key: TMDB_API_KEY, language: 'en-US',
        sort_by: `${sortFieldApi}.${sDirection}`,
        page: Math.floor(Math.random() * 5) + 1,
        'vote_count.gte': 50,
      };

      if (genres.length > 0) params.with_genres = genres.join(',');
      if (rating) params['vote_average.gte'] = rating;
      if (provider) { params.with_watch_providers = provider; params.watch_region = 'PT'; }

      const response = await axios.get(`https://api.themoviedb.org/3/discover/${type}`, { params });
      const results = response.data.results.filter(item => item.poster_path);
      
      setMovies(results);
      setCurrentIndex(0);
      
      if (results.length > 0) fetchMovieDetails(results[0].id, type);
      else showToast('No results found', 'warning');
    } catch (error) {
      console.error('Error fetching:', error);
      showToast('Failed to load content', 'error');
    }
    setLoading(false);
  }, []);

  const fetchMovieDetails = async (id, type) => {
    try {
      const [detailsRes, videosRes, similarRes] = await Promise.all([
        axios.get(`https://api.themoviedb.org/3/${type}/${id}`, {
          params: { api_key: TMDB_API_KEY, language: 'en-US', append_to_response: 'credits,watch/providers' },
        }),
        axios.get(`https://api.themoviedb.org/3/${type}/${id}/videos`, {
          params: { api_key: TMDB_API_KEY, language: 'en-US' },
        }),
        axios.get(`https://api.themoviedb.org/3/${type}/${id}/similar`, {
          params: { api_key: TMDB_API_KEY, language: 'en-US', page: 1 },
        }),
      ]);
      
      setMovieDetails(detailsRes.data);
      setTrailers(videosRes.data.results.filter(v => v.site === 'YouTube' && (v.type === 'Trailer' || v.type === 'Teaser')));
      setSimilarContent(similarRes.data.results.slice(0, 10));
    } catch (error) { console.error('Error fetching details:', error); }
  };

  const searchContent = async (query) => {
    if (!query.trim()) { setSearchResults([]); return; }
    
    setSearchLoading(true);
    try {
      const [moviesRes, tvRes] = await Promise.all([
        axios.get('https://api.themoviedb.org/3/search/movie', { params: { api_key: TMDB_API_KEY, language: 'en-US', query, page: 1 } }),
        axios.get('https://api.themoviedb.org/3/search/tv', { params: { api_key: TMDB_API_KEY, language: 'en-US', query, page: 1 } }),
      ]);
      
      const movies = moviesRes.data.results.map(m => ({ ...m, mediaType: 'movie' }));
      const tvShows = tvRes.data.results.map(t => ({ ...t, mediaType: 'tv' }));
      const combined = [...movies, ...tvShows].filter(item => item.poster_path).sort((a, b) => b.popularity - a.popularity).slice(0, 20);
      setSearchResults(combined);
    } catch (error) {
      console.error('Error searching:', error);
      showToast('Search failed', 'error');
    }
    setSearchLoading(false);
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => searchContent(text), 500);
  };

  // ============================================
  // ACTIONS
  // ============================================

  const handleSwipe = (direction) => {
    const current = movies[currentIndex];
    if (!current) return;

    if (direction === 'right') {
      addToWatchlist(current);
      showToast('Added to Watchlist', 'success', 4000, () => undoAddToWatchlist(current));
    } else if (direction === 'up') {
      addToLiked(current);
      showToast('Added to Liked', 'success', 4000, () => undoAddToLiked(current));
    } else if (direction === 'left') {
      addToSkipped(current);
      showToast('Skipped', 'info', 4000, () => undoSkip(current));
    }
    goToNext();
  };

  const goToNext = () => {
    if (currentIndex < movies.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setMovieDetails(null);
      setTrailers([]);
      fetchMovieDetails(movies[nextIndex].id, contentType);
    } else {
      fetchContent(contentType, selectedGenres, selectedProvider, selectedRating, sortField, sortDirection);
    }
  };

  const addToWatchlist = (item) => {
    if (watchlist.some(w => w.id === item.id)) return;
    const newLiked = likedList.filter(l => l.id !== item.id);
    if (newLiked.length !== likedList.length) { setLikedList(newLiked); saveLikedList(newLiked); }
    const newItem = { ...item, mediaType: item.mediaType || contentType, addedAt: new Date().toISOString() };
    const newList = [newItem, ...watchlist];
    setWatchlist(newList);
    saveWatchlist(newList);
  };

  const undoAddToWatchlist = (item) => {
    const newList = watchlist.filter(w => w.id !== item.id);
    setWatchlist(newList);
    saveWatchlist(newList);
    showToast('Undone', 'info', 2000);
  };

  const addToLiked = (item) => {
    if (likedList.some(l => l.id === item.id)) return;
    const newWatchlist = watchlist.filter(w => w.id !== item.id);
    if (newWatchlist.length !== watchlist.length) { setWatchlist(newWatchlist); saveWatchlist(newWatchlist); }
    const newItem = { ...item, mediaType: item.mediaType || contentType, addedAt: new Date().toISOString() };
    const newList = [newItem, ...likedList];
    setLikedList(newList);
    saveLikedList(newList);
  };

  const undoAddToLiked = (item) => {
    const newList = likedList.filter(l => l.id !== item.id);
    setLikedList(newList);
    saveLikedList(newList);
    showToast('Undone', 'info', 2000);
  };

  const addToSkipped = (item) => {
    const newItem = { ...item, mediaType: item.mediaType || contentType, skippedAt: new Date().toISOString() };
    const newList = [newItem, ...skippedList.filter(s => s.id !== item.id)].slice(0, 100);
    setSkippedList(newList);
    saveSkippedList(newList);
  };

  const undoSkip = (item) => {
    const newList = skippedList.filter(s => s.id !== item.id);
    setSkippedList(newList);
    saveSkippedList(newList);
    showToast('Undone', 'info', 2000);
  };

  const removeFromList = (item, listType) => {
    const undoData = { item, listType };
    if (listType === 'watchlist') {
      const newList = watchlist.filter(w => w.id !== item.id);
      setWatchlist(newList);
      saveWatchlist(newList);
    } else {
      const newList = likedList.filter(l => l.id !== item.id);
      setLikedList(newList);
      saveLikedList(newList);
    }
    showToast('Removed', 'info', 4000, () => undoRemove(undoData));
  };

  const undoRemove = ({ item, listType }) => {
    if (listType === 'watchlist') {
      const newList = [item, ...watchlist];
      setWatchlist(newList);
      saveWatchlist(newList);
    } else {
      const newList = [item, ...likedList];
      setLikedList(newList);
      saveLikedList(newList);
    }
    showToast('Restored', 'success', 2000);
  };

  const moveToOtherList = (item, fromList) => {
    if (fromList === 'watchlist') {
      removeFromList(item, 'watchlist');
      addToLiked(item);
      showToast('Moved to Liked', 'success');
    } else {
      removeFromList(item, 'liked');
      addToWatchlist(item);
      showToast('Moved to Watchlist', 'success');
    }
  };

  const clearList = (listType) => {
    Alert.alert('Clear List', `Clear your entire ${listType === 'watchlist' ? 'Watchlist' : 'Liked'} list?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => {
        if (listType === 'watchlist') { setWatchlist([]); saveWatchlist([]); }
        else { setLikedList([]); saveLikedList([]); }
        showToast('List cleared', 'info');
      }},
    ]);
  };

  const startSwiping = (type) => {
    setContentType(type);
    setSelectedGenres([]);
    setSelectedProvider(null);
    setSelectedRating(null);
    setSortField('popularity');
    setSortDirection('desc');
    setCurrentScreen(SCREENS.SWIPE);
    fetchContent(type, [], null, null, 'popularity', 'desc');
  };

  const openDetails = (item, type = null) => {
    setSelectedItem({ ...item, mediaType: type || item.mediaType || contentType });
    setPreviousScreen(currentScreen);
    setCurrentScreen(SCREENS.DETAILS);
    fetchMovieDetails(item.id, type || item.mediaType || contentType);
  };

  const openTrailer = (videoKey) => Linking.openURL(`https://www.youtube.com/watch?v=${videoKey}`);
  
  const showAddModal = (item) => { setItemToAdd(item); setShowAddToListModal(true); };

  const toggleTheme = () => {
    const newValue = !isDarkMode;
    setIsDarkMode(newValue);
    saveTheme(newValue);
    showToast(`${newValue ? 'Dark' : 'Light'} mode enabled`, 'info', 2000);
  };

  const applyFilters = () => {
    setShowFilterModal(false);
    fetchContent(contentType, selectedGenres, selectedProvider, selectedRating, sortField, sortDirection);
  };

  const applySort = () => {
    setShowSortModal(false);
    fetchContent(contentType, selectedGenres, selectedProvider, selectedRating, sortField, sortDirection);
  };

  const resetFilters = () => {
    setSelectedGenres([]);
    setSelectedProvider(null);
    setSelectedRating(null);
  };

  const toggleGenre = useCallback((genreId) => {
    setSelectedGenres(prev => prev.includes(genreId) ? prev.filter(id => id !== genreId) : [...prev, genreId]);
  }, []);

  // ============================================
  // HELPERS
  // ============================================

  const getGenres = () => contentType === 'movie' ? MOVIE_GENRES : TV_GENRES;
  const hasActiveFilters = () => selectedGenres.length > 0 || selectedProvider !== null || selectedRating !== null;
  const getActiveFilterCount = () => {
    let count = selectedGenres.length;
    if (selectedProvider !== null) count++;
    if (selectedRating !== null) count++;
    return count;
  };
  const getSortLabel = () => {
    const field = SORT_FIELDS.find(f => f.id === sortField);
    return `${field?.name || 'Popularity'} ${sortDirection === 'desc' ? '↓' : '↑'}`;
  };
  const getDirector = () => movieDetails?.credits?.crew?.find(p => p.job === 'Director')?.name;
  const getCast = () => movieDetails?.credits?.cast?.slice(0, 5).map(p => p.name) || [];
  const getRuntime = () => {
    if ((contentType === 'movie' || selectedItem?.mediaType === 'movie') && movieDetails?.runtime) return `${movieDetails.runtime} min`;
    const runtime = movieDetails?.episode_run_time?.[0];
    return runtime ? `${runtime} min/ep` : null;
  };
  const getProviders = () => {
    const providers = movieDetails?.['watch/providers']?.results?.PT?.flatrate;
    return providers?.slice(0, 3).map(p => p.provider_name).join(', ') || null;
  };
  const isInWatchlist = (id) => watchlist.some(w => w.id === id);
  const isInLiked = (id) => likedList.some(l => l.id === id);
  const getFilteredList = () => {
    const list = activeListTab === 'watchlist' ? watchlist : likedList;
    if (listTypeFilter === 'all') return list;
    return list.filter(item => item.mediaType === listTypeFilter);
  };
  const getListCounts = (list) => ({
    all: list.length,
    movies: list.filter(item => item.mediaType === 'movie').length,
    tv: list.filter(item => item.mediaType === 'tv').length,
  });

  // ============================================
  // RECOMMENDATION ENGINE
  // ============================================

  const startRecommendation = (type) => {
  setRecommendType(type);
  setRecommendation(null);
  setRecommendationExplanation(null);

  // Check if needs onboarding
  if (checkNeedsOnboarding()) {
    startOnboarding(type); // Pass type directly to avoid async state issue
    setRecommendStep(0.5); // Special step for onboarding
  } else {
    setRecommendStep(1);
  }

  setCurrentScreen(SCREENS.RECOMMEND);
};

const enterWatchNext = () => {
  // Clean slate when entering WatchNext
  setRecommendStep(0);
  setRecommendType(null);
  setRecommendMood(null);
  setRecommendSubMood(null);
  setRecommendDuration(null);
  setRecommendLanguage(null);
  setRecommendation(null);
  setRecommendationExplanation(null);
  setSuggestedIds([]);
  setNeedsOnboarding(false);
  setOnboardingMovies([]);
  setOnboardingIndex(0);
  setOnboardingRatings({});
  setCurrentScreen(SCREENS.RECOMMEND);
};


  const resetRecommendation = () => {
    setRecommendStep(0);
    setRecommendType(null);
    setRecommendMood(null);
    setRecommendSubMood(null);
    setRecommendDuration(null);
    setRecommendLanguage(null);
    setRecommendation(null);
    setRecommendationExplanation(null);
    setSuggestedIds([]); // Clear suggested when leaving
    setCurrentScreen(SCREENS.HOME);
  };

  const loadOnboardingStatus = async () => {
  try {
    const rated = await AsyncStorage.getItem('@totalRated');
    if (rated) {
      const count = parseInt(rated, 10);
      setTotalRated(count);
      setOnboardingComplete(count >= ONBOARDING_THRESHOLD);
    }
  } catch (e) {
    console.error('Error loading onboarding status:', e);
  }
};

  const analyzeUserPreferences = () => {
    const analysis = {
      topGenres: [],
      avgRating: 0,
      skippedGenres: [],
      preferredDuration: null,
      totalLiked: likedList.length,
      totalSkipped: skippedList.length,
    };

    // Analyze liked items
    if (likedList.length > 0) {
      const genreCount = {};
      let totalRating = 0;
      let totalDuration = 0;
      let durationCount = 0;

      likedList.forEach(item => {
        (item.genre_ids || []).forEach(gid => {
          genreCount[gid] = (genreCount[gid] || 0) + 1;
        });
        totalRating += item.vote_average || 0;
        if (item.runtime) {
          totalDuration += item.runtime;
          durationCount++;
        }
      });

      analysis.topGenres = Object.entries(genreCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([gid, count]) => ({
          id: parseInt(gid),
          count,
          percentage: Math.round((count / likedList.length) * 100)
        }));

      analysis.avgRating = totalRating / likedList.length;
      if (durationCount > 0) {
        analysis.preferredDuration = totalDuration / durationCount;
      }
    }

    // Analyze skipped items for negative signals
    if (skippedList.length > 3) {
      const skippedGenreCount = {};
      skippedList.forEach(item => {
        (item.genre_ids || []).forEach(gid => {
          skippedGenreCount[gid] = (skippedGenreCount[gid] || 0) + 1;
        });
      });

      const likedGenreIds = analysis.topGenres.map(g => g.id);
      analysis.skippedGenres = Object.entries(skippedGenreCount)
        .filter(([gid]) => !likedGenreIds.includes(parseInt(gid)))
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([gid, count]) => ({
          id: parseInt(gid),
          count,
          percentage: Math.round((count / skippedList.length) * 100)
        }));
    }

    return analysis;
  };

  const calculateWeights = (mood, duration) => {
    const weights = {
      genres: 0.35,
      mood: 0.25,
      similarToLiked: 0.25,
      popularity: 0.10,
      recency: 0.05,
    };

    // Dynamic weight adjustment
    if (mood && mood !== 'surprise') {
      weights.mood = 0.40;
      weights.genres = 0.25;
    }

    if (mood === 'surprise') {
      weights.mood = 0;
      weights.popularity = 0.30;
      weights.recency = 0.15;
    }

    if (duration === 'any') {
      // Redistribute duration weight
      weights.genres += 0.05;
      weights.similarToLiked += 0.05;
    }

    if (likedList.length < 5) {
      weights.popularity = 0.35;
      weights.similarToLiked = 0.10;
      weights.genres = 0.30;
    }

    return weights;
  };

  const scoreContent = (item, userPrefs, weights, moodGenres, durationFilter) => {
    let score = 0;
    const reasons = { positive: [], negative: [] };
    const itemGenres = item.genre_ids || [];

    // Genre match
    const matchedTopGenres = userPrefs.topGenres.filter(g => itemGenres.includes(g.id));
    if (matchedTopGenres.length > 0) {
      const genreScore = matchedTopGenres.reduce((sum, g) => sum + g.percentage, 0) / 100;
      score += genreScore * weights.genres;
      const topMatch = matchedTopGenres[0];
      const genreName = [...MOVIE_GENRES, ...TV_GENRES].find(g => g.id === topMatch.id)?.name;
      if (genreName) {
        reasons.positive.push(`Matches your love for ${genreName} (${topMatch.percentage}% of liked)`);
      }
    }

    // Mood match
    if (moodGenres.length > 0) {
      const moodMatch = itemGenres.some(gid => moodGenres.includes(gid));
      if (moodMatch) {
        score += weights.mood;
        reasons.positive.push(`Fits your "${MOODS.find(m => m.id === recommendMood)?.label}" mood`);
      }
    }

    // Rating match
    if (userPrefs.avgRating > 0 && item.vote_average >= userPrefs.avgRating - 0.5) {
      score += weights.similarToLiked * 0.5;
      if (item.vote_average >= 7.5) {
        reasons.positive.push(`High rating: ${item.vote_average.toFixed(1)}⭐`);
      }
    }

    // Popularity
    const popularityScore = Math.min(item.popularity / 100, 1);
    score += popularityScore * weights.popularity;

    // Check for skipped genres (negative signal)
    const matchedSkipped = userPrefs.skippedGenres.filter(g => itemGenres.includes(g.id));
    if (matchedSkipped.length > 0) {
      score -= 0.2 * matchedSkipped.length;
      const skippedGenreName = [...MOVIE_GENRES, ...TV_GENRES].find(g => g.id === matchedSkipped[0].id)?.name;
      if (skippedGenreName && matchedSkipped[0].percentage > 30) {
        reasons.negative.push(`Contains ${skippedGenreName} (you skip this ${matchedSkipped[0].percentage}% of times)`);
      }
    }

    // Already in lists check
    if (isInWatchlist(item.id) || isInLiked(item.id)) {
      score = -1; // Exclude
    }

    return { score, reasons };
  };

  const generateRecommendation = async () => {
    setRecommendLoading(true);

    try {
      const userPrefs = analyzeUserPreferences();
      const weights = calculateWeights(recommendMood, recommendDuration);
      const moodData = MOODS.find(m => m.id === recommendMood);
      // Use sub-mood genres if selected, otherwise fall back to main mood
      const moodGenres = recommendSubMood?.genres || moodData?.genres || [];
      const moodKeywords = recommendSubMood?.keywords || null;
      const durationData = DURATION_OPTIONS.find(d => d.id === recommendDuration);

      // Helper function to fetch with given params
      const fetchWithParams = async (searchParams) => {
        const response = await axios.get(
          `https://api.themoviedb.org/3/discover/${recommendType}`,
          { params: searchParams }
        );
        return response.data.results.filter(item =>
          item.poster_path &&
          !isInWatchlist(item.id) &&
          !isInLiked(item.id) &&
          !skippedList.some(s => s.id === item.id) &&
          !suggestedIds.includes(item.id)
        );
      };

      // Build base API params (less restrictive defaults)
      const baseParams = {
        api_key: TMDB_API_KEY,
        language: 'en-US',
        sort_by: 'popularity.desc',
        'vote_count.gte': 50, // Lowered from 100
      };

      // Language filter
      if (recommendLanguage === 'original') {
        baseParams.with_original_language = 'en';
      } else if (recommendLanguage === 'local' && userLanguage) {
        baseParams.with_original_language = userLanguage;
      }

      // Duration filter for movies
      if (recommendType === 'movie' && durationData && recommendDuration !== 'any') {
        if (durationData.max) baseParams['with_runtime.lte'] = durationData.max;
        if (durationData.min) baseParams['with_runtime.gte'] = durationData.min;
      }

      let allCandidates = [];

      // Strategy 1: Try with ALL genres (AND logic) - most specific
      if (moodGenres.length > 0 && recommendMood !== 'surprise') {
        const params1 = { ...baseParams, with_genres: moodGenres.join(','), page: 1 };
        const params2 = { ...baseParams, with_genres: moodGenres.join(','), page: 2 };
        const params3 = { ...baseParams, with_genres: moodGenres.join(','), page: 3 };

        const [results1, results2, results3] = await Promise.all([
          fetchWithParams(params1).catch(() => []),
          fetchWithParams(params2).catch(() => []),
          fetchWithParams(params3).catch(() => [])
        ]);
        allCandidates = [...results1, ...results2, ...results3];

        console.log('🎯 Strategy 1 (AND genres):', allCandidates.length, 'candidates');
      }

      // Strategy 2: If not enough, try with ANY genre (OR logic)
      if (allCandidates.length < 5 && moodGenres.length > 1 && recommendMood !== 'surprise') {
        const paramsOr1 = { ...baseParams, with_genres: moodGenres.join('|'), page: 1 };
        const paramsOr2 = { ...baseParams, with_genres: moodGenres.join('|'), page: 2 };

        const [resultsOr1, resultsOr2] = await Promise.all([
          fetchWithParams(paramsOr1).catch(() => []),
          fetchWithParams(paramsOr2).catch(() => [])
        ]);

        // Add unique items only
        const existingIds = new Set(allCandidates.map(c => c.id));
        const newItems = [...resultsOr1, ...resultsOr2].filter(item => !existingIds.has(item.id));
        allCandidates = [...allCandidates, ...newItems];

        console.log('🎯 Strategy 2 (OR genres):', allCandidates.length, 'total candidates');
      }

      // Strategy 3: If still not enough, try just the primary genre
      if (allCandidates.length < 5 && moodGenres.length > 0) {
        const primaryGenre = moodGenres[0];
        const paramsPrimary1 = { ...baseParams, with_genres: primaryGenre.toString(), page: 1 };
        const paramsPrimary2 = { ...baseParams, with_genres: primaryGenre.toString(), page: 2 };

        const [resultsPrimary1, resultsPrimary2] = await Promise.all([
          fetchWithParams(paramsPrimary1).catch(() => []),
          fetchWithParams(paramsPrimary2).catch(() => [])
        ]);

        const existingIds = new Set(allCandidates.map(c => c.id));
        const newItems = [...resultsPrimary1, ...resultsPrimary2].filter(item => !existingIds.has(item.id));
        allCandidates = [...allCandidates, ...newItems];

        console.log('🎯 Strategy 3 (primary genre only):', allCandidates.length, 'total candidates');
      }

      // Strategy 4: Surprise mode or final fallback - popular content
      if (allCandidates.length < 5 || recommendMood === 'surprise') {
        let fallbackParams = { ...baseParams, page: Math.floor(Math.random() * 5) + 1 };

        // For surprise, use user preferences if available
        if (recommendMood === 'surprise' && userPrefs.topGenres.length > 0) {
          fallbackParams.with_genres = userPrefs.topGenres.slice(0, 2).map(g => g.id).join('|');
        }

        const resultsFallback = await fetchWithParams(fallbackParams).catch(() => []);

        const existingIds = new Set(allCandidates.map(c => c.id));
        const newItems = resultsFallback.filter(item => !existingIds.has(item.id));
        allCandidates = [...allCandidates, ...newItems];

        console.log('🎯 Strategy 4 (fallback/surprise):', allCandidates.length, 'total candidates');
      }

      // Strategy 5: Last resort - remove duration filter and try again
      if (allCandidates.length < 3 && recommendType === 'movie' && recommendDuration !== 'any') {
        const relaxedParams = { ...baseParams, page: 1 };
        delete relaxedParams['with_runtime.lte'];
        delete relaxedParams['with_runtime.gte'];

        if (moodGenres.length > 0) {
          relaxedParams.with_genres = moodGenres[0].toString();
        }

        const resultsRelaxed = await fetchWithParams(relaxedParams).catch(() => []);

        const existingIds = new Set(allCandidates.map(c => c.id));
        const newItems = resultsRelaxed.filter(item => !existingIds.has(item.id));
        allCandidates = [...allCandidates, ...newItems];

        console.log('🎯 Strategy 5 (relaxed duration):', allCandidates.length, 'total candidates');
      }

      console.log('🎯 Final candidates count:', allCandidates.length);

      if (allCandidates.length === 0) {
        showToast('No matches found. Try different options.', 'warning');
        setRecommendLoading(false);
        return;
      }

      // Score all candidates
      let scored = allCandidates.map(item => ({
        item,
        ...scoreContent(item, userPrefs, weights, moodGenres, durationData)
      }));

      // Filter to positive scores, but keep at least some if all are zero/negative
      const positiveScored = scored.filter(s => s.score > 0);
      if (positiveScored.length > 0) {
        scored = positiveScored;
      } else {
        // Keep top items by raw popularity if no positive scores
        scored = scored.sort((a, b) => (b.item.popularity || 0) - (a.item.popularity || 0)).slice(0, 10);
        // Give them a minimal positive score
        scored = scored.map(s => ({ ...s, score: 0.5 }));
      }

      // Apply collaborative filtering boost
      scored = await getCollaborativeBoost(scored, userPrefs);

      // Sort by final score
      scored.sort((a, b) => b.score - a.score);

      if (scored.length === 0) {
        showToast('No good matches. Try different options.', 'warning');
        setRecommendLoading(false);
        return;
      }

      // Pick top result (with slight randomness in top 3)
      const topCandidates = scored.slice(0, Math.min(3, scored.length));
      const selected = topCandidates[Math.floor(Math.random() * topCandidates.length)];

      // Fetch full details
      const detailsRes = await axios.get(
        `https://api.themoviedb.org/3/${recommendType}/${selected.item.id}`,
        { params: { api_key: TMDB_API_KEY, language: 'en-US', append_to_response: 'credits,watch/providers' } }
      );

      // Build explanation
      const explanation = {
        positive: selected.reasons.positive,
        negative: selected.reasons.negative.slice(0, 1), // Max 1 negative
        confidence: Math.min(0.95, Math.max(0.60, selected.score)),
        weights: weights,
        userPrefs: {
          totalLiked: userPrefs.totalLiked,
          avgRating: userPrefs.avgRating.toFixed(1),
        }
      };

      // Add provider info
      const providers = detailsRes.data['watch/providers']?.results?.PT?.flatrate;
      if (providers?.length > 0) {
        explanation.positive.push(`Available on ${providers[0].provider_name}`);
      }

      // Add duration info for movies
      if (recommendType === 'movie' && detailsRes.data.runtime) {
        const runtime = detailsRes.data.runtime;
        if (recommendDuration !== 'any') {
          explanation.positive.push(`${runtime} min - fits your time`);
        }
      }

      // Add to suggested list so it won't repeat
      setSuggestedIds(prev => [...prev, selected.item.id]);

      setRecommendation({ ...selected.item, ...detailsRes.data, mediaType: recommendType });
      setRecommendationExplanation(explanation);
      setRecommendStep(4); // Show result

    } catch (error) {
      console.error('Recommendation error:', error);
      showToast('Something went wrong. Try again.', 'error');
    }

    setRecommendLoading(false);
  };

  const getConfidenceLabel = (confidence) => {
    if (confidence >= 0.85) return { text: 'Very confident', color: '#4CAF50' };
    if (confidence >= 0.70) return { text: 'Confident', color: '#8BC34A' };
    if (confidence >= 0.55) return { text: 'Good match', color: '#FFB300' };
    return { text: 'Worth a try', color: '#FF9800' };
  };

  const getAnotherSuggestion = () => {
    // Keep all parameters, just get a new recommendation
    setRecommendation(null);
    setRecommendationExplanation(null);
    generateRecommendation();
  };

  // ============================================
  // ONBOARDING
  // ============================================

  const getCollaborativeBoost = async (candidates, userPrefs) => {
  if (likedList.length < 3) return candidates; // Not enough data
  
  try {
    // Get similar movies for top 3 liked items
    const recentLiked = likedList
      .filter(l => l.mediaType === recommendType)
      .slice(0, 3);
    
    if (recentLiked.length === 0) return candidates;
    
    const similarPromises = recentLiked.map(item =>
      axios.get(`https://api.themoviedb.org/3/${recommendType}/${item.id}/similar`, {
        params: { api_key: TMDB_API_KEY, language: 'en-US', page: 1 }
      }).then(res => res.data.results.map(r => r.id))
      .catch(() => [])
    );
    
    const similarResults = await Promise.all(similarPromises);
    const similarIds = [...new Set(similarResults.flat())]; // Unique IDs
    
    // Boost candidates that appear in similar lists
    return candidates.map(c => {
      const similarCount = similarIds.filter(id => id === c.item.id).length;
      if (similarCount > 0) {
        const boost = 0.15 * similarCount; // +15% per match
        return {
          ...c,
          score: c.score + boost,
          reasons: {
            ...c.reasons,
            positive: [
              ...c.reasons.positive,
              `Similar to ${similarCount > 1 ? 'multiple' : 'a'} ${recommendType === 'tv' ? 'show' : 'movie'}${similarCount > 1 ? 's' : ''} you loved`
            ]
          }
        };
      }
      return c;
    });
  } catch (error) {
    console.error('Collaborative filtering error:', error);
    return candidates;
  }
};

  const checkNeedsOnboarding = () => {
    // Calculate total rated items (liked + meaningful skips from onboarding)
    const currentRated = totalRated + likedList.filter(l => l.fromOnboarding).length;
    return currentRated < ONBOARDING_THRESHOLD;
  };

  const getOnboardingCount = () => {
    // First time: 10, subsequent: 3
    if (totalRated === 0 && likedList.filter(l => l.fromOnboarding).length === 0) {
      return ONBOARDING_INITIAL_COUNT;
    }
    return ONBOARDING_FOLLOWUP_COUNT;
  };

  const startOnboarding = async (type) => {
    // Use passed type parameter to avoid async state timing issues
    const contentType = type || recommendType || 'movie';

    setNeedsOnboarding(true); // Set immediately to prevent black screen
    setOnboardingLoading(true);
    setOnboardingIndex(0);
    setOnboardingRatings({});

    try {
      const contentList = ONBOARDING_CONTENT[contentType] || ONBOARDING_CONTENT.movie;
      const count = getOnboardingCount();

      console.log('🎬 Onboarding - contentType:', contentType);
      console.log('🎬 Onboarding - contentList length:', contentList?.length);

      // Get IDs of already rated content (liked, skipped, or in watchlist)
      const alreadyRatedIds = [
        ...likedList.map(l => l.id),
        ...skippedList.map(s => s.id),
        ...watchlist.map(w => w.id),
      ];

      console.log('🎬 Onboarding - alreadyRatedIds:', alreadyRatedIds.length);

      // Filter out already rated and shuffle
      const availableContent = contentList
        .filter(c => !alreadyRatedIds.includes(c.id))
        .sort(() => Math.random() - 0.5)
        .slice(0, count);

      console.log('🎬 Onboarding - availableContent:', availableContent.length, availableContent.map(c => c.id));

      if (availableContent.length === 0) {
        // No more content to rate, skip onboarding
        console.log('🎬 Onboarding - No available content, skipping');
        setOnboardingComplete(true);
        setOnboardingLoading(false);
        setNeedsOnboarding(false);
        setRecommendStep(1);
        return;
      }

      // Fetch details for selected content
      const endpoint = contentType === 'tv' ? 'tv' : 'movie';
      console.log('🎬 Onboarding - fetching from endpoint:', endpoint);

      const contentPromises = availableContent.map(item =>
        axios.get(`https://api.themoviedb.org/3/${endpoint}/${item.id}`, {
          params: { api_key: TMDB_API_KEY, language: 'en-US' }
        }).then(res => {
          console.log('🎬 Onboarding - fetched:', item.id, res.data?.title || res.data?.name);
          return { ...res.data, onboardingGenre: item.genre, mediaType: contentType };
        })
        .catch((err) => {
          console.error('🎬 Onboarding - fetch failed for:', item.id, err.message);
          return null;
        })
      );

      const results = await Promise.all(contentPromises);
      const validContent = results.filter(m => m !== null);

      console.log('🎬 Onboarding - validContent:', validContent.length);

      if (validContent.length === 0) {
        // All fetches failed, skip onboarding
        console.log('🎬 Onboarding - All fetches failed, skipping');
        setOnboardingComplete(true);
        setNeedsOnboarding(false);
        setOnboardingLoading(false);
        setRecommendStep(1);
      } else {
        setOnboardingMovies(validContent);
        setNeedsOnboarding(true);
        setOnboardingLoading(false);
      }
    } catch (error) {
      console.error('Onboarding error:', error);
      showToast('Could not load taste profile', 'error');
      setNeedsOnboarding(false);
      setOnboardingLoading(false);
      setRecommendStep(1);
    }
  };

  const handleOnboardingRate = (movieId, rating) => {
    const newRatings = { ...onboardingRatings, [movieId]: rating };
    setOnboardingRatings(newRatings);
    
    // Move to next or finish
    if (onboardingIndex < onboardingMovies.length - 1) {
      setOnboardingIndex(onboardingIndex + 1);
    } else {
      finishOnboarding(newRatings);
    }
  };

  const finishOnboarding = async (ratings) => {
    const liked = [];
    const skipped = [];
    
    onboardingMovies.forEach(item => {
      const rating = ratings[item.id];
      if (rating === 'like') {
        liked.push({
          ...item,
          mediaType: recommendType,
          addedAt: new Date().toISOString(),
          fromOnboarding: true,
        });
      } else if (rating === 'dislike') {
        skipped.push({
          ...item,
          mediaType: recommendType,
          skippedAt: new Date().toISOString(),
          fromOnboarding: true,
        });
      }
    });
    
    // Add to lists
    if (liked.length > 0) {
      const newLikedList = [...liked, ...likedList];
      setLikedList(newLikedList);
      saveLikedList(newLikedList);
    }
    
    if (skipped.length > 0) {
      const newSkippedList = [...skipped, ...skippedList];
      setSkippedList(newSkippedList);
      saveSkippedList(newSkippedList);
    }
    
    // Update total rated count
    const newTotalRated = totalRated + liked.length + skipped.length;
    setTotalRated(newTotalRated);
    await AsyncStorage.setItem('@totalRated', newTotalRated.toString());
    
    // Check if we've reached threshold
    if (newTotalRated >= ONBOARDING_THRESHOLD) {
      setOnboardingComplete(true);
      showToast('Taste profile complete! 🎉', 'success');
    } else {
      const remaining = ONBOARDING_THRESHOLD - newTotalRated;
      showToast(`Got it! ${remaining} more ratings to perfect your profile`, 'success');
    }
    
    setNeedsOnboarding(false);
    setRecommendStep(1);
  };

  const skipOnboarding = () => {
    setNeedsOnboarding(false);
    setRecommendStep(1);
  };

  // ============================================
  // STATISTICS
  // ============================================

  const getStatistics = () => {
    const totalWatchlist = watchlist.length;
    const totalLiked = likedList.length;
    const totalSkipped = skippedList.length;
    const watchlistMovies = watchlist.filter(i => i.mediaType === 'movie').length;
    const watchlistTV = watchlist.filter(i => i.mediaType === 'tv').length;
    const likedMovies = likedList.filter(i => i.mediaType === 'movie').length;
    const likedTV = likedList.filter(i => i.mediaType === 'tv').length;
    
    const estimatedWatchlistTime = (watchlistMovies * 120) + (watchlistTV * 10 * 45);
    const estimatedLikedTime = (likedMovies * 120) + (likedTV * 10 * 45);
    
    const formatTime = (minutes) => {
      if (minutes < 60) return `${minutes}m`;
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      if (hours < 24) return `${hours}h ${mins}m`;
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    };

    const avgRating = likedList.length > 0
      ? (likedList.reduce((sum, i) => sum + (i.vote_average || 0), 0) / likedList.length).toFixed(1) : 0;

    const genreCounts = {};
    likedList.forEach(item => (item.genre_ids || []).forEach(gid => { genreCounts[gid] = (genreCounts[gid] || 0) + 1; }));
    const topGenres = Object.entries(genreCounts).sort((a, b) => b[1] - a[1]).slice(0, 3)
      .map(([gid]) => [...MOVIE_GENRES, ...TV_GENRES].find(g => g.id === parseInt(gid))?.name || 'Unknown');

    return {
      totalWatchlist, totalLiked, totalSkipped,
      watchlistMovies, watchlistTV, likedMovies, likedTV,
      estimatedWatchlistTime: formatTime(estimatedWatchlistTime),
      estimatedLikedTime: formatTime(estimatedLikedTime),
      avgRating, topGenres,
    };
  };

 // ============================================
  // SCREENS / RENDER
  // ============================================

  // SPLASH
  if (currentScreen === SCREENS.LOADING) {
    return (
      <View style={[styles.splashContainer, { backgroundColor: theme.background }]}>
        <Text style={styles.splashEmoji}>🎬</Text>
        <Text style={[styles.splashTitle, { color: theme.text }]}>WatchNext</Text>
        <Text style={[styles.splashSubtitle, { color: theme.textSecondary }]}>We pick, you watch</Text>
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
      </View>
    );
  }

  // HOME
  if (currentScreen === SCREENS.HOME) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <ScrollView style={styles.homeContainer}>
          <View style={styles.homeHeader}>
            <View style={{ width: 40 }} />
            <View style={styles.logoContainer}>
              <Text style={styles.logoEmoji}>🎬</Text>
              <Text style={[styles.logoTitle, { color: theme.text }]}>WatchNext</Text>
            </View>
            <TouchableOpacity onPress={() => setCurrentScreen(SCREENS.SETTINGS)} style={styles.settingsBtn}>
              <Text style={{ fontSize: 22 }}>⚙️</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.searchBar, { backgroundColor: theme.surface }]} onPress={() => setCurrentScreen(SCREENS.SEARCH)}>
            <Text style={{ fontSize: 18, marginRight: 12 }}>🔍</Text>
            <Text style={[styles.searchPlaceholder, { color: theme.textMuted }]}>Search movies & TV shows...</Text>
          </TouchableOpacity>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>What's Next?</Text>
            
            <TouchableOpacity style={[styles.menuButton, { backgroundColor: theme.surface }]} onPress={enterWatchNext}>

                <Text style={styles.watchNextEmoji}>🎯</Text>
                <View style={styles.menuText}>
                  <Text style={styles.watchNextTitle}>WatchNext</Text>
                  <Text style={styles.watchNextSubtitle}>We pick, you watch</Text>

              </View>
              <Text style={[styles.menuArrow, { color: theme.textMuted }]}>→</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>Discover</Text>
            <TouchableOpacity style={[styles.menuButton, { backgroundColor: theme.surface }]} onPress={() => startSwiping('movie')}>
              <Text style={styles.menuEmoji}>🎬</Text>
              <View style={styles.menuText}>
                <Text style={[styles.menuTitle, { color: theme.text }]}>Movies</Text>
                <Text style={[styles.menuSubtitle, { color: theme.textSecondary }]}>Explore and save for later</Text>
              </View>
              <Text style={[styles.menuArrow, { color: theme.textMuted }]}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuButton, { backgroundColor: theme.surface }]} onPress={() => startSwiping('tv')}>
              <Text style={styles.menuEmoji}>📺</Text>
              <View style={styles.menuText}>
                <Text style={[styles.menuTitle, { color: theme.text }]}>TV Shows</Text>
                <Text style={[styles.menuSubtitle, { color: theme.textSecondary }]}>Find your next binge</Text>
              </View>
              <Text style={[styles.menuArrow, { color: theme.textMuted }]}>→</Text>
            </TouchableOpacity>
          </View>


          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>My Lists</Text>
            <TouchableOpacity style={[styles.menuButton, { backgroundColor: theme.surface }]} onPress={() => { setActiveListTab('watchlist'); setCurrentScreen(SCREENS.LISTS); }}>
              <Text style={styles.menuEmoji}>📝</Text>
              <View style={styles.menuText}>
                <Text style={[styles.menuTitle, { color: theme.text }]}>Watchlist</Text>
                <Text style={[styles.menuSubtitle, { color: theme.textSecondary }]}>{watchlist.length} titles to watch</Text>
              </View>
              <Text style={[styles.menuArrow, { color: theme.textMuted }]}>→</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.menuButton, { backgroundColor: theme.surface }]} onPress={() => { setActiveListTab('liked'); setCurrentScreen(SCREENS.LISTS); }}>
              <Text style={styles.menuEmoji}>👍</Text>
              <View style={styles.menuText}>
                <Text style={[styles.menuTitle, { color: theme.text }]}>Liked</Text>
                <Text style={[styles.menuSubtitle, { color: theme.textSecondary }]}>{likedList.length} titles you loved</Text>
              </View>
              <Text style={[styles.menuArrow, { color: theme.textMuted }]}>→</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.textMuted }]}>Your Stats</Text>
            <TouchableOpacity style={[styles.statsCard, { backgroundColor: theme.surface }]} onPress={() => setCurrentScreen(SCREENS.STATS)}>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: theme.primary }]}>{watchlist.length}</Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>To Watch</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: theme.secondary }]}>{likedList.length}</Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Liked</Text>
                </View>
                <View style={[styles.statDivider, { backgroundColor: theme.border }]} />
                <View style={styles.statItem}>
                  <Text style={[styles.statNumber, { color: theme.textMuted }]}>{skippedList.length}</Text>
                  <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Skipped</Text>
                </View>
              </View>
              <Text style={[styles.statsHint, { color: theme.textMuted }]}>Tap for detailed stats →</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
        <Toast {...toast} />
      </SafeAreaView>
    );
  }

  // SETTINGS
  if (currentScreen === SCREENS.SETTINGS) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => setCurrentScreen(SCREENS.HOME)}>
            <Text style={[styles.backBtn, { color: theme.primary }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Settings</Text>
          <View style={{ width: 50 }} />
        </View>
        <ScrollView style={styles.settingsContainer}>
          <Text style={[styles.settingsSectionTitle, { color: theme.textMuted }]}>Appearance</Text>
          <View style={[styles.settingsItem, { backgroundColor: theme.surface }]}>
            <View style={styles.settingsItemLeft}>
              <Text style={{ fontSize: 22, marginRight: 14 }}>{isDarkMode ? '🌙' : '☀️'}</Text>
              <View>
                <Text style={[styles.settingsItemTitle, { color: theme.text }]}>Dark Mode</Text>
                <Text style={[styles.settingsItemSubtitle, { color: theme.textSecondary }]}>
                  {isDarkMode ? 'Dark theme active' : 'Light theme active'}
                </Text>
              </View>
            </View>
            
            <Switch value={isDarkMode} onValueChange={toggleTheme} trackColor={{ false: '#767577', true: theme.primary }} thumbColor="#fff" />
          </View>
          <Text style={[styles.settingsSectionTitle, { color: theme.textMuted, marginTop: 24 }]}>Data</Text>
          <TouchableOpacity style={[styles.settingsItem, { backgroundColor: theme.surface }]} onPress={() => setCurrentScreen(SCREENS.STATS)}>
            <View style={styles.settingsItemLeft}>
              <Text style={{ fontSize: 22, marginRight: 14 }}>📊</Text>
              <View>
                <Text style={[styles.settingsItemTitle, { color: theme.text }]}>Statistics</Text>
                <Text style={[styles.settingsItemSubtitle, { color: theme.textSecondary }]}>View your watching habits</Text>
              </View>
            </View>
            <Text style={{ color: theme.textMuted, fontSize: 18 }}>→</Text>
          </TouchableOpacity>
<TouchableOpacity 
  style={[styles.settingsItem, { backgroundColor: '#E53935', marginTop: 10 }]} 
  onPress={async () => {
    try {
      // Clear ALL AsyncStorage
      await AsyncStorage.clear();
      
      // Reset all states
      setRecommendStep(0);
      setRecommendType(null);
      setRecommendMood(null);
      setRecommendSubMood(null);
      setRecommendDuration(null);
      setRecommendLanguage(null);
      setRecommendation(null);
      setRecommendationExplanation(null);
      setNeedsOnboarding(false);
      setOnboardingMovies([]);
      setOnboardingIndex(0);
      setOnboardingRatings({});
      setOnboardingComplete(false);
      setTotalRated(0);
      setWatchlist([]);
      setLikedList([]);
      setSkippedList([]);
      setIsDarkMode(true);
      setCurrentScreen(SCREENS.HOME);
      
      showToast('Full reset done! App is fresh.', 'success');
    } catch (e) {
      console.error('Reset error:', e);
      showToast('Reset failed: ' + e.message, 'error');
    }
  }}
>
  <View style={styles.settingsItemLeft}>
    <Text style={{ fontSize: 22, marginRight: 14 }}>🚨</Text>
    <View>
      <Text style={[styles.settingsItemTitle, { color: '#fff' }]}>Emergency Full Reset</Text>
      <Text style={[styles.settingsItemSubtitle, { color: 'rgba(255,255,255,0.7)' }]}>Clear everything and start fresh</Text>
    </View>
  </View>
</TouchableOpacity>
          <Text style={[styles.settingsSectionTitle, { color: theme.textMuted, marginTop: 24 }]}>About</Text>
          <View style={[styles.settingsItem, { backgroundColor: theme.surface }]}>
            <View style={styles.settingsItemLeft}>
              <Text style={{ fontSize: 22, marginRight: 14 }}>📱</Text>
              <View>
                <Text style={[styles.settingsItemTitle, { color: theme.text }]}>Version</Text>
                <Text style={[styles.settingsItemSubtitle, { color: theme.textSecondary }]}>1.0.0</Text>
              </View>
            </View>
          </View>
        </ScrollView>
        <Toast {...toast} />
      </SafeAreaView>
    );
  }

  // STATS
  if (currentScreen === SCREENS.STATS) {
    const stats = getStatistics();
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => setCurrentScreen(SCREENS.HOME)}>
            <Text style={[styles.backBtn, { color: theme.primary }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Statistics</Text>
          <View style={{ width: 50 }} />
        </View>
        <ScrollView style={styles.statsContainer}>
          <View style={[styles.statsSection, { backgroundColor: theme.surface }]}>
            <Text style={[styles.statsSectionTitle, { color: theme.text }]}>Overview</Text>
            <View style={styles.statsGrid}>
              <View style={[styles.statsGridItem, { backgroundColor: theme.card }]}>
                <Text style={[styles.statsGridNumber, { color: theme.primary }]}>{stats.totalWatchlist}</Text>
                <Text style={[styles.statsGridLabel, { color: theme.textSecondary }]}>To Watch</Text>
              </View>
              <View style={[styles.statsGridItem, { backgroundColor: theme.card }]}>
                <Text style={[styles.statsGridNumber, { color: theme.secondary }]}>{stats.totalLiked}</Text>
                <Text style={[styles.statsGridLabel, { color: theme.textSecondary }]}>Liked</Text>
              </View>
              <View style={[styles.statsGridItem, { backgroundColor: theme.card }]}>
                <Text style={[styles.statsGridNumber, { color: theme.textMuted }]}>{stats.totalSkipped}</Text>
                <Text style={[styles.statsGridLabel, { color: theme.textSecondary }]}>Skipped</Text>
              </View>
            </View>
          </View>
          <View style={[styles.statsSection, { backgroundColor: theme.surface }]}>
            <Text style={[styles.statsSectionTitle, { color: theme.text }]}>Content Breakdown</Text>
            <View style={styles.statsBreakdownRow}>
              <Text style={{ color: theme.textSecondary }}>Watchlist Movies</Text>
              <Text style={{ color: theme.text, fontWeight: '600' }}>{stats.watchlistMovies} 🎬</Text>
            </View>
            <View style={styles.statsBreakdownRow}>
              <Text style={{ color: theme.textSecondary }}>Watchlist TV Shows</Text>
              <Text style={{ color: theme.text, fontWeight: '600' }}>{stats.watchlistTV} 📺</Text>
            </View>
            <View style={[styles.statsDivider, { backgroundColor: theme.border }]} />
            <View style={styles.statsBreakdownRow}>
              <Text style={{ color: theme.textSecondary }}>Liked Movies</Text>
              <Text style={{ color: theme.text, fontWeight: '600' }}>{stats.likedMovies} 🎬</Text>
            </View>
            <View style={styles.statsBreakdownRow}>
              <Text style={{ color: theme.textSecondary }}>Liked TV Shows</Text>
              <Text style={{ color: theme.text, fontWeight: '600' }}>{stats.likedTV} 📺</Text>
            </View>
          </View>
          <View style={[styles.statsSection, { backgroundColor: theme.surface }]}>
            <Text style={[styles.statsSectionTitle, { color: theme.text }]}>Estimated Watch Time</Text>
            <View style={styles.statsTimeRow}>
              <View style={[styles.statsTimeItem, { backgroundColor: theme.card }]}>
                <Text style={{ fontSize: 24 }}>📝</Text>
                <Text style={[styles.statsTimeValue, { color: theme.primary }]}>{stats.estimatedWatchlistTime}</Text>
                <Text style={{ fontSize: 11, color: theme.textSecondary }}>Watchlist</Text>
              </View>
              <View style={[styles.statsTimeItem, { backgroundColor: theme.card }]}>
                <Text style={{ fontSize: 24 }}>👍</Text>
                <Text style={[styles.statsTimeValue, { color: theme.secondary }]}>{stats.estimatedLikedTime}</Text>
                <Text style={{ fontSize: 11, color: theme.textSecondary }}>Already watched</Text>
              </View>
            </View>
          </View>
          {stats.totalLiked > 0 && (
            <View style={[styles.statsSection, { backgroundColor: theme.surface }]}>
              <Text style={[styles.statsSectionTitle, { color: theme.text }]}>Your Preferences</Text>
              <View style={styles.statsBreakdownRow}>
                <Text style={{ color: theme.textSecondary }}>Average Rating</Text>
                <Text style={{ color: theme.text, fontWeight: '600' }}>⭐ {stats.avgRating}</Text>
              </View>
              {stats.topGenres.length > 0 && (
                <View style={styles.statsBreakdownRow}>
                  <Text style={{ color: theme.textSecondary }}>Favorite Genres</Text>
                  <Text style={{ color: theme.text, fontWeight: '600' }}>{stats.topGenres.join(', ')}</Text>
                </View>
              )}
            </View>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
        <Toast {...toast} />
      </SafeAreaView>
    );
  }

  // SEARCH
  if (currentScreen === SCREENS.SEARCH) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => { setCurrentScreen(SCREENS.HOME); setSearchQuery(''); setSearchResults([]); }}>
            <Text style={[styles.backBtn, { color: theme.primary }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>Search</Text>
          <View style={{ width: 50 }} />
        </View>
        <View style={[styles.searchInputContainer, { backgroundColor: theme.surface }]}>
          <Text style={{ fontSize: 16, marginRight: 10 }}>🔍</Text>
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            placeholder="Search movies & TV shows..."
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={handleSearchChange}
            autoFocus
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults([]); }}>
              <Text style={{ color: theme.textMuted, fontSize: 18 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        {searchLoading ? (
          <View style={styles.centered}><ActivityIndicator size="large" color={theme.primary} /></View>
        ) : (
          <FlatList
            data={searchResults}
            keyExtractor={(item) => `${item.mediaType}-${item.id}`}
            contentContainerStyle={{ paddingHorizontal: 16 }}
            renderItem={({ item }) => (
              <TouchableOpacity style={[styles.searchResultItem, { borderBottomColor: theme.border }]} onPress={() => openDetails(item, item.mediaType)}>
                <Image source={{ uri: `https://image.tmdb.org/t/p/w92${item.poster_path}` }} style={styles.searchResultPoster} />
                <View style={styles.searchResultInfo}>
                  <Text style={[styles.searchResultTitle, { color: theme.text }]} numberOfLines={2}>{item.title || item.name}</Text>
                  <View style={styles.searchResultMeta}>
                    <Text>{item.mediaType === 'movie' ? '🎬' : '📺'}</Text>
                    <Text style={{ color: theme.textSecondary, marginLeft: 8 }}>{(item.release_date || item.first_air_date || '').split('-')[0]}</Text>
                    <Text style={{ color: theme.textSecondary, marginLeft: 8 }}>⭐ {item.vote_average?.toFixed(1)}</Text>
                  </View>
                </View>
                <TouchableOpacity style={[styles.addBtn, { backgroundColor: theme.primary }]} onPress={() => showAddModal(item)}>
                  <Text style={{ color: '#fff', fontSize: 20, fontWeight: 'bold' }}>+</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyEmoji}>{searchQuery.length > 0 ? '🔍' : '🎬'}</Text>
                <Text style={[styles.emptyTitle, { color: theme.text }]}>{searchQuery.length > 0 ? 'No results' : 'Search for movies & TV'}</Text>
                <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>{searchQuery.length > 0 ? 'Try a different term' : 'Find titles to add to your lists'}</Text>
              </View>
            }
          />
        )}
        {/* Add to List Modal */}
        <Modal visible={showAddToListModal} animationType="fade" transparent={true} onRequestClose={() => setShowAddToListModal(false)}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowAddToListModal(false)}>
            <View style={[styles.addModal, { backgroundColor: theme.surface }]}>
              <Text style={[styles.addModalTitle, { color: theme.text }]}>Add to List</Text>
              <Text style={{ color: theme.textSecondary, textAlign: 'center', marginBottom: 20 }} numberOfLines={1}>{itemToAdd?.title || itemToAdd?.name}</Text>
              <TouchableOpacity 
                style={[styles.addModalOption, { backgroundColor: theme.card }, isInWatchlist(itemToAdd?.id) && { opacity: 0.5 }]}
                onPress={() => { if (!isInWatchlist(itemToAdd?.id)) { addToWatchlist(itemToAdd); setShowAddToListModal(false); showToast('Added to Watchlist', 'success'); } }}
              >
                <Text style={{ fontSize: 20, marginRight: 12 }}>📝</Text>
                <Text style={{ color: theme.text, flex: 1 }}>{isInWatchlist(itemToAdd?.id) ? 'Already in Watchlist' : 'Add to Watchlist'}</Text>
                {isInWatchlist(itemToAdd?.id) && <Text style={{ color: '#4CAF50' }}>✓</Text>}
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.addModalOption, { backgroundColor: theme.card }, isInLiked(itemToAdd?.id) && { opacity: 0.5 }]}
                onPress={() => { if (!isInLiked(itemToAdd?.id)) { addToLiked(itemToAdd); setShowAddToListModal(false); showToast('Added to Liked', 'success'); } }}
              >
                <Text style={{ fontSize: 20, marginRight: 12 }}>👍</Text>
                <Text style={{ color: theme.text, flex: 1 }}>{isInLiked(itemToAdd?.id) ? 'Already in Liked' : 'Add to Liked'}</Text>
                {isInLiked(itemToAdd?.id) && <Text style={{ color: '#4CAF50' }}>✓</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={{ padding: 14, alignItems: 'center', marginTop: 4 }} onPress={() => setShowAddToListModal(false)}>
                <Text style={{ color: theme.textSecondary }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
        <Toast {...toast} />
      </SafeAreaView>
    );
  }

  // LISTS
  if (currentScreen === SCREENS.LISTS) {
    const currentList = activeListTab === 'watchlist' ? watchlist : likedList;
    const counts = getListCounts(currentList);
    const filteredList = getFilteredList();

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => setCurrentScreen(SCREENS.HOME)}>
            <Text style={[styles.backBtn, { color: theme.primary }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>My Lists</Text>
          <View style={{ width: 50 }} />
        </View>
        <View style={styles.listTabs}>
          <TouchableOpacity style={[styles.listTab, { backgroundColor: activeListTab === 'watchlist' ? theme.primary : theme.surface }]} onPress={() => setActiveListTab('watchlist')}>
            <Text>📝</Text>
            <Text style={{ color: activeListTab === 'watchlist' ? '#fff' : theme.textSecondary, marginLeft: 6, fontWeight: '600' }}>Watchlist ({watchlist.length})</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.listTab, { backgroundColor: activeListTab === 'liked' ? theme.secondary : theme.surface }]} onPress={() => setActiveListTab('liked')}>
            <Text>👍</Text>
            <Text style={{ color: activeListTab === 'liked' ? '#fff' : theme.textSecondary, marginLeft: 6, fontWeight: '600' }}>Liked ({likedList.length})</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.filterTabs}>
          {['all', 'movie', 'tv'].map((filter) => (
            <TouchableOpacity key={filter} style={[styles.filterTab, { backgroundColor: listTypeFilter === filter ? theme.card : theme.surface }]} onPress={() => setListTypeFilter(filter)}>
              <Text style={{ color: listTypeFilter === filter ? theme.text : theme.textSecondary, fontWeight: '600', fontSize: 12 }}>
                {filter === 'all' ? `All (${counts.all})` : filter === 'movie' ? `🎬 (${counts.movies})` : `📺 (${counts.tv})`}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <FlatList
          data={filteredList}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          contentContainerStyle={{ paddingHorizontal: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity style={[styles.listItem, { borderBottomColor: theme.border }]} onPress={() => openDetails(item, item.mediaType)}>
              <Image source={{ uri: `https://image.tmdb.org/t/p/w92${item.poster_path}` }} style={styles.listPoster} />
              <View style={styles.listContent}>
                <Text style={[styles.listTitle, { color: theme.text }]} numberOfLines={2}>{item.title || item.name}</Text>
                <View style={styles.listMeta}>
                  <Text>{item.mediaType === 'movie' ? '🎬' : '📺'}</Text>
                  <Text style={{ color: theme.textSecondary, marginLeft: 8 }}>⭐ {item.vote_average?.toFixed(1)}</Text>
                </View>
              </View>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity style={[styles.listActionBtn, { backgroundColor: theme.surface }]} onPress={() => moveToOtherList(item, activeListTab)}>
                  <Text>{activeListTab === 'watchlist' ? '👍' : '📝'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.listActionBtn, { backgroundColor: theme.surface }]} onPress={() => removeFromList(item, activeListTab)}>
                  <Text style={{ color: theme.textSecondary }}>✕</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyEmoji}>{activeListTab === 'watchlist' ? '📝' : '👍'}</Text>
              <Text style={[styles.emptyTitle, { color: theme.text }]}>No titles yet</Text>
              <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>{activeListTab === 'watchlist' ? 'Start discovering!' : 'Mark titles you loved!'}</Text>
              <TouchableOpacity style={[styles.emptyButton, { backgroundColor: theme.primary }]} onPress={() => setCurrentScreen(SCREENS.HOME)}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>Start Discovering</Text>
              </TouchableOpacity>
            </View>
          }
        />
        {currentList.length > 0 && (
          <TouchableOpacity style={[styles.clearBtn, { borderColor: theme.danger }]} onPress={() => clearList(activeListTab)}>
            <Text style={{ color: theme.danger, fontWeight: '600' }}>🗑️ Clear {activeListTab === 'watchlist' ? 'Watchlist' : 'Liked'}</Text>
          </TouchableOpacity>
        )}
        <Toast {...toast} />
      </SafeAreaView>
    );
  }

  // DETAILS
  if (currentScreen === SCREENS.DETAILS && selectedItem) {
    const item = selectedItem;
    const type = item.mediaType;
    
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={() => { setCurrentScreen(previousScreen || SCREENS.HOME); setSelectedItem(null); setTrailers([]); setSimilarContent([]); }}>
            <Text style={[styles.backBtn, { color: theme.primary }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>{item.title || item.name}</Text>
          <View style={{ width: 50 }} />
        </View>
        <ScrollView style={{ flex: 1 }}>
          <View style={styles.detailsHero}>
            <Image source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }} style={styles.detailsPoster} />
            <View style={styles.detailsHeroInfo}>
              <Text style={[styles.detailsTitle, { color: theme.text }]}>{item.title || item.name}</Text>
              {movieDetails?.tagline && <Text style={{ color: theme.secondary, fontSize: 12, fontStyle: 'italic', marginBottom: 10 }}>"{movieDetails.tagline}"</Text>}
              <View style={styles.detailsBadges}>
                <View style={[styles.badge, { backgroundColor: theme.card }]}><Text style={{ color: theme.text, fontSize: 10 }}>⭐ {item.vote_average?.toFixed(1)}</Text></View>
                <View style={[styles.badge, { backgroundColor: theme.card }]}><Text style={{ color: theme.text, fontSize: 10 }}>{(item.release_date || item.first_air_date || '').split('-')[0]}</Text></View>
                {getRuntime() && <View style={[styles.badge, { backgroundColor: theme.card }]}><Text style={{ color: theme.text, fontSize: 10 }}>{getRuntime()}</Text></View>}
              </View>
              {type === 'tv' && movieDetails && (
                <Text style={{ color: theme.secondary, fontSize: 13, fontWeight: '600', marginTop: 6 }}>
                  {movieDetails.number_of_seasons} Season{movieDetails.number_of_seasons !== 1 ? 's' : ''}{movieDetails.status && ` • ${movieDetails.status}`}
                </Text>
              )}
              {movieDetails?.genres?.length > 0 && (
                <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 6, lineHeight: 18 }}>{movieDetails.genres.map(g => g.name).join(' • ')}</Text>
              )}
            </View>
          </View>
          <View style={styles.detailsActions}>
            <TouchableOpacity 
              style={[styles.detailsActionBtn, { backgroundColor: isInWatchlist(item.id) ? theme.primary : theme.surface }]}
              onPress={() => { if (isInWatchlist(item.id)) removeFromList(item, 'watchlist'); else { addToWatchlist(item); showToast('Added to Watchlist', 'success'); } }}
            >
              <Text style={{ fontSize: 18 }}>📝</Text>
              <Text style={{ color: isInWatchlist(item.id) ? '#fff' : theme.text, fontWeight: '600', marginLeft: 8 }}>{isInWatchlist(item.id) ? 'In Watchlist' : 'Watchlist'}</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.detailsActionBtn, { backgroundColor: isInLiked(item.id) ? theme.secondary : theme.surface }]}
              onPress={() => { if (isInLiked(item.id)) removeFromList(item, 'liked'); else { addToLiked(item); showToast('Added to Liked', 'success'); } }}
            >
              <Text style={{ fontSize: 18 }}>👍</Text>
              <Text style={{ color: isInLiked(item.id) ? '#fff' : theme.text, fontWeight: '600', marginLeft: 8 }}>{isInLiked(item.id) ? 'Liked' : 'Like'}</Text>
            </TouchableOpacity>
          </View>
          {trailers.length > 0 && (
            <View style={styles.detailsSection}>
              <Text style={[styles.detailsSectionTitle, { color: theme.text }]}>Trailers</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {trailers.map((t) => (
                  <TouchableOpacity key={t.id} style={styles.trailerItem} onPress={() => openTrailer(t.key)}>
                    <Image source={{ uri: `https://img.youtube.com/vi/${t.key}/mqdefault.jpg` }} style={styles.trailerThumb} />
                    <View style={styles.trailerPlayBtn}><Text style={{ color: '#fff' }}>▶</Text></View>
                    <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 6 }} numberOfLines={2}>{t.name}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
          <View style={styles.detailsSection}>
            <Text style={[styles.detailsSectionTitle, { color: theme.text }]}>Overview</Text>
            <Text style={{ color: theme.textSecondary, fontSize: 14, lineHeight: 22 }}>{item.overview || 'No overview available.'}</Text>
          </View>
          {movieDetails?.credits?.cast?.length > 0 && (
            <View style={styles.detailsSection}>
              <Text style={[styles.detailsSectionTitle, { color: theme.text }]}>Cast</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {movieDetails.credits.cast.slice(0, 10).map((p) => (
                  <View key={p.id} style={styles.castItem}>
                    <Image source={{ uri: p.profile_path ? `https://image.tmdb.org/t/p/w185${p.profile_path}` : 'https://via.placeholder.com/70' }} style={styles.castPhoto} />
                    <Text style={{ color: theme.text, fontSize: 11, textAlign: 'center' }} numberOfLines={2}>{p.name}</Text>
                    <Text style={{ color: theme.textMuted, fontSize: 10, textAlign: 'center' }} numberOfLines={1}>{p.character}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}
          <View style={styles.detailsSection}>
            <Text style={[styles.detailsSectionTitle, { color: theme.text }]}>Details</Text>
            <View style={styles.detailsGrid}>
              {type === 'movie' && getDirector() && (
                <View style={[styles.detailsGridItem, { backgroundColor: theme.surface }]}>
                  <Text style={{ color: theme.textMuted, fontSize: 11 }}>Director</Text>
                  <Text style={{ color: theme.text, fontWeight: '600' }}>{getDirector()}</Text>
                </View>
              )}
              {getProviders() && (
                <View style={[styles.detailsGridItem, { backgroundColor: theme.surface }]}>
                  <Text style={{ color: theme.textMuted, fontSize: 11 }}>Watch On</Text>
                  <Text style={{ color: theme.primary, fontWeight: '600' }}>{getProviders()}</Text>
                </View>
              )}
            </View>
          </View>
          {similarContent.length > 0 && (
            <View style={styles.detailsSection}>
              <Text style={[styles.detailsSectionTitle, { color: theme.text }]}>Similar {type === 'movie' ? 'Movies' : 'Shows'}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {similarContent.filter(s => s.poster_path).map((s) => (
                  <TouchableOpacity key={s.id} style={styles.similarItem} onPress={() => { setSelectedItem({ ...s, mediaType: type }); setMovieDetails(null); setTrailers([]); fetchMovieDetails(s.id, type); }}>
                    <Image source={{ uri: `https://image.tmdb.org/t/p/w185${s.poster_path}` }} style={styles.similarPoster} />
                    <Text style={{ color: theme.textSecondary, fontSize: 12 }} numberOfLines={2}>{s.title || s.name}</Text>
                    <Text style={{ color: theme.textMuted, fontSize: 11 }}>⭐ {s.vote_average?.toFixed(1)}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
          <View style={{ height: 40 }} />
        </ScrollView>
        <Toast {...toast} />
      </SafeAreaView>
    );
  }
  
  // ============================================
  // RECOMMEND SCREEN (WatchNext Flow)
  // ============================================

  if (currentScreen === SCREENS.RECOMMEND) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={resetRecommendation}>
            <Text style={[styles.backBtn, { color: theme.primary }]}>← Back</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.text }]}>🎯 WatchNext</Text>
          <View style={{ width: 50 }} />
        </View>

        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 20 }}>
          
          {/* Step 0: Choose Type */}
          {recommendStep === 0 && (
            <View style={styles.recommendSection}>
              <Text style={[styles.recommendQuestion, { color: theme.text }]}>What are you in the mood for?</Text>
              <Text style={[styles.recommendSubtext, { color: theme.textSecondary }]}>We'll pick the perfect choice for you</Text>
              
              <View style={styles.recommendOptions}>
                <TouchableOpacity 
                  style={[styles.recommendTypeCard, { backgroundColor: theme.surface }]} 
                  onPress={() => startRecommendation('movie')}
                >
                  <Text style={styles.recommendTypeEmoji}>🎬</Text>
                  <Text style={[styles.recommendTypeLabel, { color: theme.text }]}>Movie</Text>
                  <Text style={[styles.recommendTypeDesc, { color: theme.textSecondary }]}>Single sitting</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.recommendTypeCard, { backgroundColor: theme.surface }]} 
                  onPress={() => startRecommendation('tv')}
                >
                  <Text style={styles.recommendTypeEmoji}>📺</Text>
                  <Text style={[styles.recommendTypeLabel, { color: theme.text }]}>TV Show</Text>
                  <Text style={[styles.recommendTypeDesc, { color: theme.textSecondary }]}>Series journey</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
          {/* Step 0.5: Onboarding */}
          {recommendStep === 0.5 && needsOnboarding && (
            <View style={styles.recommendSection}>
              {onboardingLoading ? (
                <View style={styles.centered}>
                  <ActivityIndicator size="large" color={theme.primary} />
                  <Text style={[styles.loadingText, { color: theme.textSecondary }]}>Loading taste profile...</Text>
                </View>
              ) : onboardingMovies.length > 0 ? (
                <>
                  <View style={styles.onboardingHeader}>
                    <Text style={[styles.recommendQuestion, { color: theme.text }]}>
                      Help us know your taste
                    </Text>
                    <Text style={[styles.recommendSubtext, { color: theme.textSecondary }]}>
                      Rate {onboardingMovies.length} {recommendType === 'tv' ? 'shows' : 'movies'} to improve recommendations
                      {totalRated > 0 && `\n(${totalRated}/${ONBOARDING_THRESHOLD} complete)`}
                    </Text>
                    <View style={styles.onboardingProgress}>
                      <View style={[styles.onboardingProgressBar, { backgroundColor: theme.border }]}>
                        <View style={[
                          styles.onboardingProgressFill, 
                          { backgroundColor: theme.primary, width: `${((onboardingIndex) / onboardingMovies.length) * 100}%` }
                        ]} />
                      </View>
                      <Text style={[styles.onboardingProgressText, { color: theme.textMuted }]}>
                        {onboardingIndex + 1} of {onboardingMovies.length}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.onboardingCard, { backgroundColor: theme.surface }]}>
                    <Image 
                      source={{ uri: `https://image.tmdb.org/t/p/w500${onboardingMovies[onboardingIndex]?.poster_path}` }} 
                      style={styles.onboardingPoster} 
                    />
                    <Text style={[styles.onboardingTitle, { color: theme.text }]}>
                      {onboardingMovies[onboardingIndex]?.title}
                    </Text>
                    <Text style={[styles.onboardingGenre, { color: theme.textSecondary }]}>
                      {onboardingMovies[onboardingIndex]?.onboardingGenre}
                    </Text>
                    <View style={styles.onboardingMeta}>
                      <Text style={{ color: theme.textSecondary }}>
                        ⭐ {onboardingMovies[onboardingIndex]?.vote_average?.toFixed(1)}
                      </Text>
                      <Text style={{ color: theme.textSecondary }}>
                        {onboardingMovies[onboardingIndex]?.release_date?.split('-')[0]}
                      </Text>
                    </View>
                  </View>

                  <Text style={[styles.onboardingQuestion, { color: theme.text }]}>
                    Have you seen it? Did you like it?
                  </Text>

                  <View style={styles.onboardingButtons}>
                    <TouchableOpacity 
                      style={[styles.onboardingBtn, styles.onboardingBtnDislike, { backgroundColor: theme.danger }]}
                      onPress={() => handleOnboardingRate(onboardingMovies[onboardingIndex].id, 'dislike')}
                    >
                      <Text style={styles.onboardingBtnEmoji}>👎</Text>
                      <Text style={styles.onboardingBtnText}>Not for me</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.onboardingBtn, styles.onboardingBtnSkip, { backgroundColor: theme.surface, borderColor: theme.border }]}
                      onPress={() => handleOnboardingRate(onboardingMovies[onboardingIndex].id, 'skip')}
                    >
                      <Text style={[styles.onboardingBtnEmoji, { fontSize: 20 }]}>🤷</Text>
                      <Text style={[styles.onboardingBtnText, { color: theme.textSecondary }]}>Haven't seen</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={[styles.onboardingBtn, styles.onboardingBtnLike, { backgroundColor: theme.primary }]}
                      onPress={() => handleOnboardingRate(onboardingMovies[onboardingIndex].id, 'like')}
                    >
                      <Text style={styles.onboardingBtnEmoji}>👍</Text>
                      <Text style={styles.onboardingBtnText}>Loved it</Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity style={styles.skipOnboarding} onPress={skipOnboarding}>
                    <Text style={{ color: theme.textMuted, fontSize: 13 }}>Skip for now →</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.centered}>
                  <Text style={{ color: theme.textSecondary }}>Could not load movies</Text>
                  <TouchableOpacity 
                    style={[styles.emptyButton, { backgroundColor: theme.primary, marginTop: 16 }]} 
                    onPress={() => setRecommendStep(1)}
                  >
                    <Text style={{ color: '#fff', fontWeight: '600' }}>Continue anyway</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}

          {/* Step 1: Mood */}
          {recommendStep === 1 && !recommendMood && (
            <View style={styles.recommendSection}>
              <View style={styles.stepIndicator}>
                <Text style={[styles.stepText, { color: theme.textSecondary }]}>Step 1 of 3</Text>
                <View style={styles.stepDots}>
                  <View style={[styles.stepDot, { backgroundColor: theme.primary }]} />
                  <View style={[styles.stepDot, { backgroundColor: theme.border }]} />
                  <View style={[styles.stepDot, { backgroundColor: theme.border }]} />
                </View>
              </View>
              
              <Text style={[styles.recommendQuestion, { color: theme.text }]}>How do you want to feel?</Text>
              
              <View style={styles.moodGrid}>
                {MOODS.map((mood) => (
                  <TouchableOpacity 
                    key={mood.id}
                    style={[styles.moodCard, { backgroundColor: theme.surface }]} 
                    onPress={() => {
                      if (mood.id === 'surprise' || !mood.subOptions) {
                        setRecommendMood(mood.id);
                        setRecommendSubMood(null);
                        setRecommendStep(2);
                      } else {
                        setRecommendMood(mood.id);
                      }
                    }}
                  >
                    <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                    <Text style={[styles.moodLabel, { color: theme.text }]}>{mood.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Step 1.5: Sub-mood */}
          {recommendStep === 1 && recommendMood && !recommendSubMood && (
            <View style={styles.recommendSection}>
              <View style={styles.stepIndicator}>
                <Text style={[styles.stepText, { color: theme.textSecondary }]}>Step 1 of 3</Text>
                <View style={styles.stepDots}>
                  <View style={[styles.stepDot, { backgroundColor: theme.primary }]} />
                  <View style={[styles.stepDot, { backgroundColor: theme.border }]} />
                  <View style={[styles.stepDot, { backgroundColor: theme.border }]} />
                </View>
              </View>
              
              {(() => {
                const selectedMood = MOODS.find(m => m.id === recommendMood);
                return (
                  <>
                    <TouchableOpacity 
                      style={styles.selectedMoodHeader} 
                      onPress={() => setRecommendMood(null)}
                    >
                      <Text style={{ fontSize: 32 }}>{selectedMood?.emoji}</Text>
                      <Text style={[styles.selectedMoodLabel, { color: theme.text }]}>{selectedMood?.label}</Text>
                      <Text style={[styles.changeMood, { color: theme.primary }]}>Change</Text>
                    </TouchableOpacity>
                    
                    <Text style={[styles.recommendQuestion, { color: theme.text, fontSize: 18, marginTop: 16 }]}>
                      Any specific vibe?
                    </Text>
                    
                    <View style={styles.subMoodList}>
                      {selectedMood?.subOptions && selectedMood.subOptions.length > 0 ? (
                        selectedMood.subOptions.map((sub) => (
                          <TouchableOpacity
                            key={sub.id}
                            style={[styles.subMoodCard, { backgroundColor: theme.surface }]}
                            onPress={() => {
                              setRecommendSubMood(sub);
                              setRecommendStep(2);
                            }}
                          >
                            <Text style={styles.subMoodEmoji}>{sub.emoji}</Text>
                            <Text style={[styles.subMoodLabel, { color: theme.text }]}>{sub.label}</Text>
                            <Text style={[styles.subMoodArrow, { color: theme.textMuted }]}>→</Text>
                          </TouchableOpacity>
                        ))
                      ) : (
                        // Fallback: no sub-options, auto-advance to step 2
                        <TouchableOpacity
                          style={[styles.subMoodCard, { backgroundColor: theme.primary }]}
                          onPress={() => setRecommendStep(2)}
                        >
                          <Text style={styles.subMoodEmoji}>✨</Text>
                          <Text style={[styles.subMoodLabel, { color: '#fff' }]}>Continue</Text>
                          <Text style={[styles.subMoodArrow, { color: 'rgba(255,255,255,0.7)' }]}>→</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </>
                );
              })()}
            </View>
          )}

          {/* Step 2: Duration/Commitment */}
          {recommendStep === 2 && (
            <View style={styles.recommendSection}>
              <View style={styles.stepIndicator}>
                <Text style={[styles.stepText, { color: theme.textSecondary }]}>Step 2 of 3</Text>
                <View style={styles.stepDots}>
                  <View style={[styles.stepDot, { backgroundColor: theme.primary }]} />
                  <View style={[styles.stepDot, { backgroundColor: theme.primary }]} />
                  <View style={[styles.stepDot, { backgroundColor: theme.border }]} />
                </View>
              </View>
              
              <Text style={[styles.recommendQuestion, { color: theme.text }]}>
                {recommendType === 'movie' ? 'How much time do you have?' : 'How big a commitment?'}
              </Text>
              
              <View style={styles.durationOptions}>
                {(recommendType === 'movie' ? DURATION_OPTIONS : COMMITMENT_OPTIONS).map((option) => (
                  <TouchableOpacity 
                    key={option.id}
                    style={[
                      styles.durationCard, 
                      { backgroundColor: theme.surface },
                      recommendDuration === option.id && { backgroundColor: theme.primary }
                    ]} 
                    onPress={() => setRecommendDuration(option.id)}
                  >
                    <Text style={styles.durationEmoji}>{option.emoji}</Text>
                    <Text style={[styles.durationLabel, { color: recommendDuration === option.id ? '#fff' : theme.text }]}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.navButtons}>
                <TouchableOpacity style={[styles.backStepButton, { backgroundColor: theme.surface }]} onPress={() => setRecommendStep(1)}>
                  <Text style={{ color: theme.text }}>← Back</Text>
                </TouchableOpacity>
                {recommendDuration && (
                  <TouchableOpacity style={[styles.nextButton, { backgroundColor: theme.primary, flex: 1, marginLeft: 10 }]} onPress={() => setRecommendStep(3)}>
                    <Text style={styles.nextButtonText}>Continue</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Step 3: Language */}
          {recommendStep === 3 && (
            <View style={styles.recommendSection}>
              <View style={styles.stepIndicator}>
                <Text style={[styles.stepText, { color: theme.textSecondary }]}>Step 3 of 3</Text>
                <View style={styles.stepDots}>
                  <View style={[styles.stepDot, { backgroundColor: theme.primary }]} />
                  <View style={[styles.stepDot, { backgroundColor: theme.primary }]} />
                  <View style={[styles.stepDot, { backgroundColor: theme.primary }]} />
                </View>
              </View>
              
              <Text style={[styles.recommendQuestion, { color: theme.text }]}>Language preference?</Text>
              
              <View style={styles.languageOptions}>
                {LANGUAGE_OPTIONS.map((option) => (
                  <TouchableOpacity 
                    key={option.id}
                    style={[
                      styles.languageCard, 
                      { backgroundColor: theme.surface },
                      recommendLanguage === option.id && { backgroundColor: theme.primary }
                    ]} 
                    onPress={() => setRecommendLanguage(option.id)}
                  >
                    <Text style={styles.languageEmoji}>{option.emoji}</Text>
                    <Text style={[styles.languageLabel, { color: recommendLanguage === option.id ? '#fff' : theme.text }]}>{option.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <View style={styles.navButtons}>
                <TouchableOpacity style={[styles.backStepButton, { backgroundColor: theme.surface }]} onPress={() => setRecommendStep(2)}>
                  <Text style={{ color: theme.text }}>← Back</Text>
                </TouchableOpacity>
                {recommendLanguage && (
                  <TouchableOpacity 
                    style={[styles.nextButton, { backgroundColor: theme.primary, flex: 1, marginLeft: 10 }]} 
                    onPress={generateRecommendation}
                    disabled={recommendLoading}
                  >
                    {recommendLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={styles.nextButtonText}>🎯 Get Recommendation</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}

          {/* Step 4: Result */}
          {recommendStep === 4 && recommendation && (
            <View style={styles.recommendSection}>
              <View style={styles.resultHeader}>
                <Text style={[styles.resultLabel, { color: theme.textSecondary }]}>We recommend</Text>
                {recommendationExplanation && (
                  <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceLabel(recommendationExplanation.confidence).color }]}>
                    <Text style={styles.confidenceText}>{getConfidenceLabel(recommendationExplanation.confidence).text}</Text>
                  </View>
                )}
              </View>
              
              <TouchableOpacity 
                style={[styles.resultCard, { backgroundColor: theme.surface }]}
                onPress={() => openDetails(recommendation, recommendType)}
              >
                <Image source={{ uri: `https://image.tmdb.org/t/p/w500${recommendation.poster_path}` }} style={styles.resultPoster} />
                <View style={styles.resultInfo}>
                  <Text style={[styles.resultTitle, { color: theme.text }]}>{recommendation.title || recommendation.name}</Text>
                  <View style={styles.resultBadges}>
                    <View style={[styles.badge, { backgroundColor: theme.card }]}>
                      <Text style={{ color: theme.text, fontSize: 11 }}>⭐ {recommendation.vote_average?.toFixed(1)}</Text>
                    </View>
                    <View style={[styles.badge, { backgroundColor: theme.card }]}>
                      <Text style={{ color: theme.text, fontSize: 11 }}>{(recommendation.release_date || recommendation.first_air_date || '').split('-')[0]}</Text>
                    </View>
                    {recommendation.runtime && (
                      <View style={[styles.badge, { backgroundColor: theme.card }]}>
                        <Text style={{ color: theme.text, fontSize: 11 }}>{recommendation.runtime} min</Text>
                      </View>
                    )}
                  </View>
                  {recommendation.genres?.length > 0 && (
                    <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 8 }}>
                      {recommendation.genres.slice(0, 3).map(g => g.name).join(' • ')}
                    </Text>
                  )}
                  <Text style={{ color: theme.textMuted, fontSize: 11, marginTop: 8, fontStyle: 'italic' }}>Tap for full details →</Text>
                </View>
              </TouchableOpacity>

              {/* Explanation */}
              {recommendationExplanation && (
                <View style={[styles.explanationCard, { backgroundColor: theme.surface }]}>
                  <Text style={[styles.explanationTitle, { color: theme.text }]}>Why this pick?</Text>
                  
                  {recommendationExplanation.positive.map((reason, i) => (
                    <View key={i} style={styles.reasonRow}>
                      <Text style={styles.reasonIcon}>✓</Text>
                      <Text style={[styles.reasonText, { color: theme.textSecondary }]}>{reason}</Text>
                    </View>
                  ))}
                  
                  {recommendationExplanation.negative.map((reason, i) => (
                    <View key={i} style={styles.reasonRow}>
                      <Text style={[styles.reasonIcon, { color: theme.secondary }]}>⚠</Text>
                      <Text style={[styles.reasonText, { color: theme.textMuted }]}>{reason}</Text>
                    </View>
                  ))}
                  
                  {likedList.length < 5 && (
                    <Text style={{ color: theme.textMuted, fontSize: 11, marginTop: 10, fontStyle: 'italic' }}>
                      💡 Like more titles to improve recommendations
                    </Text>
                  )}
                </View>
              )}

              {/* Actions */}
              <View style={styles.resultActions}>
                <TouchableOpacity 
                  style={[styles.resultActionBtn, { backgroundColor: theme.primary }]}
                  onPress={() => { addToWatchlist(recommendation); showToast('Added to Watchlist!', 'success'); }}
                >
                  <Text style={styles.resultActionText}>📝 Add to Watchlist</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.resultActionBtn, { backgroundColor: theme.secondary }]}
                  onPress={() => { addToLiked(recommendation); showToast('Added to Liked!', 'success'); }}
                >
                  <Text style={styles.resultActionText}>👍 Already seen & loved</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.tryAgainButtons}>
                <TouchableOpacity 
                  style={[styles.anotherBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
                  onPress={getAnotherSuggestion}
                >
                  <Text style={{ color: theme.text }}>🎲 Another suggestion</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.changeOptionsBtn, { borderColor: theme.border }]}
                  onPress={() => { 
                    setRecommendStep(0); 
                    setRecommendType(null);
                    setRecommendMood(null);
                    setRecommendSubMood(null);
                    setRecommendDuration(null);
                    setRecommendLanguage(null);
                    setRecommendation(null); 
                    setRecommendationExplanation(null);
                    setSuggestedIds([]); // Clear suggestions when changing options
                  }}
                >
                  <Text style={{ color: theme.textSecondary }}>⚙️ Change options</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Loading state while generating recommendation */}
          {recommendLoading && (
            <View style={styles.recommendSection}>
              <View style={styles.centered}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.loadingText, { color: theme.textSecondary, marginTop: 16 }]}>
                  Finding the perfect match...
                </Text>
                <Text style={[{ color: theme.textMuted, fontSize: 12, marginTop: 8, textAlign: 'center' }]}>
                  Analyzing your preferences
                </Text>
              </View>
            </View>
          )}

          {/* Fallback: Step 0.5 but onboarding not needed - skip to step 1 */}
          {recommendStep === 0.5 && !needsOnboarding && !recommendLoading && (
            <View style={styles.recommendSection}>
              <View style={styles.centered}>
                <ActivityIndicator size="large" color={theme.primary} />
                <Text style={[styles.loadingText, { color: theme.textSecondary, marginTop: 16 }]}>
                  Preparing...
                </Text>
              </View>
            </View>
          )}

          {/* Fallback: Step 4 but no recommendation yet (error state) */}
          {recommendStep === 4 && !recommendation && !recommendLoading && (
            <View style={styles.recommendSection}>
              <View style={styles.centered}>
                <Text style={{ fontSize: 48, marginBottom: 16 }}>😕</Text>
                <Text style={[styles.recommendQuestion, { color: theme.text, textAlign: 'center' }]}>
                  Couldn't find a match
                </Text>
                <Text style={[styles.recommendSubtext, { color: theme.textSecondary, textAlign: 'center', marginBottom: 24 }]}>
                  Try adjusting your preferences
                </Text>
                <TouchableOpacity
                  style={[styles.resultActionBtn, { backgroundColor: theme.primary }]}
                  onPress={() => {
                    setRecommendStep(0);
                    setRecommendType(null);
                    setRecommendMood(null);
                    setRecommendSubMood(null);
                    setRecommendDuration(null);
                    setRecommendLanguage(null);
                    setRecommendation(null);
                    setRecommendationExplanation(null);
                    setSuggestedIds([]);
                  }}
                >
                  <Text style={styles.resultActionText}>Try Again</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

        </ScrollView>
        <Toast {...toast} />
      </SafeAreaView>
    );
  }

  // ============================================
  // SWIPE SCREEN (default)
  // ============================================

  const current = movies[currentIndex];
  const filterCount = getActiveFilterCount();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity onPress={() => setCurrentScreen(SCREENS.HOME)}>
          <Text style={[styles.backBtn, { color: theme.primary }]}>← Back</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text }]}>{contentType === 'movie' ? '🎬 Movies' : '📺 TV Shows'}</Text>
        <TouchableOpacity onPress={() => { setActiveListTab('watchlist'); setCurrentScreen(SCREENS.LISTS); }}>
          <Text style={{ color: theme.text }}>📝 {watchlist.length}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.filterBar}>
        <TouchableOpacity 
          style={[styles.filterBarBtn, { backgroundColor: hasActiveFilters() ? theme.primary : theme.surface }]} 
          onPress={() => setShowFilterModal(true)}
        >
          <Text>⚙️</Text>
          <Text style={{ color: hasActiveFilters() ? '#fff' : theme.text, marginLeft: 6, fontWeight: '600' }}>
            Filters {filterCount > 0 ? `(${filterCount})` : ''}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterBarBtn, { backgroundColor: theme.surface }]} onPress={() => setShowSortModal(true)}>
          <Text>↕️</Text>
          <Text style={{ color: theme.text, marginLeft: 6, fontWeight: '600' }}>{getSortLabel()}</Text>
        </TouchableOpacity>
      </View>

      {/* Filter Modal */}
      <Modal visible={showFilterModal} animationType="slide" transparent={true} onRequestClose={() => setShowFilterModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Filters</Text>
              <TouchableOpacity onPress={() => setShowFilterModal(false)}>
                <Text style={{ color: theme.textSecondary, fontSize: 22 }}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.modalBody}>
              <Text style={[styles.filterSectionTitle, { color: theme.textSecondary }]}>Genres {selectedGenres.length > 0 && `(${selectedGenres.length})`}</Text>
              <View style={styles.filterChips}>
                {getGenres().map((g) => (
                  <TouchableOpacity key={g.id} style={[styles.filterChip, { backgroundColor: selectedGenres.includes(g.id) ? theme.primary : theme.card }]} onPress={() => toggleGenre(g.id)}>
                    <Text style={{ color: selectedGenres.includes(g.id) ? '#fff' : theme.textSecondary, fontSize: 12 }}>{g.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[styles.filterSectionTitle, { color: theme.textSecondary }]}>Streaming Service</Text>
              <View style={styles.filterChips}>
                <TouchableOpacity style={[styles.filterChip, { backgroundColor: selectedProvider === null ? theme.primary : theme.card }]} onPress={() => setSelectedProvider(null)}>
                  <Text style={{ color: selectedProvider === null ? '#fff' : theme.textSecondary, fontSize: 12 }}>All</Text>
                </TouchableOpacity>
                {PROVIDERS.map((p) => (
                  <TouchableOpacity key={p.id} style={[styles.filterChip, { backgroundColor: selectedProvider === p.id ? theme.primary : theme.card }]} onPress={() => setSelectedProvider(p.id)}>
                    <Text style={{ color: selectedProvider === p.id ? '#fff' : theme.textSecondary, fontSize: 12 }}>{p.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={[styles.filterSectionTitle, { color: theme.textSecondary }]}>Minimum Rating</Text>
              <View style={styles.filterChips}>
                {RATINGS.map((r) => (
                  <TouchableOpacity key={r.id ?? 'any'} style={[styles.filterChip, { backgroundColor: selectedRating === r.id ? theme.primary : theme.card }]} onPress={() => setSelectedRating(r.id)}>
                    <Text style={{ color: selectedRating === r.id ? '#fff' : theme.textSecondary, fontSize: 12 }}>{r.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>
            <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
              <TouchableOpacity style={[styles.modalResetBtn, { backgroundColor: theme.card }]} onPress={resetFilters}>
                <Text style={{ color: theme.text, fontWeight: '600' }}>Reset</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalApplyBtn, { backgroundColor: theme.primary }]} onPress={applyFilters}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Sort Modal */}
      <Modal visible={showSortModal} animationType="slide" transparent={true} onRequestClose={() => setShowSortModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, styles.sortModal, { backgroundColor: theme.surface }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.border }]}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>Sort By</Text>
              <TouchableOpacity onPress={() => setShowSortModal(false)}>
                <Text style={{ color: theme.textSecondary, fontSize: 22 }}>✕</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.modalBody}>
              <Text style={[styles.filterSectionTitle, { color: theme.textSecondary }]}>Sort Field</Text>
              {SORT_FIELDS.map((f) => (
                <TouchableOpacity key={f.id} style={[styles.sortOption, { backgroundColor: sortField === f.id ? theme.primary : theme.card }]} onPress={() => setSortField(f.id)}>
                  <Text style={{ color: sortField === f.id ? '#fff' : theme.textSecondary }}>{f.name}</Text>
                  {sortField === f.id && <Text style={{ color: '#fff', fontWeight: 'bold' }}>✓</Text>}
                </TouchableOpacity>
              ))}
              <Text style={[styles.filterSectionTitle, { color: theme.textSecondary, marginTop: 16 }]}>Direction</Text>
              <View style={styles.sortDirectionRow}>
                <TouchableOpacity style={[styles.sortDirectionBtn, { backgroundColor: sortDirection === 'desc' ? theme.primary : theme.card }]} onPress={() => setSortDirection('desc')}>
                  <Text style={{ color: sortDirection === 'desc' ? '#fff' : theme.text }}>↓</Text>
                  <Text style={{ color: sortDirection === 'desc' ? '#fff' : theme.textSecondary, marginLeft: 6 }}>High to Low</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.sortDirectionBtn, { backgroundColor: sortDirection === 'asc' ? theme.primary : theme.card }]} onPress={() => setSortDirection('asc')}>
                  <Text style={{ color: sortDirection === 'asc' ? '#fff' : theme.text }}>↑</Text>
                  <Text style={{ color: sortDirection === 'asc' ? '#fff' : theme.textSecondary, marginLeft: 6 }}>Low to High</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View style={[styles.modalFooter, { borderTopColor: theme.border }]}>
              <TouchableOpacity style={[styles.modalApplyBtn, { backgroundColor: theme.primary, flex: 1 }]} onPress={applySort}>
                <Text style={{ color: '#fff', fontWeight: '600' }}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={{ color: theme.textSecondary, marginTop: 14 }}>Loading...</Text>
        </View>
      ) : current ? (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 10 }}>
          <TouchableOpacity style={[styles.card, { backgroundColor: theme.card }]} activeOpacity={0.9} onPress={() => openDetails(current, contentType)}>
            <Image source={{ uri: `https://image.tmdb.org/t/p/w342${current.poster_path}` }} style={styles.cardPoster} />
            <View style={styles.cardInfo}>
              <Text style={[styles.cardTitle, { color: theme.text }]} numberOfLines={3}>{current.title || current.name}</Text>
              {movieDetails?.tagline && <Text style={{ color: theme.secondary, fontSize: 11, fontStyle: 'italic', marginBottom: 8 }} numberOfLines={2}>"{movieDetails.tagline}"</Text>}
              <View style={styles.cardBadges}>
                <View style={[styles.badge, { backgroundColor: theme.surface }]}><Text style={{ color: theme.text, fontSize: 10 }}>⭐ {current.vote_average?.toFixed(1)}</Text></View>
                <View style={[styles.badge, { backgroundColor: theme.surface }]}><Text style={{ color: theme.text, fontSize: 10 }}>{(current.release_date || current.first_air_date || '').split('-')[0]}</Text></View>
                {getRuntime() && <View style={[styles.badge, { backgroundColor: theme.surface }]}><Text style={{ color: theme.text, fontSize: 10 }}>{getRuntime()}</Text></View>}
              </View>
              {contentType === 'tv' && movieDetails && (
                <View style={{ flexDirection: 'row', marginBottom: 6 }}>
                  {movieDetails.number_of_seasons && <Text style={{ color: theme.secondary, fontSize: 11, fontWeight: '600' }}>{movieDetails.number_of_seasons} Season{movieDetails.number_of_seasons > 1 ? 's' : ''}</Text>}
                  {movieDetails.status && <Text style={{ color: theme.secondary, fontSize: 11, fontWeight: '600' }}> • {movieDetails.status}</Text>}
                </View>
              )}
              {movieDetails?.genres?.length > 0 && (
                <>
                  <Text style={{ color: theme.textMuted, fontSize: 9, textTransform: 'uppercase', marginTop: 5 }}>Genre</Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 11 }}>{movieDetails.genres.map(g => g.name).join(', ')}</Text>
                </>
              )}
              {contentType === 'movie' && getDirector() && (
                <>
                  <Text style={{ color: theme.textMuted, fontSize: 9, textTransform: 'uppercase', marginTop: 5 }}>Director</Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 11 }}>{getDirector()}</Text>
                </>
              )}
              {getCast().length > 0 && (
                <>
                  <Text style={{ color: theme.textMuted, fontSize: 9, textTransform: 'uppercase', marginTop: 5 }}>Cast</Text>
                  <Text style={{ color: theme.textSecondary, fontSize: 11 }}>{getCast().join(', ')}</Text>
                </>
              )}
              {getProviders() && (
                <>
                  <Text style={{ color: theme.textMuted, fontSize: 9, textTransform: 'uppercase', marginTop: 5 }}>Watch on</Text>
                  <Text style={{ color: theme.primary, fontSize: 11, fontWeight: '600' }}>{getProviders()}</Text>
                </>
              )}
              <Text style={{ color: theme.textMuted, fontSize: 10, marginTop: 10, fontStyle: 'italic' }}>Tap for details & trailers →</Text>
            </View>
          </TouchableOpacity>
          
          <View style={[styles.overviewCard, { backgroundColor: theme.card }]}>
            <Text style={{ color: theme.textMuted, fontSize: 11, textTransform: 'uppercase', marginBottom: 6 }}>Overview</Text>
            <Text style={{ color: theme.textSecondary, fontSize: 13, lineHeight: 20 }}>{current.overview || 'No overview available.'}</Text>
          </View>
        </ScrollView>
      ) : (
        <View style={styles.centered}>
          <Text style={styles.emptyEmoji}>🔍</Text>
          <Text style={[styles.emptyTitle, { color: theme.text }]}>No results found</Text>
          <Text style={[styles.emptySubtitle, { color: theme.textSecondary }]}>Try adjusting your filters</Text>
          <TouchableOpacity style={[styles.emptyButton, { backgroundColor: theme.primary }]} onPress={() => { resetFilters(); fetchContent(contentType, [], null, null, sortField, sortDirection); }}>
            <Text style={{ color: '#fff', fontWeight: '600' }}>Reset Filters</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && current && (
        <View style={[styles.bottomBar, { backgroundColor: theme.background, borderTopColor: theme.border }]}>
          <View style={styles.buttons}>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.skip }]} onPress={() => handleSwipe('left')}>
              <Text style={styles.actionIcon}>✕</Text>
              <Text style={styles.actionLabel}>Skip</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.secondary }]} onPress={() => handleSwipe('up')}>
              <Text style={styles.actionIcon}>👍</Text>
              <Text style={styles.actionLabel}>Liked</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: theme.primary }]} onPress={() => handleSwipe('right')}>
              <Text style={styles.actionIcon}>♥</Text>
              <Text style={styles.actionLabel}>Watch</Text>
            </TouchableOpacity>
          </View>
          <Text style={{ color: theme.textMuted, fontSize: 12, textAlign: 'center', marginTop: 8 }}>{currentIndex + 1} / {movies.length}</Text>
        </View>
      )}

      <Toast {...toast} />
    </SafeAreaView>
  );
};

// ============================================
// STYLES (static - no theme variables)
// ============================================

const styles = StyleSheet.create({
  container: { flex: 1 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },

  // Toast
  toastContainer: { position: 'absolute', bottom: 100, left: 20, right: 20, padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', zIndex: 1000 },
  toastMessage: { color: '#fff', fontSize: 14, fontWeight: '500', flex: 1 },
  toastUndoBtn: { marginLeft: 12, paddingHorizontal: 12, paddingVertical: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 6 },
  toastUndoText: { color: '#fff', fontSize: 13, fontWeight: '600' },

  // Splash
  splashContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  splashEmoji: { fontSize: 80, marginBottom: 20 },
  splashTitle: { fontSize: 36, fontWeight: 'bold' },
  splashSubtitle: { fontSize: 16, marginTop: 8 },

  // Home
  homeContainer: { flex: 1, padding: 20 },
  homeHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  logoContainer: { flexDirection: 'row', alignItems: 'center' },
  logoEmoji: { fontSize: 28 },
  logoTitle: { fontSize: 20, fontWeight: 'bold', marginLeft: 8 },
  settingsBtn: { padding: 8 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 13, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  menuButton: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12, marginBottom: 10 },
  menuEmoji: { fontSize: 28, marginRight: 14 },
  menuText: { flex: 1 },
  menuTitle: { fontSize: 17, fontWeight: '600' },
  menuSubtitle: { fontSize: 12, marginTop: 2 },
  menuArrow: { fontSize: 18 },

  // Search
  searchBar: { flexDirection: 'row', alignItems: 'center', padding: 14, borderRadius: 12, marginBottom: 24 },
  searchPlaceholder: { fontSize: 15 },
  searchInputContainer: { flexDirection: 'row', alignItems: 'center', margin: 16, borderRadius: 12, paddingHorizontal: 14 },
  searchInput: { flex: 1, fontSize: 16, paddingVertical: 14 },
  searchResultItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  searchResultPoster: { width: 50, height: 75, borderRadius: 6, backgroundColor: '#333' },
  searchResultInfo: { flex: 1, marginLeft: 12 },
  searchResultTitle: { fontSize: 15, fontWeight: '500' },
  searchResultMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  addBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },

  // Stats Card (Home)
  statsCard: { borderRadius: 12, padding: 16 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  statItem: { alignItems: 'center' },
  statNumber: { fontSize: 28, fontWeight: 'bold' },
  statLabel: { fontSize: 12, marginTop: 4 },
  statDivider: { width: 1, height: 40 },
  statsHint: { fontSize: 12, textAlign: 'center', marginTop: 12 },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 16, borderBottomWidth: 1 },
  backBtn: { fontSize: 16, fontWeight: '600' },
  headerTitle: { fontSize: 17, fontWeight: 'bold', flex: 1, textAlign: 'center', marginHorizontal: 10 },

  // Settings
  settingsContainer: { flex: 1, padding: 16 },
  settingsSectionTitle: { fontSize: 13, marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 },
  settingsItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderRadius: 12, marginBottom: 8 },
  settingsItemLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  settingsItemTitle: { fontSize: 16, fontWeight: '500' },
  settingsItemSubtitle: { fontSize: 12, marginTop: 2 },

  // Stats Screen
  statsContainer: { flex: 1, padding: 16 },
  statsSection: { borderRadius: 12, padding: 16, marginBottom: 16 },
  statsSectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 16 },
  statsGrid: { flexDirection: 'row', gap: 10 },
  statsGridItem: { flex: 1, alignItems: 'center', padding: 16, borderRadius: 10 },
  statsGridNumber: { fontSize: 24, fontWeight: 'bold' },
  statsGridLabel: { fontSize: 11, marginTop: 4 },
  statsBreakdownRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8 },
  statsDivider: { height: 1, marginVertical: 8 },
  statsTimeRow: { flexDirection: 'row', gap: 12 },
  statsTimeItem: { flex: 1, alignItems: 'center', padding: 16, borderRadius: 10 },
  statsTimeValue: { fontSize: 18, fontWeight: 'bold', marginTop: 8 },

  // Lists
  listTabs: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 12, gap: 10 },
  listTab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10 },
  filterTabs: { flexDirection: 'row', paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  filterTab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 16 },
  listItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  listPoster: { width: 50, height: 75, borderRadius: 6, backgroundColor: '#333' },
  listContent: { flex: 1, marginLeft: 12 },
  listTitle: { fontSize: 15, fontWeight: '500' },
  listMeta: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  listActionBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  clearBtn: { margin: 16, padding: 14, borderRadius: 8, alignItems: 'center', borderWidth: 1, backgroundColor: 'transparent' },

  // Add Modal
  addModal: { borderRadius: 16, padding: 20, marginHorizontal: 30, width: width - 60 },
  addModalTitle: { fontSize: 18, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  addModalOption: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 10, marginBottom: 10 },

  // Details
  detailsHero: { flexDirection: 'row', padding: 16 },
  detailsPoster: { width: width * 0.35, height: width * 0.52, borderRadius: 12 },
  detailsHeroInfo: { flex: 1, marginLeft: 16 },
  detailsTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  detailsBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10 },
  detailsActions: { flexDirection: 'row', paddingHorizontal: 16, gap: 12, marginBottom: 16 },
  detailsActionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10 },
  detailsSection: { paddingHorizontal: 16, marginBottom: 20 },
  detailsSectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  detailsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  detailsGridItem: { minWidth: (width - 52) / 2, borderRadius: 8, padding: 12 },

  // Trailers
  trailerItem: { width: 200, marginRight: 12 },
  trailerThumb: { width: 200, height: 112, borderRadius: 8, backgroundColor: '#333' },
  trailerPlayBtn: { position: 'absolute', top: 36, left: 80, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(229,9,20,0.9)', justifyContent: 'center', alignItems: 'center' },

  // Cast
  castItem: { width: 80, marginRight: 12, alignItems: 'center' },
  castPhoto: { width: 70, height: 70, borderRadius: 35, backgroundColor: '#333', marginBottom: 6 },

  // Similar
  similarItem: { width: 100, marginRight: 12 },
  similarPoster: { width: 100, height: 150, borderRadius: 8, backgroundColor: '#333', marginBottom: 6 },

  // Filter Bar
  filterBar: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, gap: 12 },
  filterBarBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10 },

  // Modal
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  modalContent: { borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%' },
  sortModal: { maxHeight: '50%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  modalBody: { padding: 18 },
  modalFooter: { flexDirection: 'row', padding: 18, gap: 12, borderTopWidth: 1 },
  modalResetBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  modalApplyBtn: { flex: 2, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },

  // Filters
  filterSectionTitle: { fontSize: 13, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  filterChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  filterChip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16 },

  // Sort
  sortOption: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, paddingHorizontal: 14, borderRadius: 10, marginBottom: 8 },
  sortDirectionRow: { flexDirection: 'row', gap: 10 },
  sortDirectionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 10 },

  // Card
  card: { flexDirection: 'row', borderRadius: 16, overflow: 'hidden' },
  cardPoster: { width: width * 0.38, height: width * 0.57, borderTopLeftRadius: 16, borderBottomLeftRadius: 16 },
  cardInfo: { flex: 1, padding: 12 },
  cardTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 4 },
  cardBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 5, marginBottom: 8 },
  badge: { paddingHorizontal: 7, paddingVertical: 3, borderRadius: 4 },
  overviewCard: { borderRadius: 12, padding: 14, marginTop: 12 },

  // Bottom Bar
  bottomBar: { borderTopWidth: 1, paddingVertical: 10, paddingHorizontal: 16 },
  buttons: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 20 },
  actionBtn: { width: 60, height: 60, borderRadius: 30, justifyContent: 'center', alignItems: 'center' },
  actionIcon: { color: '#fff', fontSize: 20 },
  actionLabel: { color: '#fff', fontSize: 9, marginTop: 2 },

  // Empty States
  emptyContainer: { alignItems: 'center', paddingVertical: 60 },
  emptyEmoji: { fontSize: 50, marginBottom: 14 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold' },
  emptySubtitle: { fontSize: 13, marginTop: 6, textAlign: 'center', paddingHorizontal: 30 },
  emptyButton: { marginTop: 20, paddingHorizontal: 22, paddingVertical: 11, borderRadius: 8 },


// WatchNext Button (Home)
  watchNextButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderRadius: 16, marginBottom: 10 },
  watchNextContent: { flexDirection: 'row', alignItems: 'center' },
  watchNextEmoji: { fontSize: 32, marginRight: 14 },
  watchNextText: {},
  watchNextTitle: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  watchNextSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  watchNextArrow: { fontSize: 24, color: '#fff' },

  // Recommend Screen
  recommendSection: { flex: 1 },
  recommendQuestion: { fontSize: 24, fontWeight: 'bold', marginBottom: 8, textAlign: 'center' },
  recommendSubtext: { fontSize: 14, textAlign: 'center', marginBottom: 30 },
  
  stepIndicator: { alignItems: 'center', marginBottom: 24 },
  stepText: { fontSize: 12, marginBottom: 8 },
  stepDots: { flexDirection: 'row', gap: 6 },
  stepDot: { width: 8, height: 8, borderRadius: 4 },

  recommendOptions: { flexDirection: 'row', gap: 16 },
  recommendTypeCard: { flex: 1, alignItems: 'center', padding: 30, borderRadius: 16 },
  recommendTypeEmoji: { fontSize: 48, marginBottom: 12 },
  recommendTypeLabel: { fontSize: 18, fontWeight: 'bold' },
  recommendTypeDesc: { fontSize: 12, marginTop: 4 },

  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'center' },
  moodCard: { width: (width - 76) / 3, alignItems: 'center', padding: 16, borderRadius: 12 },
  moodEmoji: { fontSize: 28, marginBottom: 6 },
  moodLabel: { fontSize: 12, fontWeight: '600' },

  durationOptions: { gap: 12 },
  durationCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12 },
  durationEmoji: { fontSize: 24, marginRight: 14 },
  durationLabel: { fontSize: 16, fontWeight: '500' },

  languageOptions: { gap: 12 },
  languageCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12 },
  languageEmoji: { fontSize: 24, marginRight: 14 },
  languageLabel: { fontSize: 16, fontWeight: '500' },

  navButtons: { flexDirection: 'row', marginTop: 24 },
  backStepButton: { paddingHorizontal: 20, paddingVertical: 14, borderRadius: 10 },
  nextButton: { paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  nextButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },

  // Result
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  resultLabel: { fontSize: 14 },
  confidenceBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  confidenceText: { color: '#fff', fontSize: 11, fontWeight: '600' },

  resultCard: { flexDirection: 'row', borderRadius: 16, overflow: 'hidden', marginBottom: 16 },
  resultPoster: { width: width * 0.35, height: width * 0.52 },
  resultInfo: { flex: 1, padding: 14 },
  resultTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 8 },
  resultBadges: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },

  explanationCard: { borderRadius: 12, padding: 16, marginBottom: 16 },
  explanationTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 12 },
  reasonRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 8 },
  reasonIcon: { fontSize: 14, marginRight: 8, color: '#4CAF50' },
  reasonText: { flex: 1, fontSize: 13, lineHeight: 18 },

  resultActions: { gap: 10, marginBottom: 16 },
  resultActionBtn: { padding: 16, borderRadius: 12, alignItems: 'center' },
  resultActionText: { color: '#fff', fontSize: 15, fontWeight: '600' },

  tryAgainBtn: { padding: 14, borderRadius: 10, alignItems: 'center', borderWidth: 1 },

  // Onboarding
  onboardingHeader: { alignItems: 'center', marginBottom: 24 },
  onboardingProgress: { width: '100%', marginTop: 20 },
  onboardingProgressBar: { height: 4, borderRadius: 2, overflow: 'hidden' },
  onboardingProgressFill: { height: '100%', borderRadius: 2 },
  onboardingProgressText: { fontSize: 12, textAlign: 'center', marginTop: 8 },
  
  onboardingCard: { alignItems: 'center', padding: 20, borderRadius: 16, marginBottom: 20 },
  onboardingPoster: { width: width * 0.45, height: width * 0.67, borderRadius: 12, marginBottom: 16 },
  onboardingTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 4 },
  onboardingGenre: { fontSize: 14, marginBottom: 8 },
  onboardingMeta: { flexDirection: 'row', gap: 16 },
  
  onboardingQuestion: { fontSize: 16, textAlign: 'center', marginBottom: 16 },
  onboardingButtons: { flexDirection: 'row', justifyContent: 'center', gap: 12 },
  onboardingBtn: { alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, minWidth: 90 },
  onboardingBtnDislike: {},
  onboardingBtnSkip: { borderWidth: 1 },
  onboardingBtnLike: {},
  onboardingBtnEmoji: { fontSize: 24, marginBottom: 4 },
  onboardingBtnText: { fontSize: 11, color: '#fff', fontWeight: '600' },
  
  skipOnboarding: { alignItems: 'center', marginTop: 24, padding: 10 },
  loadingText: { marginTop: 16, fontSize: 14 },

    // Sub-mood selection
  selectedMoodHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, paddingVertical: 12, marginBottom: 8 },
  selectedMoodLabel: { fontSize: 20, fontWeight: 'bold' },
  changeMood: { fontSize: 14 },
  
  subMoodList: { gap: 10, marginTop: 16 },
  subMoodCard: { flexDirection: 'row', alignItems: 'center', padding: 16, borderRadius: 12 },
  subMoodEmoji: { fontSize: 24, marginRight: 14 },
  subMoodLabel: { flex: 1, fontSize: 16, fontWeight: '500' },
  subMoodArrow: { fontSize: 18 },

  tryAgainButtons: { flexDirection: 'row', gap: 10, marginTop: 8 },
  anotherBtn: { flex: 1, padding: 14, borderRadius: 10, alignItems: 'center', borderWidth: 1 },
  changeOptionsBtn: { flex: 1, padding: 14, borderRadius: 10, alignItems: 'center', borderWidth: 1 },
  });


export default App;