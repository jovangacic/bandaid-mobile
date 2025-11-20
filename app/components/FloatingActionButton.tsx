import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import theme from '../theme/colors';
import { BOTTOM_NAV_HEIGHT } from './BottomNav';

interface FloatingActionButtonProps {
  onPress: () => void;
  icon?: string;
  hasBottomNav?: boolean; // Whether bottom nav is present (for automatic positioning)
}

export default function FloatingActionButton({ onPress, icon = '+', hasBottomNav = false }: FloatingActionButtonProps) {
  // Calculate bottom position: base spacing + bottom nav height + extra spacing if nav is present
  // Mobile uses larger spacing, tablet uses standard spacing + extra padding
  const extraTabletSpacing = theme.isTablet ? theme.spacing.xl : 0;
  const baseSpacing = theme.isTablet ? theme.spacing.lg : theme.spacing.xl; // xl on mobile, lg on tablet
  const bottomPosition = hasBottomNav 
    ? BOTTOM_NAV_HEIGHT + baseSpacing + extraTabletSpacing  // Nav height + extra spacing above nav
    : baseSpacing + extraTabletSpacing;  // Just the base spacing

  return (
    <TouchableOpacity
      style={[styles.fab, { bottom: bottomPosition }]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[theme.colors.primaryDark, theme.colors.primary, theme.colors.accent]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.gradient}
      >
        <Text style={styles.icon}>{icon}</Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    // bottom is set dynamically via inline style
    right: theme.spacing.lg,
    width: 60,
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
  },
  gradient: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 60,
    color: theme.colors.text,
    fontWeight: "200",
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 60,
    includeFontPadding: false,
  },
});
