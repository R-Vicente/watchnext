/**
 * [COMPONENT] LoadingState
 * Displays loading indicators and shimmer placeholders
 */

import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme/colors';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.9;
const CARD_HEIGHT = SCREEN_HEIGHT * 0.65;

// ============================================
// [SHIMMER CARD]
// Placeholder while loading movie cards
// ============================================

export const ShimmerCard = React.memo(() => {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    
    animation.start();
    return () => animation.stop();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.shimmerCard}>
      {/* Poster placeholder */}
      <Animated.View style={[styles.shimmerPoster, { opacity }]} />
      
      {/* Content placeholders */}
      <View style={styles.shimmerContent}>
        {/* Title */}
        <Animated.View style={[styles.shimmerTitle, { opacity }]} />
        
        {/* Info row */}
        <View style={styles.shimmerRow}>
          <Animated.View style={[styles.shimmerSmall, { opacity }]} />
          <Animated.View style={[styles.shimmerSmall, { opacity }]} />
        </View>
        
        {/* Description lines */}
        <Animated.View style={[styles.shimmerLine, { opacity }]} />
        <Animated.View style={[styles.shimmerLine, styles.shimmerLineShort, { opacity }]} />
      </View>
    </View>
  );
});

ShimmerCard.displayName = 'ShimmerCard';

// ============================================
// [FULL SCREEN LOADING]
// Full screen loading indicator
// ============================================

export const FullScreenLoading = React.memo(({ message = 'Loading...' }) => {
  return (
    <View style={styles.fullScreenContainer}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
});

FullScreenLoading.displayName = 'FullScreenLoading';

// ============================================
// [INLINE LOADING]
// Small loading indicator for inline use
// ============================================

export const InlineLoading = React.memo(({ size = 'small' }) => {
  return (
    <View style={styles.inlineContainer}>
      <ActivityIndicator size={size} color={colors.primary} />
    </View>
  );
});

InlineLoading.displayName = 'InlineLoading';

// ============================================
// [ERROR STATE]
// Error display with retry option
// ============================================

export const ErrorState = React.memo(({ 
  message = 'Something went wrong', 
  onRetry,
  showRetry = true,
}) => {
  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorEmoji}>😕</Text>
      <Text style={styles.errorTitle}>Oops!</Text>
      <Text style={styles.errorMessage}>{message}</Text>
      
      {showRetry && onRetry && (
        <Text style={styles.retryButton} onPress={onRetry}>
          Tap to retry
        </Text>
      )}
    </View>
  );
});

ErrorState.displayName = 'ErrorState';

// ============================================
// [EMPTY STATE]
// When no content is available
// ============================================

export const EmptyState = React.memo(({ 
  title = 'No content available',
  message = 'Try adjusting your filters',
  emoji = '🎬',
}) => {
  return (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyEmoji}>{emoji}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyMessage}>{message}</Text>
    </View>
  );
});

EmptyState.displayName = 'EmptyState';

// ============================================
// [API KEY WARNING]
// Shown when API key is not configured
// ============================================

export const ApiKeyWarning = React.memo(() => {
  return (
    <View style={styles.warningContainer}>
      <Text style={styles.warningEmoji}>⚠️</Text>
      <Text style={styles.warningTitle}>API Key Required</Text>
      <Text style={styles.warningMessage}>
        Please add your TMDB API key in{'\n'}
        <Text style={styles.codeText}>src/config/constants.js</Text>
      </Text>
      <Text style={styles.warningHint}>
        Get your free API key at{'\n'}themoviedb.org
      </Text>
    </View>
  );
});

ApiKeyWarning.displayName = 'ApiKeyWarning';

// ============================================
// [STYLES]
// ============================================

const styles = StyleSheet.create({
  // Shimmer Card
  shimmerCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: colors.cardBackground,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  shimmerPoster: {
    width: '100%',
    height: '70%',
    backgroundColor: colors.shimmer,
  },
  shimmerContent: {
    padding: spacing.md,
  },
  shimmerTitle: {
    height: 24,
    width: '70%',
    backgroundColor: colors.shimmer,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.sm,
  },
  shimmerRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  shimmerSmall: {
    height: 16,
    width: 60,
    backgroundColor: colors.shimmer,
    borderRadius: borderRadius.sm,
    marginRight: spacing.sm,
  },
  shimmerLine: {
    height: 14,
    width: '100%',
    backgroundColor: colors.shimmer,
    borderRadius: borderRadius.sm,
    marginBottom: spacing.xs,
  },
  shimmerLineShort: {
    width: '60%',
  },

  // Full Screen Loading
  fullScreenContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },

  // Inline Loading
  inlineContainer: {
    padding: spacing.md,
    alignItems: 'center',
  },

  // Error State
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  errorEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  errorTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
  },
  retryButton: {
    fontSize: typography.sizes.md,
    color: colors.primary,
    fontWeight: typography.weights.semibold,
    padding: spacing.md,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: spacing.md,
  },
  emptyTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Warning State
  warningContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  warningEmoji: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  warningTitle: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.warning,
    marginBottom: spacing.sm,
  },
  warningMessage: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 22,
  },
  warningHint: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
    textAlign: 'center',
    lineHeight: 20,
  },
  codeText: {
    fontFamily: 'monospace',
    color: colors.secondary,
  },
});

export default {
  ShimmerCard,
  FullScreenLoading,
  InlineLoading,
  ErrorState,
  EmptyState,
  ApiKeyWarning,
};
