/**
 * [COMPONENT] CardStack - Simplified version without Reanimated
 */

import React, { useCallback, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  Dimensions,
  PanResponder,
  Animated,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import SwipeCard, { CARD_WIDTH, CARD_HEIGHT } from './SwipeCard';
import { colors } from '../theme/colors';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.25;

const CardStack = React.memo(({ 
  cards = [], 
  onSwipeLeft, 
  onSwipeRight,
}) => {
  const position = useRef(new Animated.ValueXY()).current;

  const triggerHaptic = useCallback(() => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {}
  }, []);

  const resetPosition = useCallback(() => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: false,
    }).start();
  }, [position]);

  const swipeCard = useCallback((direction) => {
    const x = direction === 'right' ? SCREEN_WIDTH * 1.5 : -SCREEN_WIDTH * 1.5;
    Animated.timing(position, {
      toValue: { x, y: 0 },
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      triggerHaptic();
      if (direction === 'right' && onSwipeRight && cards[0]) {
        onSwipeRight(cards[0]);
      } else if (direction === 'left' && onSwipeLeft && cards[0]) {
        onSwipeLeft(cards[0]);
      }
      position.setValue({ x: 0, y: 0 });
    });
  }, [cards, onSwipeLeft, onSwipeRight, position, triggerHaptic]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy * 0.5 });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          swipeCard('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          swipeCard('left');
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  const getCardStyle = () => {
    const rotate = position.x.interpolate({
      inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
      outputRange: ['-15deg', '0deg', '15deg'],
    });
    return {
      transform: [
        { translateX: position.x },
        { translateY: position.y },
        { rotate },
      ],
    };
  };

  const renderCards = () => {
    return cards.slice(0, 3).map((card, index) => {
      if (index === 0) {
        return (
          <Animated.View
            key={`${card.id}-${card.mediaType}`}
            style={[styles.cardContainer, getCardStyle()]}
            {...panResponder.panHandlers}
          >
            <SwipeCard item={card} />
          </Animated.View>
        );
      }
      return (
        <Animated.View
          key={`${card.id}-${card.mediaType}`}
          style={[
            styles.cardContainer,
            { top: 10 * index, transform: [{ scale: 1 - 0.05 * index }] },
          ]}
        >
          <SwipeCard item={card} />
        </Animated.View>
      );
    }).reverse();
  };

  if (cards.length === 0) return null;

  return <View style={styles.container}>{renderCards()}</View>;
});

CardStack.displayName = 'CardStack';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContainer: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
});

export default CardStack;