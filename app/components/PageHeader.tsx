import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import theme from '../theme/colors';

interface PageHeaderProps {
  title: string;
  count?: number;
  onMenuPress: () => void;
}

export default function PageHeader({ title, count, onMenuPress }: PageHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.leftSection}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={onMenuPress}
        >
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>
      </View>

      <MaskedView
        style={styles.titleContainer}
        maskElement={
          <Text style={styles.headerTitle}>{title}</Text>
        }
      >
        <LinearGradient
          colors={[theme.colors.primaryDark, theme.colors.primary, theme.colors.accent]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        >
          <Text style={[styles.headerTitle, styles.transparentText]}>{title}</Text>
        </LinearGradient>
      </MaskedView>

      <View style={styles.rightSection}>
        {count !== undefined && (
          <View style={styles.countContainer}>
            <Text style={styles.countText}>{count}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
  leftSection: {
    width: 60,
    alignItems: 'flex-start',
  },
  rightSection: {
    width: 60,
    alignItems: 'flex-end',
  },
  menuButton: {
    padding: theme.spacing.sm,
  },
  menuIcon: {
    fontSize: 28,
    color: theme.colors.text,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  gradient: {
    paddingHorizontal: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text,
    textAlign: 'center',
  },
  transparentText: {
    opacity: 0,
  },
  countContainer: {
    backgroundColor: theme.colors.primary,
    borderRadius: 16,
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: {
    color: theme.colors.background,
    fontSize: 14,
    fontWeight: 'bold',
  },
});
