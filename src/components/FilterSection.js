/**
 * [COMPONENT] FilterSection
 * Reusable filter section with chips for genre/decade selection
 */

import React, { useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme/colors';

// ============================================
// [FILTER CHIP COMPONENT]
// Individual selectable chip
// ============================================

const FilterChip = React.memo(({ 
  label, 
  isSelected, 
  onPress,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        isSelected && styles.chipSelected,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.chipText,
        isSelected && styles.chipTextSelected,
      ]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
});

FilterChip.displayName = 'FilterChip';

// ============================================
// [GENRE FILTER SECTION]
// Multi-select genre chips
// ============================================

export const GenreFilterSection = React.memo(({ 
  title = 'Genres',
  genres = [],
  selectedGenres = [],
  onGenreToggle,
}) => {
  const handleToggle = useCallback((genreId) => {
    if (onGenreToggle) {
      onGenreToggle(genreId);
    }
  }, [onGenreToggle]);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.chipsContainer}>
        {genres.map((genre) => (
          <FilterChip
            key={genre.id}
            label={genre.name}
            isSelected={selectedGenres.includes(genre.id)}
            onPress={() => handleToggle(genre.id)}
          />
        ))}
      </View>
    </View>
  );
});

GenreFilterSection.displayName = 'GenreFilterSection';

// ============================================
// [DECADE FILTER SECTION]
// Single-select decade chips
// ============================================

export const DecadeFilterSection = React.memo(({ 
  title = 'Decade',
  decades = [],
  selectedDecade = null,
  onDecadeSelect,
}) => {
  const handleSelect = useCallback((decadeId) => {
    if (onDecadeSelect) {
      // Toggle off if same decade selected
      onDecadeSelect(selectedDecade === decadeId ? null : decadeId);
    }
  }, [selectedDecade, onDecadeSelect]);

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.chipsContainer}>
        {decades.map((decade) => (
          <FilterChip
            key={decade.id}
            label={decade.label}
            isSelected={selectedDecade === decade.id}
            onPress={() => handleSelect(decade.id)}
          />
        ))}
      </View>
    </View>
  );
});

DecadeFilterSection.displayName = 'DecadeFilterSection';

// ============================================
// [TOGGLE FILTER SECTION]
// Switch toggle for boolean filters
// ============================================

export const ToggleFilterSection = React.memo(({ 
  title,
  description,
  value = false,
  onValueChange,
}) => {
  return (
    <View style={styles.toggleSection}>
      <View style={styles.toggleContent}>
        <Text style={styles.toggleTitle}>{title}</Text>
        {description && (
          <Text style={styles.toggleDescription}>{description}</Text>
        )}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ 
          false: colors.surface, 
          true: colors.primaryDark,
        }}
        thumbColor={value ? colors.primary : colors.textSecondary}
        ios_backgroundColor={colors.surface}
      />
    </View>
  );
});

ToggleFilterSection.displayName = 'ToggleFilterSection';

// ============================================
// [RESET BUTTON]
// Button to reset all filters
// ============================================

export const ResetFiltersButton = React.memo(({ 
  onPress,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[
        styles.resetButton,
        disabled && styles.resetButtonDisabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Text style={[
        styles.resetButtonText,
        disabled && styles.resetButtonTextDisabled,
      ]}>
        Reset Filters
      </Text>
    </TouchableOpacity>
  );
});

ResetFiltersButton.displayName = 'ResetFiltersButton';

// ============================================
// [STYLES]
// ============================================

const styles = StyleSheet.create({
  // Section
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },

  // Chips container
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -spacing.xs,
  },

  // Chip
  chip: {
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.round,
    margin: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  chipTextSelected: {
    color: colors.textPrimary,
    fontWeight: typography.weights.semibold,
  },

  // Toggle section
  toggleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  toggleContent: {
    flex: 1,
    marginRight: spacing.md,
  },
  toggleTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  toggleDescription: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },

  // Reset button
  resetButton: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  resetButtonDisabled: {
    opacity: 0.5,
  },
  resetButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.textSecondary,
  },
  resetButtonTextDisabled: {
    color: colors.textTertiary,
  },
});

export default {
  FilterChip,
  GenreFilterSection,
  DecadeFilterSection,
  ToggleFilterSection,
  ResetFiltersButton,
};
