/**
 * [COMPONENT] SwipeCounter
 * Displays the number of swipes made today
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme/colors';

// ============================================
// [SWIPE COUNTER COMPONENT]
// ============================================

const SwipeCounter = React.memo(({ count }) => {
  // Don't show if count is 0
  if (count === 0) return null;

  // Pluralize correctly
  const itemText = count === 1 ? 'movie' : 'movies';

  return (
    <View style={styles.container}>
      <Text style={styles.text}>
        {count} {itemText} swiped today
      </Text>
    </View>
  );
});

SwipeCounter.displayName = 'SwipeCounter';

// ============================================
// [STYLES]
// ============================================

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  text: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    fontWeight: typography.weights.medium,
  },
});

export default SwipeCounter;
