/**
 * [SCREEN] HomeScreen
 * Main screen with swipeable movie/TV show cards
 */

import React, { useCallback, useMemo } from 'react';
import { 
  View, 
  StyleSheet, 
  TouchableOpacity,
  Text,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { colors, spacing, typography, borderRadius } from '../theme/colors';
import { CONTENT_TYPES, TMDB_API_KEY } from '../config/constants';
import { isApiKeyConfigured } from '../utils/helpers';

// Components
import TabSelector from '../components/TabSelector';
import CardStack from '../components/CardStack';
import SwipeCounter from '../components/SwipeCounter';
import AdBanner from '../components/AdBanner';
import { 
  ShimmerCard, 
  ErrorState, 
  EmptyState,
  ApiKeyWarning,
} from '../components/LoadingState';

// ============================================
// [UNDO BUTTON COMPONENT]
// ============================================

const UndoButton = React.memo(({ onPress, disabled }) => {
  return (
    <TouchableOpacity
      style={[styles.undoButton, disabled && styles.undoButtonDisabled]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={styles.undoIcon}>↩</Text>
      <Text style={[styles.undoText, disabled && styles.undoTextDisabled]}>
        Undo
      </Text>
    </TouchableOpacity>
  );
});

UndoButton.displayName = 'UndoButton';

// ============================================
// [ACTION BUTTONS COMPONENT]
// Swipe left/right buttons for accessibility
// ============================================

const ActionButtons = React.memo(({ onSwipeLeft, onSwipeRight, disabled }) => {
  return (
    <View style={styles.actionButtons}>
      {/* Skip button */}
      <TouchableOpacity
        style={[styles.actionButton, styles.skipButton]}
        onPress={onSwipeLeft}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={styles.actionIcon}>✕</Text>
      </TouchableOpacity>

      {/* Watch button */}
      <TouchableOpacity
        style={[styles.actionButton, styles.watchButton]}
        onPress={onSwipeRight}
        disabled={disabled}
        activeOpacity={0.7}
      >
        <Text style={styles.actionIcon}>♥</Text>
      </TouchableOpacity>
    </View>
  );
});

ActionButtons.displayName = 'ActionButtons';

// ============================================
// [MAIN HOME SCREEN]
// ============================================

const HomeScreen = ({ navigation }) => {
  // Get state and actions from context
  const {
    contentType,
    setContentType,
    cards,
    currentCard,
    isLoading,
    error,
    canUndo,
    dailySwipeCount,
    handleSwipeLeft,
    handleSwipeRight,
    handleUndo,
    refresh,
  } = useApp();

  // Check if API key is configured
  const apiKeyConfigured = useMemo(() => {
    return isApiKeyConfigured(TMDB_API_KEY);
  }, []);

  // Handle tab change
  const handleTabChange = useCallback((tab) => {
    setContentType(tab);
  }, [setContentType]);

  // Handle manual button swipes
  const handleButtonSwipeLeft = useCallback(() => {
    if (currentCard) {
      handleSwipeLeft(currentCard);
    }
  }, [currentCard, handleSwipeLeft]);

  const handleButtonSwipeRight = useCallback(() => {
    if (currentCard) {
      handleSwipeRight(currentCard);
    }
  }, [currentCard, handleSwipeRight]);

  // Open drawer menu
  const openMenu = useCallback(() => {
    navigation.openDrawer();
  }, [navigation]);

  // Render content based on state
  const renderContent = () => {
    // Check API key first
    if (!apiKeyConfigured) {
      return <ApiKeyWarning />;
    }

    // Loading state
    if (isLoading && cards.length === 0) {
      return (
        <View style={styles.cardArea}>
          <ShimmerCard />
        </View>
      );
    }

    // Error state
    if (error && cards.length === 0) {
      return (
        <ErrorState 
          message={error} 
          onRetry={refresh}
        />
      );
    }

    // Empty state (no more cards)
    if (cards.length === 0) {
      return (
        <EmptyState
          title="No more content!"
          message="Try adjusting your filters or check back later"
          emoji={contentType === CONTENT_TYPES.MOVIE ? '🎬' : '📺'}
        />
      );
    }

    // Card stack
    return (
      <View style={styles.cardArea}>
        <CardStack
          cards={cards}
          onSwipeLeft={handleSwipeLeft}
          onSwipeRight={handleSwipeRight}
        />
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.background} />
      
      {/* Header with menu button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={openMenu}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Swipe Watch</Text>
        
        <UndoButton onPress={handleUndo} disabled={!canUndo} />
      </View>

      {/* Tab selector */}
      <TabSelector
        activeTab={contentType}
        onTabChange={handleTabChange}
        disabled={isLoading}
      />

      {/* Daily swipe counter */}
      <SwipeCounter count={dailySwipeCount} />

      {/* Main content area */}
      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* Action buttons (for accessibility) */}
      {cards.length > 0 && (
        <ActionButtons
          onSwipeLeft={handleButtonSwipeLeft}
          onSwipeRight={handleButtonSwipeRight}
          disabled={isLoading || cards.length === 0}
        />
      )}

      {/* Ad banner */}
      <AdBanner />
    </SafeAreaView>
  );
};

// ============================================
// [STYLES]
// ============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuIcon: {
    fontSize: 24,
    color: colors.textPrimary,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },

  // Undo button
  undoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  undoButtonDisabled: {
    opacity: 0.4,
  },
  undoIcon: {
    fontSize: 18,
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  undoText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  undoTextDisabled: {
    color: colors.textTertiary,
  },

  // Content
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardArea: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Action buttons
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.xl,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  skipButton: {
    borderColor: colors.swipeLeft,
    backgroundColor: 'transparent',
  },
  watchButton: {
    borderColor: colors.swipeRight,
    backgroundColor: colors.swipeRight,
  },
  actionIcon: {
    fontSize: 24,
    color: colors.textPrimary,
  },
});

export default HomeScreen;
