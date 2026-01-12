/**
 * [COMPONENT] WatchlistItem
 * Individual item in the watchlist screen
 */

import React, { useMemo, useCallback } from 'react';
import { 
  View, 
  Text, 
  Image, 
  StyleSheet, 
  TouchableOpacity,
} from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '../theme/colors';
import { 
  getPosterUrl, 
  getPlaceholderPoster, 
  getYear,
  formatRating,
  getRatingColor,
} from '../utils/helpers';
import { CONTENT_TYPES } from '../config/constants';

// ============================================
// [WATCHLIST ITEM COMPONENT]
// ============================================

const WatchlistItem = React.memo(({ 
  item, 
  onRemove,
  onPress,
}) => {
  // Memoize computed values
  const posterUrl = useMemo(() => {
    return getPosterUrl(item.posterPath, 'small') || getPlaceholderPoster();
  }, [item.posterPath]);

  const year = useMemo(() => {
    return getYear(item.releaseDate || item.firstAirDate);
  }, [item.releaseDate, item.firstAirDate]);

  const ratingColor = useMemo(() => {
    return getRatingColor(item.rating);
  }, [item.rating]);

  const formattedRating = useMemo(() => {
    return formatRating(item.rating);
  }, [item.rating]);

  const isMovie = item.mediaType === CONTENT_TYPES.MOVIE;

  // Handle remove button press
  const handleRemove = useCallback(() => {
    if (onRemove) {
      onRemove(item.id, item.mediaType);
    }
  }, [item.id, item.mediaType, onRemove]);

  return (
    <TouchableOpacity 
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {/* Poster thumbnail */}
      <Image
        source={{ uri: posterUrl }}
        style={styles.poster}
        resizeMode="cover"
      />

      {/* Content */}
      <View style={styles.content}>
        {/* Title */}
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>

        {/* Info row */}
        <View style={styles.infoRow}>
          {/* Year */}
          <Text style={styles.year}>{year}</Text>
          
          {/* Media type */}
          <Text style={styles.mediaType}>
            {isMovie ? '🎬' : '📺'}
          </Text>
          
          {/* Rating */}
          <Text style={[styles.rating, { color: ratingColor }]}>
            ★ {formattedRating}
          </Text>
        </View>
      </View>

      {/* Remove button */}
      <TouchableOpacity 
        style={styles.removeButton}
        onPress={handleRemove}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Text style={styles.removeIcon}>✕</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
});

WatchlistItem.displayName = 'WatchlistItem';

// ============================================
// [STYLES]
// ============================================

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.md,
    marginHorizontal: spacing.md,
    marginVertical: spacing.xs,
    padding: spacing.sm,
    alignItems: 'center',
    ...shadows.small,
  },
  poster: {
    width: 60,
    height: 90,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.shimmer,
  },
  content: {
    flex: 1,
    marginLeft: spacing.md,
    justifyContent: 'center',
  },
  title: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  year: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  mediaType: {
    fontSize: typography.sizes.sm,
    marginRight: spacing.sm,
  },
  rating: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: borderRadius.round,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: spacing.sm,
  },
  removeIcon: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },
});

export default WatchlistItem;
