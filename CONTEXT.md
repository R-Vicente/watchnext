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

## Previous Work (WatchNext)

The original WatchNext app (movies/TV only) is in `/home/user/watchnext/`. It has:
- Working TMDB integration
- Mood-based recommendation flow
- Custom VNIcon component (predecessor to UNIcon)
- Can be used as reference for the Watch category

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
