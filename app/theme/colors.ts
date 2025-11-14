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
};

export default theme;
