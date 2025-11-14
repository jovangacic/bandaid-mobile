import { useRouter } from 'expo-router';
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
                style={{ fontSize: 40 }}   
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
              <Text style={styles.toolName}>🎤 Teleprompter</Text>
              <Text style={styles.toolDescription}>
                Display scrolling lyrics and scripts during performances. Features customizable 
                speed, font size, playlists, mirror mode, and drag-to-reorder.
              </Text>
            </View>

            {/* <View style={styles.toolCard}>
              <Text style={styles.toolName}>🎵 Metronome</Text>
              <Text style={styles.toolDescription}>
                Practice with precision timing. Features adjustable BPM (40-240), multiple time 
                signatures (2/4, 3/4, 4/4, 5/4, 6/8), visual beat indicators, and distinct sounds 
                for downbeats.
              </Text>
            </View> */}
          </View>

          {/* Coming Soon */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Coming Soon</Text>
            <View style={styles.featureList}>
              <Text style={styles.comingSoonItem}>🥁 Metronome - Practice with precision timing</Text>
              <Text style={styles.comingSoonItem}>🎸 Tuner - Keep your instruments in tune</Text>
              <Text style={styles.comingSoonItem}>📋 Gig Manager - Organize your gigs & rehearsals</Text>
              <Text style={styles.comingSoonItem}>⏱️ Practice Timer - Track your practice sessions</Text>
            </View>
          </View>

          {/* Links */}
          {/* <View style={styles.section}>
            <Text style={styles.sectionTitle}>Information</Text>
            
            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => handleOpenLink('https://github.com')}
              activeOpacity={0.8}
            >
              <Text style={styles.linkText}>Privacy Policy</Text>
              <Text style={styles.linkIcon}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => handleOpenLink('https://github.com')}
              activeOpacity={0.8}
            >
              <Text style={styles.linkText}>Terms of Service</Text>
              <Text style={styles.linkIcon}>›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.linkButton}
              onPress={() => handleOpenLink('https://github.com')}
              activeOpacity={0.8}
            >
              <Text style={styles.linkText}>Source Code</Text>
              <Text style={styles.linkIcon}>›</Text>
            </TouchableOpacity>
          </View> */}

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
            <Text style={styles.copyright}>© 2025 Bandaid by bend.rs</Text>
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
    fontSize: 16,
  },
  title: {
    fontSize: 20,
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
    width: 120,
    height: 120,
    marginBottom: theme.spacing.lg,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: theme.colors.primary,
  },
  appProvider: {
    fontSize: 16,
    color: theme.colors.accent,
    fontStyle: 'italic',
    textDecorationLine: 'underline',
    marginBottom: theme.spacing.sm,
  },
  appTagline: {
    fontSize: 16,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  version: {
    fontSize: 14,
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
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: 16,
    color: theme.colors.text,
    lineHeight: 24,
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
  },
  toolName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  toolDescription: {
    fontSize: 15,
    color: theme.colors.textMuted,
    lineHeight: 22,
  },
  comingSoonItem: {
    fontSize: 15,
    color: theme.colors.textMuted,
    lineHeight: 24,
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
    fontSize: 16,
    color: theme.colors.text,
  },
  linkIcon: {
    fontSize: 24,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  creditsText: {
    fontSize: 14,
    color: theme.colors.textMuted,
    lineHeight: 22,
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
    fontSize: 12,
    color: theme.colors.textMuted,
    lineHeight: 18,
  },
});
