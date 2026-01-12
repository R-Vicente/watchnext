/**
 * [SCREEN] WatchlistScreen
 * Displays the user's saved movies and TV shows
 */

import React, { useCallback, useMemo, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList,
  TouchableOpacity,
  Alert,
  Share,
  SafeAreaView,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { colors, spacing, typography, borderRadius } from '../theme/colors';
import { CONTENT_TYPES } from '../config/constants';
import { generateWatchlistText } from '../utils/helpers';

// Components
import WatchlistItem from '../components/WatchlistItem';
import { EmptyState } from '../components/LoadingState';

// ============================================
// [FILTER TABS COMPONENT]
// All / Movies / TV Shows
// ============================================

const FilterTabs = React.memo(({ activeFilter, onFilterChange, counts }) => {
  const tabs = [
    { id: 'all', label: `All (${counts.total})` },
    { id: CONTENT_TYPES.MOVIE, label: `Movies (${counts.movies})` },
    { id: CONTENT_TYPES.TV, label: `TV (${counts.tv})` },
  ];

  return (
    <View style={styles.filterTabs}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.id}
          style={[
            styles.filterTab,
            activeFilter === tab.id && styles.filterTabActive,
          ]}
          onPress={() => onFilterChange(tab.id)}
          activeOpacity={0.7}
        >
          <Text style={[
            styles.filterTabText,
            activeFilter === tab.id && styles.filterTabTextActive,
          ]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
});

FilterTabs.displayName = 'FilterTabs';

// ============================================
// [ACTION BUTTONS COMPONENT]
// Export and Clear buttons
// ============================================

const ActionButtons = React.memo(({ 
  onExport, 
  onClear, 
  isEmpty,
}) => {
  return (
    <View style={styles.actionButtons}>
      <TouchableOpacity
        style={[styles.actionButton, isEmpty && styles.actionButtonDisabled]}
        onPress={onExport}
        disabled={isEmpty}
        activeOpacity={0.7}
      >
        <Text style={styles.actionButtonText}>📤 Export</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.actionButton, 
          styles.clearButton,
          isEmpty && styles.actionButtonDisabled,
        ]}
        onPress={onClear}
        disabled={isEmpty}
        activeOpacity={0.7}
      >
        <Text style={[styles.actionButtonText, styles.clearButtonText]}>
          🗑️ Clear All
        </Text>
      </TouchableOpacity>
    </View>
  );
});

ActionButtons.displayName = 'ActionButtons';

// ============================================
// [MAIN WATCHLIST SCREEN]
// ============================================

const WatchlistScreen = ({ navigation }) => {
  // Local state for filter
  const [activeFilter, setActiveFilter] = useState('all');

  // Get state and actions from context
  const {
    watchlist,
    watchlistCounts,
    handleRemoveFromWatchlist,
    handleClearWatchlist,
  } = useApp();

  // Filter watchlist based on active filter
  const filteredWatchlist = useMemo(() => {
    if (activeFilter === 'all') {
      return watchlist;
    }
    return watchlist.filter(item => item.mediaType === activeFilter);
  }, [watchlist, activeFilter]);

  // Handle export
  const handleExport = useCallback(async () => {
    try {
      const text = generateWatchlistText(watchlist);
      
      await Share.share({
        message: text,
        title: 'My Swipe Watch List',
      });
    } catch (error) {
      console.error('[WatchlistScreen] Export error:', error.message);
      Alert.alert('Export Failed', 'Could not export your watchlist.');
    }
  }, [watchlist]);

  // Handle clear all with confirmation
  const handleClearAll = useCallback(() => {
    Alert.alert(
      'Clear Watchlist',
      'Are you sure you want to remove all items from your watchlist? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: handleClearWatchlist,
        },
      ]
    );
  }, [handleClearWatchlist]);

  // Handle remove item with confirmation
  const handleRemoveItem = useCallback((id, mediaType) => {
    Alert.alert(
      'Remove Item',
      'Remove this from your watchlist?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => handleRemoveFromWatchlist(id, mediaType),
        },
      ]
    );
  }, [handleRemoveFromWatchlist]);

  // Render item
  const renderItem = useCallback(({ item }) => (
    <WatchlistItem
      item={item}
      onRemove={handleRemoveItem}
    />
  ), [handleRemoveItem]);

  // Key extractor
  const keyExtractor = useCallback((item) => (
    `${item.id}-${item.mediaType}`
  ), []);

  // Empty component
  const ListEmptyComponent = useMemo(() => (
    <EmptyState
      title="Your watchlist is empty"
      message="Start swiping to add movies and TV shows!"
      emoji="📝"
    />
  ), []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Watchlist</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Filter tabs */}
      <FilterTabs
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        counts={watchlistCounts}
      />

      {/* Watchlist */}
      <FlatList
        data={filteredWatchlist}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={[
          styles.listContent,
          filteredWatchlist.length === 0 && styles.listEmpty,
        ]}
        ListEmptyComponent={ListEmptyComponent}
        showsVerticalScrollIndicator={false}
      />

      {/* Action buttons */}
      <ActionButtons
        onExport={handleExport}
        onClear={handleClearAll}
        isEmpty={watchlist.length === 0}
      />
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
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: colors.textPrimary,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  headerSpacer: {
    width: 40,
  },

  // Filter tabs
  filterTabs: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  filterTab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    backgroundColor: colors.surface,
  },
  filterTabActive: {
    backgroundColor: colors.primary,
  },
  filterTabText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  filterTabTextActive: {
    color: colors.textPrimary,
    fontWeight: typography.weights.semibold,
  },

  // List
  listContent: {
    paddingVertical: spacing.sm,
  },
  listEmpty: {
    flex: 1,
  },

  // Action buttons
  actionButtons: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  actionButton: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    fontWeight: typography.weights.medium,
  },
  clearButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.error,
  },
  clearButtonText: {
    color: colors.error,
  },
});

export default WatchlistScreen;
