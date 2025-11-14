import { usePathname, useRouter } from 'expo-router';
import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import theme from '../theme/colors';

// Export height constant for use by other components (like FAB positioning)
export const BOTTOM_NAV_HEIGHT = 70; // Approximate height of bottom nav

export interface BottomNavTab {
  route: string;
  icon: string | ImageSourcePropType;
  label: string;
}

interface BottomNavProps {
  tabs: BottomNavTab[];
}

export default function BottomNav({ tabs }: BottomNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  const isActive = (route: string) => pathname === route;

  return (
    <View style={styles.container}>
      {tabs.map((tab) => (
        <TouchableOpacity
          key={tab.route}
          style={[styles.tab, isActive(tab.route) && styles.tabActive]}
          onPress={() => router.push(tab.route as any)}
          activeOpacity={0.7}
        >
          {typeof tab.icon === 'string' ? (
            <Text style={[styles.icon, isActive(tab.route) && styles.iconActive]}>
              {tab.icon}
            </Text>
          ) : (
            <Image
              source={tab.icon}
              style={[
                styles.iconImage,
                isActive(tab.route) && styles.iconImageActive
              ]}
            />
          )}
          <Text style={[styles.label, isActive(tab.route) && styles.labelActive]}>
            {tab.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: theme.colors.backgroundLight,
    borderTopWidth: 1,
    borderTopColor: theme.colors.primary + '40',
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabActive: {
    backgroundColor: theme.colors.primary + '20',
  },
  icon: {
    fontSize: 24,
    opacity: 0.5,
  },
  iconActive: {
    opacity: 1,
  },
  iconImage: {
    width: 24,
    height: 24,
    opacity: 0.5,
    tintColor: theme.colors.textMuted,
  },
  iconImageActive: {
    opacity: 1,
    tintColor: theme.colors.primary,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: theme.colors.textMuted,
  },
  labelActive: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
});
