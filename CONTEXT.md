# UpNext - Project Context & Architecture

## Vision

**UpNext** is a mood-based recommendation app that helps users decide what to consume next across multiple content types. The core question it answers: "What should I watch/listen/read/play next?"

**Tagline**: "Your mood. Your moment. Your next."

## Content Categories

| Category | Name | Icon | API |
|----------|------|------|-----|
| Movies & TV | Watch | movie/tv | TMDB API |
| Music | Listen | music | Spotify Web API |
| Books | Read | book | Google Books API |
| Games | Play | game | IGDB API (via Twitch) |
| Podcasts | Listen | podcast | Spotify/Podcast Index |

## Technical Stack

### Frontend
- **Framework**: React Native + Expo (SDK 52+)
- **Navigation**: @react-navigation/native + native-stack
- **Icons**: Custom UNIcon component (50+ SVG icons)
- **Fonts**: Inter (Google Fonts)
- **State**: React Context + AsyncStorage (local), Firestore (cloud sync)

### Backend & Services
- **Backend/Auth**: Firebase
  - Authentication (Google, Apple, Email)
  - Firestore (user data, preferences, lists)
  - Cloud Functions (if needed)
- **Payments**: RevenueCat (in-app purchases, subscriptions)
- **Ads**: Google AdMob (banner ads for free tier)

### APIs
- **TMDB** (themoviedb.org) - Movies & TV shows
- **Spotify Web API** - Music, playlist export (OAuth required)
- **Google Books API** - Books
- **IGDB** (via Twitch) - Games
- **YouTube Music** - Playlist export (premium feature)

## Monetization Strategy

### Free Tier
- All basic features
- Ad banners (non-intrusive)
- Limited lists/saves

### Premium Subscription
- No ads
- Unlimited lists
- **Playlist export** to Spotify/YouTube Music
- Advanced filters
- Cloud sync across devices
- Priority recommendations

## Brand Identity

### Colors (Gothic Noir + Accents)
```javascript
// Backgrounds
bgMain: '#000000'
bgCard: '#2B2B2B'
bgSecondary: '#1a1a1a'

// Text
textPrimary: '#FFFFFF'
textSecondary: '#D1D0D0'
textMuted: '#988686'

// Accents
accentWarm: '#FFDBBB'    // Peach - warm highlights
accentCool: '#BADDFF'    // Sky blue - cool moods
accentAction: '#F88379'  // Coral - actions, likes

// Logo Gradient
gradientStart: '#FF5A8A' // Pink
gradientEnd: '#6A5CFF'   // Purple
```

### Typography
- Font Family: Inter
- Weights: Regular (400), Medium (500), SemiBold (600), Bold (700), ExtraBold (800)

### Logo
- "U" shape with upward arrow
- Gradient from pink (#FF5A8A) to purple (#6A5CFF)
- Represents "forward motion + discovery"

## Project Structure

```
UpNext/
├── App.js                 # Entry point with font loading
├── app.json               # Expo configuration
├── src/
│   ├── components/        # Reusable components
│   │   ├── UNIcon.js      # Custom SVG icon component
│   │   └── index.js
│   ├── screens/           # App screens
│   ├── navigation/        # Navigation configuration
│   ├── services/          # API services (TMDB, Spotify, etc.)
│   ├── hooks/             # Custom React hooks
│   ├── context/           # React Context providers
│   ├── theme/             # Colors, typography, spacing
│   │   ├── colors.js
│   │   └── index.js
│   ├── constants/         # App constants, moods, durations
│   ├── utils/             # Utility functions
│   └── assets/            # Local assets
├── docs/
│   └── brand/             # Brand assets and guidelines
└── assets/                # Expo assets (icons, splash)
```

## UNIcon Component

Custom SVG icon component with 50+ icons including:

**Moods**: comedy, drama, action, thriller, horror, romance, fantasy

**Navigation**: home, search, watchlist, favorites, profile, settings

**Actions**: play, add, remove, thumbsUp, thumbsDown, skip, shuffle, filter, sort

**Content Types**: movie, tv, music, book, game, podcast

**Durations**: durationShort, durationMedium, durationLong, seriesShort, seriesMedium

**Status**: checked, notWatched, inProgress

**UI**: chevronLeft/Right/Up/Down, arrowLeft/Right, close, menu, info, check, globe, share, refresh

Usage:
```jsx
import UNIcon from './src/components/UNIcon';
import { COLORS } from './src/theme';

<UNIcon name="movie" size={24} color={COLORS.accentWarm} />
```

## Mood-Based Recommendation Flow

1. **Select Category**: Watch / Listen / Read / Play
2. **Select Mood**: How do you feel? (comedy, drama, action, etc.)
3. **Select Duration/Commitment**: Quick / Medium / Long
4. **Optional Filters**: Language, year range, etc.
5. **Get Recommendations**: Swipe through suggestions
6. **Save/Like/Skip**: Build personal lists

## Data Model (Firestore)

```javascript
// users/{userId}
{
  email: string,
  displayName: string,
  premium: boolean,
  createdAt: timestamp,
  preferences: {
    defaultLanguage: string,
    notifications: boolean
  }
}

// users/{userId}/lists/{listId}
{
  name: string,
  type: 'watch' | 'listen' | 'read' | 'play',
  items: [
    {
      id: string,
      title: string,
      posterUrl: string,
      addedAt: timestamp,
      status: 'pending' | 'in_progress' | 'completed'
    }
  ]
}

// users/{userId}/history/{itemId}
{
  type: 'movie' | 'tv' | 'music' | 'book' | 'game',
  externalId: string,
  action: 'liked' | 'disliked' | 'skipped' | 'watched',
  timestamp: timestamp
}
```

## Premium Features - Spotify/YouTube Export

Users can export their music recommendations to playlists:

1. **Spotify Integration**:
   - OAuth authentication
   - Create playlist via Spotify Web API
   - Add recommended tracks

2. **YouTube Music**:
   - OAuth via Google
   - Create playlist via YouTube Data API

## Previous Work (WatchNext) - EXISTING CODE TO MIGRATE

The original WatchNext app (movies/TV only) is in `/home/user/watchnext/`. This code is **fully functional** and should be migrated to UpNext for the "Watch" category.

### Key File: `/home/user/watchnext/App.js`

This is a monolithic file (~3000 lines) containing everything. For UpNext, we'll refactor into modular components.

### TMDB API Integration (Lines 470-535)

```javascript
// Discover endpoint - main content fetching
axios.get(`https://api.themoviedb.org/3/discover/${type}`, {
  params: {
    api_key: TMDB_API_KEY,
    language: 'en-US',
    sort_by: 'popularity.desc',
    with_genres: genres.join(','),
    'vote_average.gte': rating,
    'vote_count.gte': 50,
  }
});

// Get details with credits and providers
axios.get(`https://api.themoviedb.org/3/${type}/${id}`, {
  params: {
    api_key: TMDB_API_KEY,
    append_to_response: 'credits,watch/providers'
  }
});

// Get trailers
axios.get(`https://api.themoviedb.org/3/${type}/${id}/videos`);

// Get similar content
axios.get(`https://api.themoviedb.org/3/${type}/${id}/similar`);

// Search
axios.get('https://api.themoviedb.org/3/search/movie');
axios.get('https://api.themoviedb.org/3/search/tv');
```

### Mood Definitions (Lines 102-200)

```javascript
const MOODS = [
  {
    id: 'laugh',
    icon: 'comedy',
    label: 'Laugh',
    genres: [35], // Comedy
    subOptions: [
      { id: 'any', label: 'Any comedy', genres: [35] },
      { id: 'romantic', label: 'Romantic', genres: [35, 10749] },
      { id: 'action', label: 'Action comedy', genres: [35, 28] },
      { id: 'dark', label: 'Dark / Satire', genres: [35], keywords: 'dark comedy,satire' },
      { id: 'family', label: 'Family friendly', genres: [35, 10751] },
    ]
  },
  {
    id: 'think', icon: 'thriller', label: 'Think', genres: [18, 9648],
    // Mystery, Psychological, Documentary, Historical
  },
  {
    id: 'adrenaline', icon: 'action', label: 'Adrenaline', genres: [28, 53],
    // Pure action, Thriller, Crime/Heist, War
  },
  {
    id: 'cry', icon: 'drama', label: 'Feel', genres: [18, 10749],
    // Romance, Family, Tragedy, Inspiring
  },
  {
    id: 'escape', icon: 'fantasy', label: 'Escape', genres: [878, 14],
    // Sci-Fi, Fantasy, Adventure, Superhero
  },
  {
    id: 'chill', icon: 'comedy', label: 'Chill', genres: [35, 10749],
    // Feel-good, Animated, Musical
  },
  {
    id: 'scare', icon: 'horror', label: 'Scare', genres: [27],
    // Supernatural, Slasher, Psychological
  },
  {
    id: 'surprise', icon: 'shuffle', label: 'Surprise me', genres: []
  },
];
```

### Genre IDs (TMDB)

```javascript
// Movies
const MOVIE_GENRES = [
  { id: 28, name: 'Action' }, { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' }, { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' }, { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' }, { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' }, { id: 36, name: 'History' },
  { id: 27, name: 'Horror' }, { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' }, { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' }, { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' }, { id: 37, name: 'Western' },
];

// TV Shows
const TV_GENRES = [
  { id: 10759, name: 'Action & Adventure' }, { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' }, { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' }, { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' }, { id: 10762, name: 'Kids' },
  { id: 9648, name: 'Mystery' }, { id: 10765, name: 'Sci-Fi & Fantasy' },
];
```

### Duration Options

```javascript
const DURATION_OPTIONS = [
  { id: 'short', label: '< 90 min', icon: 'movieShort', max: 90 },
  { id: 'medium', label: '90-120 min', icon: 'movieMedium', min: 90, max: 120 },
  { id: 'long', label: '2h+', icon: 'movieLong', min: 120 },
  { id: 'any', label: 'Any length', icon: 'clock', min: 0, max: 999 },
];

const COMMITMENT_OPTIONS = [ // For TV shows
  { id: 'one', label: '1 episode', icon: 'tvShort', seasons: 1 },
  { id: 'night', label: 'One night', icon: 'tvMedium', seasons: 1 },
  { id: 'weekend', label: 'Weekend binge', icon: 'tvLong', seasons: [1, 2] },
  { id: 'long', label: 'Long journey', icon: 'streaming', seasons: 3 },
];

const LANGUAGE_OPTIONS = [
  { id: 'any', label: 'Any language', icon: 'globe' },
  { id: 'original', label: 'English only', icon: 'language' },
  { id: 'local', label: 'My language', icon: 'flag' },
];
```

### Streaming Providers

```javascript
const PROVIDERS = [
  { id: 8, name: 'Netflix' },
  { id: 9, name: 'Prime Video' },
  { id: 337, name: 'Disney+' },
  { id: 384, name: 'HBO Max' },
  { id: 350, name: 'Apple TV+' },
  { id: 531, name: 'Paramount+' },
  { id: 283, name: 'Crunchyroll' },
];
```

### Onboarding Content (For initial taste profiling)

```javascript
const ONBOARDING_CONTENT = {
  movie: [
    { id: 299536, title: 'Avengers: Infinity War', genre: 'Action/Superhero' },
    { id: 27205, title: 'Inception', genre: 'Sci-Fi/Thriller' },
    { id: 278, title: 'The Shawshank Redemption', genre: 'Drama' },
    { id: 120, title: 'The Lord of the Rings: Fellowship', genre: 'Fantasy' },
    { id: 807, title: 'Se7en', genre: 'Thriller/Dark' },
    // ... more movies for taste profiling
  ],
  tv: [
    { id: 1399, title: 'Game of Thrones', genre: 'Fantasy/Drama' },
    { id: 1396, title: 'Breaking Bad', genre: 'Crime/Drama' },
    { id: 66732, title: 'Stranger Things', genre: 'Sci-Fi/Horror' },
    // ... more TV shows
  ],
};
```

### Key Features Already Implemented

1. **Swipe Interface**: Like Tinder, swipe right to save, left to skip
2. **Lists Management**: Watch list, Watched list, with AsyncStorage persistence
3. **Search**: Combined movie + TV search with debouncing
4. **Details Modal**: Full info, trailers (YouTube), cast, similar content
5. **Streaming Providers**: Shows where to watch (Netflix, etc.)
6. **Recommendation Flow**: 3-step wizard (Mood → Sub-mood → Duration)
7. **Onboarding**: Rate movies to build taste profile
8. **Dark/Light Theme**: Theme toggle with persistence
9. **Statistics**: View watching stats and preferences

### Files to Migrate

| WatchNext | UpNext Location | Description |
|-----------|-----------------|-------------|
| App.js (lines 24-55) | src/constants/genres.js | Genre definitions |
| App.js (lines 102-200) | src/constants/moods.js | Mood configurations |
| App.js (lines 244-262) | src/constants/options.js | Duration, commitment, language |
| App.js (lines 470-535) | src/services/tmdb.js | TMDB API service |
| App.js (screens) | src/screens/*.js | Individual screen components |
| VNIcon.js | src/components/UNIcon.js | Already migrated with new branding |

### API Key Location

Currently in `/home/user/watchnext/src/config/constants.js`:
```javascript
export const TMDB_API_KEY = 'your-api-key';
```

For UpNext, use environment variables:
```javascript
// .env (not committed)
TMDB_API_KEY=your-api-key

// Usage
import { TMDB_API_KEY } from '@env';
```

## Gmail Account

Created for Firebase/services: **upnext.app0@gmail.com**

## Next Steps

1. ✅ Project initialized with Expo
2. ✅ Brand identity implemented (colors, fonts, icons)
3. ⏳ Set up Firebase project (user needs to create in Firebase Console)
4. ⏳ Implement authentication
5. ⏳ Implement Watch category (migrate from WatchNext)
6. ⏳ Implement Listen category with Spotify
7. ⏳ Implement Read category with Google Books
8. ⏳ Implement Play category with IGDB
9. ⏳ Implement AdMob
10. ⏳ Implement RevenueCat for premium

## Important Notes

- User wants to "do things right from the start" - no shortcuts
- Professional architecture: proper folder structure, services layer, etc.
- Must be ready for App Store / Play Store submission
- Security: API keys in environment variables, proper auth flow
- The app should work offline with local data, sync when online
