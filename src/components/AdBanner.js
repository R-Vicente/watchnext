/**
 * [COMPONENT] AdBanner
 * Google AdMob banner advertisement
 * 
 * IMPORTANT: This component uses react-native-google-mobile-ads
 * which requires a development build (won't work in Expo Go)
 * 
 * For testing in Expo Go, a placeholder banner is shown instead
 */

import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../theme/colors';
import { getAdUnitId, ADMOB_CONFIG } from '../config/constants';

// ============================================
// [CONDITIONAL ADMOB IMPORT]
// Only import AdMob in native builds
// ============================================

let BannerAd, BannerAdSize, TestIds;
let isAdMobAvailable = false;

try {
  // This will fail in Expo Go but work in development builds
  const MobileAds = require('react-native-google-mobile-ads');
  BannerAd = MobileAds.BannerAd;
  BannerAdSize = MobileAds.BannerAdSize;
  TestIds = MobileAds.TestIds;
  isAdMobAvailable = true;
} catch (error) {
  // AdMob not available (running in Expo Go)
  console.log('[AdBanner] AdMob not available, using placeholder');
}

// ============================================
// [PLACEHOLDER BANNER]
// Shown when AdMob is not available (Expo Go)
// ============================================

const PlaceholderBanner = React.memo(() => {
  return (
    <View style={styles.placeholderContainer}>
      <Text style={styles.placeholderText}>
        📢 Ad Space
      </Text>
      <Text style={styles.placeholderSubtext}>
        AdMob banner appears here in production
      </Text>
    </View>
  );
});

PlaceholderBanner.displayName = 'PlaceholderBanner';

// ============================================
// [REAL ADMOB BANNER]
// Actual AdMob banner component
// ============================================

const RealAdBanner = React.memo(() => {
  const [adError, setAdError] = useState(false);
  const [adLoaded, setAdLoaded] = useState(false);

  // Get the appropriate ad unit ID
  // In test mode, use Google's test ad unit ID
  // In production, use your real ad unit ID
  const adUnitId = ADMOB_CONFIG.useTestAds 
    ? (TestIds?.BANNER || getAdUnitId())
    : getAdUnitId();

  // If ad failed to load, show placeholder
  if (adError) {
    return <PlaceholderBanner />;
  }

  return (
    <View style={styles.adContainer}>
      {/* 
        PRODUCTION SETUP:
        1. Create an AdMob account at admob.google.com
        2. Add your app and create a Banner ad unit
        3. Replace the test ad unit ID in constants.js with your real ID
        4. Set ADMOB_CONFIG.useTestAds = false
        
        WARNING: Never use test ads in production builds!
        WARNING: Never click your own ads in production!
      */}
      <BannerAd
        unitId={adUnitId}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => {
          console.log('[AdBanner] Ad loaded successfully');
          setAdLoaded(true);
        }}
        onAdFailedToLoad={(error) => {
          console.error('[AdBanner] Ad failed to load:', error);
          setAdError(true);
        }}
        onAdOpened={() => {
          console.log('[AdBanner] Ad opened');
        }}
        onAdClosed={() => {
          console.log('[AdBanner] Ad closed');
        }}
      />
    </View>
  );
});

RealAdBanner.displayName = 'RealAdBanner';

// ============================================
// [MAIN COMPONENT]
// Automatically chooses between real and placeholder
// ============================================

const AdBanner = React.memo(() => {
  // Use placeholder if AdMob is not available (Expo Go)
  if (!isAdMobAvailable) {
    return <PlaceholderBanner />;
  }

  // Use real AdMob banner in native builds
  return <RealAdBanner />;
});

AdBanner.displayName = 'AdBanner';

// ============================================
// [STYLES]
// ============================================

const styles = StyleSheet.create({
  adContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    minHeight: 60,
  },
  placeholderContainer: {
    width: '100%',
    height: 60,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  placeholderText: {
    fontSize: typography.sizes.sm,
    color: colors.textSecondary,
    fontWeight: typography.weights.medium,
  },
  placeholderSubtext: {
    fontSize: typography.sizes.xs,
    color: colors.textTertiary,
    marginTop: 2,
  },
});

export default AdBanner;
