import { Ionicons } from '@expo/vector-icons';
import { Link, useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import GradientText from './components/GradientText';
import Layout from './components/Layout';
import theme, { colors } from './theme/colors';

export default function AboutScreen() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleOpenLink = (url: string) => {
    Linking.openURL(url).catch((err) =>
      console.error('Failed to open URL:', err)
    );
  };

  return (
    <Layout>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>About</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* App Info */}
          <View style={styles.appInfoContainer}>
            <Image
              source={require('../assets/images/bandaid-sign-04.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <GradientText
                text="bandaid"
                colors={[colors.purple[700], colors.orange[400]]}
                style={{ fontSize: theme.typography.displayLarge }}   
                >
            </GradientText>         
            <TouchableOpacity onPress={() => handleOpenLink('https://bend.rs')}>
              <Text style={styles.appProvider}>by bend.rs</Text>
            </TouchableOpacity>
            <Text style={styles.appTagline}>Musician's Toolbox</Text>
            <Text style={styles.version}>Version 1.0.0</Text>
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.description}>
              Bandaid is a comprehensive toolbox designed for musicians, bands, and performers. 
              Each tool is crafted to solve specific needs during practice, performance, and planning.
            </Text>
          </View>

          {/* Available Tools */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Available Tools</Text>
            
            <View style={styles.toolCard}>
              <View style={styles.toolHeader}>
                <Ionicons name="mic" size={24} color={theme.colors.primary} />
                <Text style={styles.toolName}>Teleprompter</Text>
              </View>
              <Text style={styles.toolDescription}>
                Display scrolling lyrics and scripts during performances. Features customizable 
                speed, font size, playlists, mirror mode, and drag-to-reorder.
              </Text>
            </View>

            <View style={styles.toolCard}>
              <View style={styles.toolHeader}>
                <Ionicons name="calendar" size={24} color={theme.colors.primary} />
                <Text style={styles.toolName}>Gigs Calendar</Text>
              </View>
              <Text style={styles.toolDescription}>
                Organize and track your gigs and rehearsals. Schedule events with date and time, 
                add descriptions, and get customizable reminders (7 days, 1 day, or hours before).
              </Text>
            </View>

            <View style={styles.toolCard}>
              <View style={styles.toolHeader}>
                <Ionicons name="recording" size={24} color={theme.colors.primary} />
                <Text style={styles.toolName}>Record Track</Text>
              </View>
              <Text style={styles.toolDescription}>
                Record audio tracks with high quality. Features include section looping for practice.
                Keep your song ideas organized within the app. 
              </Text>
            </View>
          </View>

          {/* Coming Soon */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Coming Soon</Text>
            <View style={styles.featureList}>
              <View style={styles.comingSoonContainer}>
                <Ionicons name="timer" size={24} color={theme.colors.primary} />
                <Text style={styles.comingSoonItem}>Practice Timer - Track your practice sessions</Text>
              </View>
            </View>
          </View>

          {/* Credits */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Credits</Text>
            <Text style={styles.creditsText}>
              Built with React Native and Expo
            </Text>
            <Text style={styles.creditsText}>
              Developed with ❤️ for creators everywhere
            </Text>
          </View>

          {/* Copyright */}
          <View style={styles.footer}>
            <Text style={styles.copyright}>© 2025 Bandaid by <Link href="https://bend.rs" target="_blank" rel="noopener noreferrer">bend.rs</Link></Text>
            <Text style={styles.copyright}>All rights reserved</Text>
          </View>
        </ScrollView>
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
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
  backButton: {
    padding: theme.spacing.xs,
  },
  backText: {
    color: theme.colors.accent,
    fontSize: theme.typography.bodyMedium,
  },
  title: {
    fontSize: theme.typography.heading3,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  placeholder: {
    width: 60,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: 40,
  },
  appInfoContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  logo: {
    width: theme.isTablet ? 180 : 120,
    height: theme.isTablet ? 180 : 120,
    marginBottom: theme.spacing.lg,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  appProvider: {
    fontSize: theme.typography.bodyMedium,
    color: theme.colors.accent,
    fontStyle: 'italic',
    textDecorationLine: 'underline',
    marginBottom: theme.spacing.sm,
  },
  appTagline: {
    fontSize: theme.typography.bodyMedium,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  version: {
    fontSize: theme.typography.bodySmall,
    color: theme.colors.textMuted,
    backgroundColor: theme.colors.backgroundLight,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.lg,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.heading4,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: theme.typography.bodyMedium,
    color: theme.colors.text,
    lineHeight: theme.typography.bodyMedium * 1.5,
  },
  featureList: {
    gap: theme.spacing.sm,
  },
  featureItem: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
  },
  toolCard: {
    backgroundColor: theme.colors.backgroundLight,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accent,
    marginBottom: theme.spacing.md,
  },
  toolHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  toolName: {
    fontSize: theme.typography.heading4,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  toolDescription: {
    fontSize: theme.typography.label,
    color: theme.colors.textMuted,
    lineHeight: theme.typography.label * 1.47,
  },
  comingSoonContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  comingSoonItem: {
    paddingLeft: theme.spacing.sm,
    fontSize: theme.typography.label,
    color: theme.colors.textMuted,
    lineHeight: theme.typography.label * 1.6,
  },
  faqCard: {
    backgroundColor: theme.colors.backgroundLight,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  faqQuestion: {
    fontSize: theme.typography.bodyMedium,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  faqAnswer: {
    fontSize: theme.typography.bodySmall,
    color: theme.colors.textMuted,
    lineHeight: theme.typography.bodySmall * 1.5,
  },
  linkButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.backgroundLight,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
  },
  linkText: {
    fontSize: theme.typography.bodyMedium,
    color: theme.colors.text,
  },
  linkIcon: {
    fontSize: theme.typography.heading2,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  creditsText: {
    fontSize: theme.typography.bodySmall,
    color: theme.colors.textMuted,
    lineHeight: theme.typography.bodySmall * 1.57,
    marginBottom: theme.spacing.xs,
  },
  footer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.xl,
    borderTopWidth: 1,
    borderTopColor: theme.colors.backgroundLight,
    marginTop: theme.spacing.lg,
  },
  copyright: {
    fontSize: theme.typography.caption,
    color: theme.colors.textMuted,
    lineHeight: theme.typography.caption * 1.5,
  },
});
