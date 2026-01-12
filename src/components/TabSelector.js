/**
 * [COMPONENT] TabSelector
 * Toggle between Movies and TV Shows
 */

import React, { useCallback } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet,
  Animated,
} from 'react-native';
import { colors, spacing, typography, borderRadius } from '../theme/colors';
import { CONTENT_TYPES } from '../config/constants';

// ============================================
// [TAB SELECTOR COMPONENT]
// ============================================

const TabSelector = React.memo(({ 
  activeTab, 
  onTabChange,
  disabled = false,
}) => {
  // Handle tab press
  const handlePress = useCallback((tab) => {
    if (!disabled && tab !== activeTab) {
      onTabChange(tab);
    }
  }, [activeTab, onTabChange, disabled]);

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        {/* Movies Tab */}
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === CONTENT_TYPES.MOVIE && styles.tabActive,
          ]}
          onPress={() => handlePress(CONTENT_TYPES.MOVIE)}
          activeOpacity={0.7}
          disabled={disabled}
        >
          <Text style={[
            styles.tabText,
            activeTab === CONTENT_TYPES.MOVIE && styles.tabTextActive,
          ]}>
            🎬 Movies
          </Text>
        </TouchableOpacity>

        {/* TV Shows Tab */}
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === CONTENT_TYPES.TV && styles.tabActive,
          ]}
          onPress={() => handlePress(CONTENT_TYPES.TV)}
          activeOpacity={0.7}
          disabled={disabled}
        >
          <Text style={[
            styles.tabText,
            activeTab === CONTENT_TYPES.TV && styles.tabTextActive,
          ]}>
            📺 TV Shows
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

TabSelector.displayName = 'TabSelector';

// ============================================
// [STYLES]
// ============================================

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.textPrimary,
    fontWeight: typography.weights.semibold,
  },
});

export default TabSelector;
