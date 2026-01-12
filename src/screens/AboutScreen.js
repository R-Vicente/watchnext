/**
 * [SCREEN] AboutScreen
 * Information about the app
 */

import React, { useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Linking,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { colors, spacing, typography, borderRadius } from '../theme/colors';
import { clearAllData, getStorageStats } from '../utils/storage';

// ============================================
// [INFO SECTION COMPONENT]
// ============================================

const InfoSection = React.memo(({ title, children }) => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>{title}</Text>
    {children}
  </View>
));

InfoSection.displayName = 'InfoSection';

// ============================================
// [LINK BUTTON COMPONENT]
// ============================================

const LinkButton = React.memo(({ title, url }) => {
  const handlePress = useCallback(async () => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('[AboutScreen] Link error:', error.message);
    }
  }, [url]);

  return (
    <TouchableOpacity 
      style={styles.linkButton}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <Text style={styles.linkButtonText}>{title}</Text>
      <Text style={styles.linkIcon}>→</Text>
    </TouchableOpacity>
  );
});

LinkButton.displayName = 'LinkButton';

// ============================================
// [MAIN ABOUT SCREEN]
// ============================================

const AboutScreen = ({ navigation }) => {
  const { clearHistory } = useApp();

  // Handle clear history
  const handleClearHistory = useCallback(() => {
    Alert.alert(
      'Clear Swipe History',
      'This will reset your swipe history, allowing you to see previously swiped movies/shows again. Your watchlist will NOT be affected.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear History', 
          style: 'destructive',
          onPress: async () => {
            const success = await clearHistory();
            if (success) {
              Alert.alert('Done', 'Your swipe history has been cleared.');
            }
          },
        },
      ]
    );
  }, [clearHistory]);

  // Handle reset all data
  const handleResetAll = useCallback(() => {
    Alert.alert(
      'Reset All Data',
      'This will delete ALL app data including your watchlist, filters, and history. This cannot be undone!',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Reset Everything', 
          style: 'destructive',
          onPress: async () => {
            await clearAllData();
            Alert.alert('Done', 'All data has been reset. Please restart the app.');
          },
        },
      ]
    );
  }, []);

  // Show storage stats (debug)
  const handleShowStats = useCallback(async () => {
    const stats = await getStorageStats();
    Alert.alert(
      'Storage Stats',
      `Watchlist: ${stats.watchlistCount} items\n` +
      `Swiped Movies: ${stats.swipedMoviesCount}\n` +
      `Swiped TV Shows: ${stats.swipedTvCount}\n` +
      `Today's Swipes: ${stats.dailySwipeCount}`
    );
  }, []);

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
        <Text style={styles.headerTitle}>About</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* App info */}
        <View style={styles.appInfo}>
          <Text style={styles.appName}>🎬 Swipe Watch</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appDescription}>
            Discover your next favorite movie or TV show with a simple swipe!
          </Text>
        </View>

        {/* How it works */}
        <InfoSection title="How It Works">
          <View style={styles.infoContent}>
            <Text style={styles.infoText}>
              👉 <Text style={styles.bold}>Swipe Right</Text> - Add to your watchlist
            </Text>
            <Text style={styles.infoText}>
              👈 <Text style={styles.bold}>Swipe Left</Text> - Skip this title
            </Text>
            <Text style={styles.infoText}>
              ↩️ <Text style={styles.bold}>Undo</Text> - Changed your mind? Undo the last swipe
            </Text>
          </View>
        </InfoSection>

        {/* Data & Privacy */}
        <InfoSection title="Data & Privacy">
          <View style={styles.infoContent}>
            <Text style={styles.infoText}>
              ✅ All data is stored locally on your device
            </Text>
            <Text style={styles.infoText}>
              ✅ No account required
            </Text>
            <Text style={styles.infoText}>
              ✅ Your watchlist syncs nowhere - it's yours alone
            </Text>
          </View>
        </InfoSection>

        {/* Credits */}
        <InfoSection title="Credits">
          <View style={styles.infoContent}>
            <Text style={styles.infoText}>
              Movie and TV show data provided by:
            </Text>
            <LinkButton 
              title="The Movie Database (TMDB)"
              url="https://www.themoviedb.org"
            />
            <Text style={styles.disclaimer}>
              This product uses the TMDB API but is not endorsed or certified by TMDB.
            </Text>
          </View>
        </InfoSection>

        {/* Data Management */}
        <InfoSection title="Data Management">
          <TouchableOpacity 
            style={styles.dangerButton}
            onPress={handleClearHistory}
            activeOpacity={0.7}
          >
            <Text style={styles.dangerButtonText}>
              Clear Swipe History
            </Text>
            <Text style={styles.dangerButtonHint}>
              See previously swiped titles again
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.dangerButton, styles.dangerButtonRed]}
            onPress={handleResetAll}
            activeOpacity={0.7}
          >
            <Text style={styles.dangerButtonText}>
              Reset All Data
            </Text>
            <Text style={styles.dangerButtonHint}>
              Delete everything and start fresh
            </Text>
          </TouchableOpacity>
        </InfoSection>

        {/* Debug (can be removed in production) */}
        {__DEV__ && (
          <InfoSection title="Debug">
            <TouchableOpacity 
              style={styles.debugButton}
              onPress={handleShowStats}
              activeOpacity={0.7}
            >
              <Text style={styles.debugButtonText}>Show Storage Stats</Text>
            </TouchableOpacity>
          </InfoSection>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Made with ❤️ for movie lovers
          </Text>
        </View>
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

  // Scroll
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.md,
  },

  // App info
  appInfo: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  appName: {
    fontSize: typography.sizes.hero,
    fontWeight: typography.weights.bold,
    color: colors.textPrimary,
  },
  appVersion: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },
  appDescription: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },

  // Sections
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
    marginBottom: spacing.md,
  },
  infoContent: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  infoText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
    lineHeight: 22,
  },
  bold: {
    fontWeight: typography.weights.semibold,
    color: colors.textPrimary,
  },
  disclaimer: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },

  // Link button
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.sm,
  },
  linkButtonText: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    fontWeight: typography.weights.medium,
  },
  linkIcon: {
    fontSize: typography.sizes.lg,
    color: colors.textPrimary,
  },

  // Danger buttons
  dangerButton: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  dangerButtonRed: {
    borderColor: colors.error,
  },
  dangerButtonText: {
    fontSize: typography.sizes.md,
    color: colors.textPrimary,
    fontWeight: typography.weights.medium,
  },
  dangerButtonHint: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
    marginTop: spacing.xs,
  },

  // Debug
  debugButton: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  debugButtonText: {
    fontSize: typography.sizes.md,
    color: colors.textSecondary,
  },

  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  footerText: {
    fontSize: typography.sizes.sm,
    color: colors.textTertiary,
  },
});

export default AboutScreen;
