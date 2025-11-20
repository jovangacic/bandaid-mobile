import { Dimensions } from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Determine if device is a tablet (width >= 768px is common tablet breakpoint)
const isTablet = SCREEN_WIDTH >= 768;

// Typography scale multiplier for tablets
const scale = isTablet ? 1.3 : 1;

// Theme colors based on Tailwind CSS
export const colors = {
  // Primary palette - purple gradient
  purple: {
    700: '#7e22ce',
    500: '#a855f7',
  },
  // Accent - orange
  orange: {
    400: '#fb923c',
  },
  // Background - stone
  stone: {
    900: '#1c1917',
    800: '#292524',
  },
  // Neutrals
  white: '#ffffff',
  black: '#000000',
  gray: {
    600: '#666666',
  },
};

// Responsive typography scale
export const typography = {
  // Display text (large titles, headers)
  displayLarge: Math.round(40 * scale),
  displayMedium: Math.round(36 * scale),
  displaySmall: Math.round(32 * scale),
  
  // Headings
  heading1: Math.round(28 * scale),
  heading2: Math.round(24 * scale),
  heading3: Math.round(20 * scale),
  heading4: Math.round(18 * scale),
  
  // Body text
  bodyLarge: Math.round(18 * scale),
  bodyMedium: Math.round(16 * scale),
  bodySmall: Math.round(14 * scale),
  
  // UI elements
  label: Math.round(15 * scale),
  caption: Math.round(12 * scale),
  overline: Math.round(11 * scale),
  
  // Button text
  button: Math.round(16 * scale),
  
  // Tool cards
  toolName: Math.round(20 * scale),
  toolIcon: Math.round(48 * scale),
  toolDescription: Math.round(15 * scale),
};

// Theme configuration
export const theme = {
  colors: {
    background: colors.stone[900],
    backgroundLight: colors.stone[800],
    primary: colors.purple[500],
    primaryDark: colors.purple[700],
    accent: colors.orange[400],
    text: colors.white,
    textMuted: colors.gray[600],
    border: colors.purple[500],
    black: colors.black,
    white: colors.white,
    error: '#ef4444',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  borderRadius: {
    sm: 8,
    md: 10,
    lg: 16,
  },
  typography,
  isTablet,
};

export default theme;
