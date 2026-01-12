/**
 * [COMPONENT] SwipeCard
 * Individual movie/TV show card with poster, title, rating, and overview
 */

import React, { useMemo } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  Dimensions,
} from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/colors';
import { 
  getPosterUrl, 
  getPlaceholderPoster, 
  getYear, 
  formatRating, 
  getRatingColor,
  truncateText,
} from '../utils/helpers';
import { CONTENT_TYPES } from '../config/constants';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Card dimensions - 70% of screen as specified
export const CARD_WIDTH = SCREEN_WIDTH * 0.9;
export const CARD_HEIGHT = SCREEN_HEIGHT * 0.65;

// ============================================
// [RATING BADGE COMPONENT]
// ============================================

const RatingBadge = React.memo(({ rating }) => {
  const ratingColor = getRatingColor(rating);
  const formattedRating = formatRating(rating);

  return (
    <View style={[styles.ratingBadge, { backgroundColor: ratingColor }]}>
      <Text style={styles.ratingText}>★ {formattedRating}</Text>
    </View>
  );
});

RatingBadge.displayName = 'RatingBadge';

// ============================================
// [MEDIA TYPE BADGE]
// ============================================

const MediaTypeBadge = React.memo(({ mediaType }) => {
  const isMovie = mediaType === CONTENT_TYPES.MOVIE;
  
  return (
    <View style={styles.mediaTypeBadge}>
      <Text style={styles.mediaTypeText}>
        {isMovie ? '🎬 Movie' : '📺 TV Show'}
      </Text>
    </View>
  );
});

MediaTypeBadge.displayName = 'MediaTypeBadge';

// ============================================
// [MAIN SWIPE CARD COMPONENT]
// ============================================

const SwipeCard = React.memo(({ item, style }) => {
  // Memoize computed values
  const posterUrl = useMemo(() => {
    return getPosterUrl(item.posterPath, 'large') || getPlaceholderPoster();
  }, [item.posterPath]);

  const year = useMemo(() => {
    return getYear(item.releaseDate || item.firstAirDate);
  }, [item.releaseDate, item.firstAirDate]);

  const overview = useMemo(() => {
    return truncateText(item.overview, 120);
  }, [item.overview]);

  return (
    <View style={[styles.card, style]}>
      {/* Poster Image */}
      <View style={styles.posterContainer}>
        <Image
          source={{ uri: posterUrl }}
          style={styles.poster}
          resizeMode="cover"
        />
        
        {/* Gradient overlay for text readability */}
        <View style={styles.gradientOverlay} />
        
        {/* Rating badge - top right */}
        <View style={styles.ratingContainer}>
          <RatingBadge rating={item.rating} />
        </View>
        
        {/* Media type badge - top left */}
        <View style={styles.mediaTypeContainer}>
          <MediaTypeBadge mediaType={item.mediaType} />
        </View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>

        {/* Year */}
        <Text style={styles.year}>{year}</Text>

        {/* Overview */}
        <Text style={styles.overview} numberOfLines={3}>
          {overview}
        </Text>
      </View>

      {/* Swipe hint indicators */}
      <View style={styles.swipeHints}>
        <Text style={styles.swipeHintLeft}>← SKIP</Text>
        <Text style={styles.swipeHintRight}>WATCH →</Text>
      </View>
    </View>
  );
});

SwipeCard.displayName = 'SwipeCard';

// ============================================
// [STYLES]
// ============================================

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.large,
  },
  
  // Poster
  posterContainer: {
    width: '100%',
    height: '68%',
    position: 'relative',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
    backgroundColor: 'transparent',
    // Simulated gradient with overlay
    borderBottomWidth: 80,
    borderBottomColor: 'rgba(26, 26, 26, 0.9)',
  },

  // Rating badge
  ratingContainer: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
  },
  ratingBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  ratingText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.bold,
  },

  // Media type badge
  mediaTypeContainer: {
    position: 'absolute',
    top: spacing.md,
    left: spacing.md,
  },
  mediaTypeBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.md,
  },
  mediaTypeText: {
    color: colors.textPrimary,
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.medium,
  },

  // Content
  content: {
    padding: spacing.md,
    flex: 1,
  },
  title: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  year: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  overview: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },

  // Swipe hints
  swipeHints: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  swipeHintLeft: {
    fontSize: typography.sizes.xs,
    color: colors.swipeLeft,
    fontWeight: typography.weights.semibold,
    opacity: 0.6,
  },
  swipeHintRight: {
    fontSize: typography.sizes.xs,
    color: colors.swipeRight,
    fontWeight: typography.weights.semibold,
    opacity: 0.6,
  },
});

export default SwipeCard;

