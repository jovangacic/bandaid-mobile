import { usePathname, useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
    Dimensions,
    Modal,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import theme from '../theme/colors';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');
const isSmallScreen = SCREEN_WIDTH < 768;

interface SideMenuProps {
  visible: boolean;
  onClose: () => void;
}

export default function SideMenu({ visible, onClose }: SideMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const overlayOpacity = useSharedValue(0);
  const menuTranslate = useSharedValue(isSmallScreen ? SCREEN_HEIGHT : -280);

  useEffect(() => {
    if (visible) {
      overlayOpacity.value = withTiming(1, { duration: 250 });
      menuTranslate.value = withTiming(0, { duration: 300 });
    } else {
      overlayOpacity.value = withTiming(0, { duration: 250 });
      menuTranslate.value = withTiming(isSmallScreen ? SCREEN_HEIGHT : -280, { duration: 300 });
    }
  }, [visible]);

  const handleNavigation = (route: '/home' | '/teleprompter' | '/metronome' | '/settings' | '/about' | '/help') => {
    router.push(route as any);
    onClose();
  };

  const isActive = (route: string) => pathname === route;
  
  const isTeleprompterActive = () => {
    return pathname?.startsWith('/teleprompter') || pathname?.startsWith('/playlist-detail') || pathname?.startsWith('/add-text') || pathname?.startsWith('/text-view') || pathname?.startsWith('/add-playlist');
  };

  const overlayAnimatedStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  const menuAnimatedStyle = useAnimatedStyle(() => ({
    transform: isSmallScreen 
      ? [{ translateY: menuTranslate.value }]
      : [{ translateX: menuTranslate.value }],
  }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View style={[styles.overlay, overlayAnimatedStyle]}>
        <TouchableOpacity
          style={styles.overlayTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
      </Animated.View>
      
      <Animated.View
        style={[
          styles.menu,
          isSmallScreen ? styles.menuBottom : styles.menuLeft,
          menuAnimatedStyle,
        ]}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={(e) => e.stopPropagation()}
          style={styles.menuContainer}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Menu</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.menuContent}>
            <TouchableOpacity 
              style={[styles.menuItem, isActive('/home') && styles.activeMenuItem]}
              onPress={() => handleNavigation('/home')}
            >
              <Text style={[styles.menuItemText, isActive('/home') && styles.activeMenuItemText]}>
                Tools
              </Text>
            </TouchableOpacity>

            <View style={styles.divider} />

            <Text style={styles.sectionLabel}>AVAILABLE TOOLS</Text>

            <TouchableOpacity 
              style={[styles.menuItem, isTeleprompterActive() && styles.activeMenuItem]}
              onPress={() => handleNavigation('/teleprompter')}
            >
              <Text style={[styles.menuItemText, isTeleprompterActive() && styles.activeMenuItemText]}>
                🎤 Teleprompter
              </Text>
            </TouchableOpacity>

            {/* <TouchableOpacity 
              style={[styles.menuItem, isActive('/metronome') && styles.activeMenuItem]}
              onPress={() => handleNavigation('/metronome')}
            >
              <Text style={[styles.menuItemText, isActive('/metronome') && styles.activeMenuItemText]}>
                🎵 Metronome
              </Text>
            </TouchableOpacity> */}

            <View style={styles.divider} />

            <TouchableOpacity 
              style={[styles.menuItem, isActive('/settings') && styles.activeMenuItem]}
              onPress={() => handleNavigation('/settings')}
            >
              <Text style={[styles.menuItemText, isActive('/settings') && styles.activeMenuItemText]}>
                Settings
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.menuItem, isActive('/about') && styles.activeMenuItem]}
              onPress={() => handleNavigation('/about')}
            >
              <Text style={[styles.menuItemText, isActive('/about') && styles.activeMenuItemText]}>
                About
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.menuItem, isActive('/help') && styles.activeMenuItem]}
              onPress={() => handleNavigation('/help')}
            >
              <Text style={[styles.menuItemText, isActive('/help') && styles.activeMenuItemText]}>
                Help
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  overlayTouchable: {
    flex: 1,
  },
  menu: {
    position: 'absolute',
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.primary + '40',
  },
  menuLeft: {
    width: 280,
    height: '100%',
    left: 0,
    top: 0,
    borderRightWidth: 1,
  },
  menuBottom: {
    width: '100%',
    maxHeight: SCREEN_HEIGHT * 0.7,
    left: 0,
    bottom: 0,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    borderTopWidth: 1,
  },
  menuContainer: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.backgroundLight,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  closeText: {
    fontSize: 24,
    color: theme.colors.textMuted,
  },
  menuContent: {
    padding: theme.spacing.md,
    paddingBottom: 48,
  },
  menuItem: {
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.backgroundLight,
  },
  activeMenuItem: {
    backgroundColor: theme.colors.primary + '20',
    borderRadius: theme.borderRadius.md,
    borderBottomColor: 'transparent',
  },
  menuItemText: {
    fontSize: 18,
    color: theme.colors.text,
  },
  activeMenuItemText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.backgroundLight,
    marginVertical: theme.spacing.md,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
    letterSpacing: 1,
  },
});
