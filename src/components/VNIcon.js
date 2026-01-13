import React from 'react';
import Svg, { Path, Circle, Line, Rect, Polyline, Polygon, G } from 'react-native-svg';

// WatchNext Brand Colors
export const VN_COLORS = {
  primary: '#8A4FFF',    // Electric Purple
  secondary: '#00C2CB',  // Cyan
  white: '#FFFFFF',
  danger: '#E74C3C',
  success: '#2ECC71',
  warning: '#F1C40F',
  muted: '#5E6575',
};

// Icon definitions with SVG paths
const ICONS = {
  // === MOODS ===
  comedy: (color) => (
    <G>
      <Circle cx="12" cy="12" r="10" stroke={color} />
      <Path d="M8 13c0 0 1.5 3 4 3s4-3 4-3" stroke={color} />
      <Line x1="9" y1="9" x2="9.01" y2="9" stroke={color} />
      <Line x1="15" y1="9" x2="15.01" y2="9" stroke={color} />
    </G>
  ),
  drama: (color, secondaryColor) => (
    <G>
      <Circle cx="12" cy="12" r="10" stroke={color} />
      <Path d="M16 17c0 0-1.5-3-4-3s-4 3-4 3" stroke={color} />
      <Line x1="9" y1="9" x2="9.01" y2="9" stroke={color} />
      <Line x1="15" y1="9" x2="15.01" y2="9" stroke={color} />
      <Path d="M9 17c0 1-1 2-1 2s-1-1-1-2 1-2 1-2 1 1 1 2z" fill={secondaryColor || VN_COLORS.secondary} strokeWidth="0" />
    </G>
  ),
  action: (color) => (
    <Path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" stroke={color} />
  ),
  thriller: (color) => (
    <Path d="M10 20H4v-6c1.1 0 2-.9 2-2s-.9-2-2-2V4h6c0 1.1.9 2 2 2s2-.9 2-2h6v6c-1.1 0-2 .9-2 2s.9 2 2 2v6h-6c0-1.1-.9-2-2-2s-2 .9-2 2z" stroke={color} />
  ),
  horror: (color) => (
    <G>
      <Path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z" stroke={color} />
      <Circle cx="9" cy="10" r="1" fill={color} />
      <Circle cx="15" cy="10" r="1" fill={color} />
    </G>
  ),
  romance: (color) => (
    <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke={color} />
  ),
  fantasy: (color, secondaryColor) => (
    <G>
      <Path d="M12 2l3 6 7 1-5 5 1.5 7L12 18l-6.5 3.5L7 14l-5-5 7-1 3-6z" stroke={color} />
      <Path d="M19 3l.01.01M21 7l.01.01M3 7l.01.01" stroke={secondaryColor || VN_COLORS.secondary} />
    </G>
  ),

  // === DURATION - MOVIES ===
  movieShort: (color, accentColor) => (
    <G>
      <Rect x="3" y="3" width="18" height="18" rx="2" stroke={color} />
      <Path d="M7 3v18M17 3v18M3 8h4M3 13h4M3 18h4M17 8h4M17 13h4M17 18h4" stroke={color} />
      <Path d="M11 10h2" stroke={accentColor || VN_COLORS.primary} />
    </G>
  ),
  movieMedium: (color, accentColor) => (
    <G>
      <Rect x="3" y="3" width="18" height="18" rx="2" stroke={color} />
      <Path d="M7 3v18M17 3v18M3 8h4M3 13h4M17 8h4M17 13h4" stroke={color} />
      <Path d="M10 10h4M10 14h4" stroke={accentColor || VN_COLORS.primary} />
    </G>
  ),
  movieLong: (color, accentColor) => (
    <G>
      <Rect x="3" y="3" width="18" height="18" rx="2" stroke={color} />
      <Path d="M7 3v18M17 3v18M10 9h4M10 12h4M10 15h4" stroke={accentColor || VN_COLORS.primary} />
    </G>
  ),

  // === DURATION - TV ===
  tvShort: (color, accentColor) => (
    <G>
      <Rect x="2" y="7" width="20" height="13" rx="2" stroke={color} />
      <Path d="M7 7l-3-4M17 7l3-4" stroke={color} />
      <Path d="M12 13h2" stroke={accentColor || VN_COLORS.secondary} />
    </G>
  ),
  tvMedium: (color, accentColor) => (
    <G>
      <Rect x="2" y="7" width="20" height="13" rx="2" stroke={color} />
      <Path d="M7 7l-3-4M17 7l3-4" stroke={color} />
      <Path d="M11 12h3M11 15h3" stroke={accentColor || VN_COLORS.secondary} />
    </G>
  ),
  tvLong: (color, accentColor) => (
    <G>
      <Rect x="2" y="7" width="20" height="13" rx="2" stroke={color} />
      <Path d="M7 7l-3-4M17 7l3-4" stroke={color} />
      <Path d="M10 11h4M10 13.5h4M10 16h4" stroke={accentColor || VN_COLORS.secondary} />
    </G>
  ),

  // === NAVIGATION ===
  home: (color) => (
    <G>
      <Path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" stroke={color} />
      <Polyline points="9 22 9 12 15 12 15 22" stroke={color} />
    </G>
  ),
  search: (color) => (
    <G>
      <Circle cx="11" cy="11" r="8" stroke={color} />
      <Line x1="21" y1="21" x2="16.65" y2="16.65" stroke={color} />
    </G>
  ),
  watchlist: (color) => (
    <Path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" stroke={color} />
  ),
  heart: (color) => (
    <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke={color} />
  ),
  settings: (color) => (
    <G>
      <Circle cx="12" cy="12" r="3" stroke={color} />
      <Path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" stroke={color} />
    </G>
  ),
  profile: (color) => (
    <G>
      <Path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke={color} />
      <Circle cx="12" cy="7" r="4" stroke={color} />
    </G>
  ),

  // === ACTIONS ===
  play: (color) => (
    <Polygon points="5 3 19 12 5 21 5 3" stroke={color} />
  ),
  add: (color) => (
    <G>
      <Line x1="12" y1="5" x2="12" y2="19" stroke={color} />
      <Line x1="5" y1="12" x2="19" y2="12" stroke={color} />
    </G>
  ),
  remove: (color) => (
    <G>
      <Polyline points="3 6 5 6 21 6" stroke={color} />
      <Path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" stroke={color} />
    </G>
  ),
  close: (color) => (
    <G>
      <Line x1="18" y1="6" x2="6" y2="18" stroke={color} />
      <Line x1="6" y1="6" x2="18" y2="18" stroke={color} />
    </G>
  ),
  skip: (color) => (
    <G>
      <Polyline points="5 4 15 12 5 20" stroke={color} />
      <Line x1="19" y1="5" x2="19" y2="19" stroke={color} />
    </G>
  ),
  shuffle: (color) => (
    <G>
      <Polyline points="16 3 21 3 21 8" stroke={color} />
      <Line x1="4" y1="20" x2="21" y2="3" stroke={color} />
      <Polyline points="21 16 21 21 16 21" stroke={color} />
      <Line x1="15" y1="15" x2="21" y2="21" stroke={color} />
      <Line x1="4" y1="4" x2="9" y2="9" stroke={color} />
    </G>
  ),
  filter: (color) => (
    <G>
      <Line x1="4" y1="21" x2="4" y2="14" stroke={color} />
      <Line x1="4" y1="10" x2="4" y2="3" stroke={color} />
      <Line x1="12" y1="21" x2="12" y2="12" stroke={color} />
      <Line x1="12" y1="8" x2="12" y2="3" stroke={color} />
      <Line x1="20" y1="21" x2="20" y2="16" stroke={color} />
      <Line x1="20" y1="12" x2="20" y2="3" stroke={color} />
      <Line x1="1" y1="14" x2="7" y2="14" stroke={color} />
      <Line x1="9" y1="8" x2="15" y2="8" stroke={color} />
      <Line x1="17" y1="16" x2="23" y2="16" stroke={color} />
    </G>
  ),
  sort: (color) => (
    <G>
      <Line x1="3" y1="6" x2="15" y2="6" stroke={color} />
      <Line x1="3" y1="12" x2="12" y2="12" stroke={color} />
      <Line x1="3" y1="18" x2="9" y2="18" stroke={color} />
    </G>
  ),

  // === STATES ===
  check: (color) => (
    <Polyline points="20 6 9 17 4 12" stroke={color} />
  ),
  notSeen: (color) => (
    <Circle cx="12" cy="12" r="10" stroke={color} />
  ),
  inProgress: (color) => (
    <Path d="M12 2a10 10 0 0 1 10 10" stroke={color} />
  ),

  // === MISC ===
  star: (color) => (
    <Polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke={color} />
  ),
  starFilled: (color) => (
    <Polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" stroke={color} fill={color} />
  ),
  calendar: (color) => (
    <G>
      <Rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke={color} />
      <Line x1="16" y1="2" x2="16" y2="6" stroke={color} />
      <Line x1="8" y1="2" x2="8" y2="6" stroke={color} />
      <Line x1="3" y1="10" x2="21" y2="10" stroke={color} />
    </G>
  ),
  clock: (color) => (
    <G>
      <Circle cx="12" cy="12" r="10" stroke={color} />
      <Polyline points="12 6 12 12 16 14" stroke={color} />
    </G>
  ),
  streaming: (color) => (
    <G>
      <Rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" stroke={color} />
      <Line x1="7" y1="2" x2="7" y2="22" stroke={color} />
      <Line x1="17" y1="2" x2="17" y2="22" stroke={color} />
      <Line x1="2" y1="12" x2="22" y2="12" stroke={color} />
      <Line x1="2" y1="7" x2="7" y2="7" stroke={color} />
      <Line x1="2" y1="17" x2="7" y2="17" stroke={color} />
      <Line x1="17" y1="17" x2="22" y2="17" stroke={color} />
      <Line x1="17" y1="7" x2="22" y2="7" stroke={color} />
    </G>
  ),
  film: (color, accentColor) => (
    <G>
      <Rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" stroke={color} />
      <Line x1="7" y1="2" x2="7" y2="22" stroke={color} />
      <Line x1="17" y1="2" x2="17" y2="22" stroke={color} />
      <Line x1="2" y1="12" x2="22" y2="12" stroke={color} />
      <Line x1="2" y1="7" x2="7" y2="7" stroke={color} />
      <Line x1="2" y1="17" x2="7" y2="17" stroke={color} />
      <Line x1="17" y1="17" x2="22" y2="17" stroke={color} />
      <Line x1="17" y1="7" x2="22" y2="7" stroke={color} />
    </G>
  ),
  tv: (color, accentColor) => (
    <G>
      <Rect x="2" y="7" width="20" height="13" rx="2" stroke={color} />
      <Path d="M7 7l-3-4M17 7l3-4" stroke={color} />
    </G>
  ),

  // === THUMBS ===
  thumbsUp: (color) => (
    <G>
      <Path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" stroke={color} />
    </G>
  ),
  thumbsDown: (color) => (
    <G>
      <Path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17" stroke={color} />
    </G>
  ),

  // === ARROWS ===
  chevronLeft: (color) => (
    <Polyline points="15 18 9 12 15 6" stroke={color} />
  ),
  chevronRight: (color) => (
    <Polyline points="9 18 15 12 9 6" stroke={color} />
  ),
  chevronDown: (color) => (
    <Polyline points="6 9 12 15 18 9" stroke={color} />
  ),
  chevronUp: (color) => (
    <Polyline points="18 15 12 9 6 15" stroke={color} />
  ),

  // === INFO ===
  info: (color) => (
    <G>
      <Circle cx="12" cy="12" r="10" stroke={color} />
      <Line x1="12" y1="16" x2="12" y2="12" stroke={color} />
      <Line x1="12" y1="8" x2="12.01" y2="8" stroke={color} />
    </G>
  ),
  alert: (color) => (
    <G>
      <Circle cx="12" cy="12" r="10" stroke={color} />
      <Line x1="12" y1="8" x2="12" y2="12" stroke={color} />
      <Line x1="12" y1="16" x2="12.01" y2="16" stroke={color} />
    </G>
  ),
  bulb: (color) => (
    <G>
      <Path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z" stroke={color} />
    </G>
  ),

  // === TARGET/RECOMMENDATION ===
  target: (color) => (
    <G>
      <Circle cx="12" cy="12" r="10" stroke={color} />
      <Circle cx="12" cy="12" r="6" stroke={color} />
      <Circle cx="12" cy="12" r="2" stroke={color} />
    </G>
  ),
  sparkles: (color) => (
    <G>
      <Path d="M12 3l1.5 4.5L18 9l-4.5 1.5L12 15l-1.5-4.5L6 9l4.5-1.5L12 3z" stroke={color} />
      <Path d="M19 13l.75 2.25L22 16l-2.25.75L19 19l-.75-2.25L16 16l2.25-.75L19 13z" stroke={color} />
      <Path d="M5 17l.5 1.5L7 19l-1.5.5L5 21l-.5-1.5L3 19l1.5-.5L5 17z" stroke={color} />
    </G>
  ),

  // === STATS ===
  barChart: (color) => (
    <G>
      <Line x1="18" y1="20" x2="18" y2="10" stroke={color} />
      <Line x1="12" y1="20" x2="12" y2="4" stroke={color} />
      <Line x1="6" y1="20" x2="6" y2="14" stroke={color} />
    </G>
  ),

  // === QUESTION MARK (for haven't seen) ===
  helpCircle: (color) => (
    <G>
      <Circle cx="12" cy="12" r="10" stroke={color} />
      <Path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke={color} />
      <Line x1="12" y1="17" x2="12.01" y2="17" stroke={color} />
    </G>
  ),

  // === LANGUAGE/GLOBE ===
  globe: (color) => (
    <G>
      <Circle cx="12" cy="12" r="10" stroke={color} />
      <Line x1="2" y1="12" x2="22" y2="12" stroke={color} />
      <Path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke={color} />
    </G>
  ),
  language: (color) => (
    <G>
      <Path d="M5 8l6 6M4 14l6-6 2-3M2 5h12M7 2h1M22 22l-5-10-5 10M14 18h6" stroke={color} />
    </G>
  ),
  flag: (color) => (
    <G>
      <Path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" stroke={color} />
      <Line x1="4" y1="22" x2="4" y2="15" stroke={color} />
    </G>
  ),
};

// Main VNIcon Component
const VNIcon = ({
  name,
  size = 24,
  color = VN_COLORS.white,
  secondaryColor,
  strokeWidth = 2,
  style
}) => {
  const iconRenderer = ICONS[name];

  if (!iconRenderer) {
    console.warn(`VNIcon: Icon "${name}" not found`);
    return null;
  }

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
    >
      {iconRenderer(color, secondaryColor)}
    </Svg>
  );
};

// Export available icon names for reference
export const ICON_NAMES = Object.keys(ICONS);

export default VNIcon;
