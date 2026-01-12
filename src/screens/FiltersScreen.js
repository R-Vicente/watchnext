/**
 * [SCREEN] FiltersScreen
 * Configure filters for movie/TV show discovery
 */

import React, { useCallback, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { colors, spacing, typography } from '../theme/colors';
import { 
  MOVIE_GENRES, 
  TV_GENRES, 
  DECADES,
  CONTENT_TYPES,
  APP_CONFIG,
} from '../config/constants';

// Components
import {
  GenreFilterSection,
  DecadeFilterSection,
  ToggleFilterSection,
  ResetFiltersButton,
} from '../components/FilterSection';

// ============================================
// [MAIN FILTERS SCREEN]
// ============================================

const FiltersScreen = ({ navigation }) => {
  // Get state and actions from context
  const {
    contentType,
    filters,
    updateFilters,
    resetFilters,
    hasActiveFilters,
  } = useApp();

  // Get appropriate genres based on content type
  const genres = useMemo(() => {
    return contentType === CONTENT_TYPES.MOVIE ? MOVIE_GENRES : TV_GENRES;
  }, [contentType]);

  // Handle genre toggle
  const handleGenreToggle = useCallback((genreId) => {
    const currentGenres = filters.genres;
    let newGenres;

    if (currentGenres.includes(genreId)) {
      // Remove genre
      newGenres = currentGenres.filter(id => id !== genreId);
    } else {
      // Add genre
      newGenres = [...currentGenres, genreId];
    }

    updateFilters({
      ...filters,
      genres: newGenres,
    });
  }, [filters, updateFilters]);

  // Handle decade selection
  const handleDecadeSelect = useCallback((decadeId) => {
    updateFilters({
      ...filters,
      decade: decadeId,
    });
  }, [filters, updateFilters]);

  // Handle high rated toggle
  const handleHighRatedToggle = useCallback((value) => {
    updateFilters({
      ...filters,
      highRatedOnly: value,
    });
  }, [filters, updateFilters]);

  // Handle reset
  const handleReset = useCallback(() => {
    resetFilters();
  }, [resetFilters]);

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
        <Text style={styles.headerTitle}>Filters</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Content type indicator */}
      <View style={styles.contentTypeIndicator}>
        <Text style={styles.contentTypeText}>
          Filtering: {contentType === CONTENT_TYPES.MOVIE ? '🎬 Movies' : '📺 TV Shows'}
        </Text>
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* High Rated Only Toggle */}
        <ToggleFilterSection
          title="High Rated Only"
          description={`Only show titles rated ${APP_CONFIG.highRatingThreshold}+ stars`}
          value={filters.highRatedOnly}
          onValueChange={handleHighRatedToggle}
        />

        {/* Decade Filter */}
        <DecadeFilterSection
          title="Release Decade"
          decades={DECADES}
          selectedDecade={filters.decade}
          onDecadeSelect={handleDecadeSelect}
        />

        {/* Genre Filter */}
        <GenreFilterSection
          title="Genres"
          genres={genres}
          selectedGenres={filters.genres}
          onGenreToggle={handleGenreToggle}
        />

        {/* Reset Button */}
        <ResetFiltersButton
          onPress={handleReset}
          disabled={!hasActiveFilters}
        />

        {/* Active filters summary */}
        {hasActiveFilters && (
          <View style={styles.summaryContainer}>
            <Text style={styles.summaryTitle}>Active Filters:</Text>
            
            {filters.highRatedOnly && (
              <Text style={styles.summaryItem}>
                • High rated only (≥{APP_CONFIG.highRatingThreshold})
              </Text>
            )}
            
            {filters.decade && (
              <Text style={styles.summaryItem}>
                • Decade: {DECADES.find(d => d.id === filters.decade)?.label}
              </Text>
            )}
            
            {filters.genres.length > 0 && (
              <Text style={styles.summaryItem}>
                • {filters.genres.length} genre{filters.genres.length > 1 ? 's' : ''} selected
              </Text>
            )}
          </View>
        )}
      </ScrollView>
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

  // Content type indicator
  contentTypeIndicator: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  contentTypeText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },

  // Scroll content
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },

  // Summary
  summaryContainer: {
    marginTop: spacing.lg,
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: spacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  summaryTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.sm,
  },
  summaryItem: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
});

export default FiltersScreen;
