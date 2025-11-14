import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Linking,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Layout from './components/Layout';
import theme from './theme/colors';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    question: 'How do I create a new text?',
    answer: 'Tap the "+" button in the bottom right corner of the Texts screen. Enter your title and content, adjust settings like speed and font size, then tap Save.',
  },
  {
    question: 'How do I create a playlist?',
    answer: 'Go to the Playlists screen and tap the "+" button. Give your playlist a name and description, then select texts to add. You can reorder texts within playlists.',
  },
  {
    question: 'Can I control playback speed during playback?',
    answer: 'Yes! During playback, tap the screen to pause. While paused, you can adjust the speed using the slider at the bottom of the screen.',
  },
  {
    question: 'How do I reorder texts or playlists?',
    answer: 'Press and hold on any text or playlist, then drag it to your desired position. Release to drop it in place.',
  },
  {
    question: 'What is mirror mode?',
    answer: 'Mirror mode flips the text horizontally, which is useful if you\'re using a teleprompter glass that reflects the display.',
  },
  {
    question: 'How do I add texts to multiple playlists?',
    answer: 'When creating or editing a text, tap "Add to playlists" and select all the playlists you want to include it in.',
  },
  {
    question: 'Can I edit a text while it\'s in playlists?',
    answer: 'Yes! Editing a text will update it everywhere it appears, including all playlists that contain it.',
  },
  {
    question: 'How do I delete a text or playlist?',
    answer: 'Edit the text or playlist, scroll to the bottom, and tap the "Delete" button. If confirmation is enabled in settings, you\'ll be asked to confirm.',
  },
  {
    question: 'Why does my screen keep dimming?',
    answer: 'Enable "Keep Screen On" in Settings to prevent the screen from dimming during playback.',
  },
  {
    question: 'How do I adjust font size?',
    answer: 'Each text has its own font size setting. You can adjust it when creating or editing the text. You can also set a default font size in Settings.',
  },
];

export default function HelpScreen() {
  const router = useRouter();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const handleBack = () => {
    router.back();
  };

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const handleContactSupport = () => {
    Linking.openURL('mailto:info@bend.rs?subject=Bandaid Support Request').catch((err) =>
      console.error('Failed to open email:', err)
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
          <Text style={styles.title}>Help</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {/* Getting Started */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Getting Started</Text>
            <Text style={styles.description}>
              Welcome to Bandaid - your musician's toolbox! The only available tool at the moment is the Teleprompter tool, 
              designed to help you display scrolling lyrics and scripts during performances. 
              Create your first text, customize the playback settings, and organize your content into playlists.
            </Text>
          </View>

          {/* About Teleprompter Tool */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🎤 Teleprompter Tool</Text>
            <Text style={styles.description}>
              The Teleprompter is the first tool in the Bandaid toolbox. It helps musicians, 
              bands, and performers display lyrics and scripts in a professional, easy-to-read format 
              during live performances or content creation.
            </Text>

            
             {/* Quick Tips */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Quick Tips</Text>
            <View style={styles.tipsList}>
              <View style={styles.tipItem}>
                <Text style={styles.tipIcon}>💡</Text>
                <Text style={styles.tipText}>
                  Tap anywhere on the screen during playback to pause/resume
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipIcon}>💡</Text>
                <Text style={styles.tipText}>
                  Use playlists to organize related texts for presentations or performances
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipIcon}>💡</Text>
                <Text style={styles.tipText}>
                  Adjust speed and font size per text for optimal readability
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipIcon}>💡</Text>
                <Text style={styles.tipText}>
                  Enable "Keep Screen On" in settings for uninterrupted playback
                </Text>
              </View>
              <View style={styles.tipItem}>
                <Text style={styles.tipIcon}>💡</Text>
                <Text style={styles.tipText}>
                  Press and hold to reorder texts in your lists or playlists
                </Text>
              </View>
            </View>
          </View>

          {/* FAQ */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
            {FAQ_DATA.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.faqItem}
                onPress={() => toggleFAQ(index)}
                activeOpacity={0.8}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{item.question}</Text>
                  <Text style={styles.faqIcon}>
                    {expandedIndex === index ? '−' : '+'}
                  </Text>
                </View>
                {expandedIndex === index && (
                  <Text style={styles.faqAnswer}>{item.answer}</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Keyboard Shortcuts */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Playback Controls</Text>
            <View style={styles.controlsList}>
              <View style={styles.controlItem}>
                <Text style={styles.controlLabel}>Tap Screen</Text>
                <Text style={styles.controlDescription}>Pause/Resume playback</Text>
              </View>
              <View style={styles.controlItem}>
                <Text style={styles.controlLabel}>Speed Slider</Text>
                <Text style={styles.controlDescription}>Adjust scrolling speed (0.5x - 5x)</Text>
              </View>
              <View style={styles.controlItem}>
                <Text style={styles.controlLabel}>Font Slider</Text>
                <Text style={styles.controlDescription}>Change text size (16 - 48)</Text>
              </View>
            </View>
          </View>
          </View>

         

          {/* Support */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Need More Help?</Text>
            <Text style={styles.description}>
              If you have questions not covered here or need technical support, feel free to reach out.
            </Text>
            <TouchableOpacity
              style={styles.supportButton}
              onPress={handleContactSupport}
              activeOpacity={0.8}
            >
              <Text style={styles.supportButtonText}>Contact Support</Text>
            </TouchableOpacity>
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
  section: {
    marginTop: theme.spacing.xl,
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
  tipsList: {
    gap: theme.spacing.md,
  },
  tipItem: {
    flexDirection: 'row',
    backgroundColor: theme.colors.backgroundLight,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'flex-start',
  },
  tipIcon: {
    fontSize: 20,
    marginRight: theme.spacing.sm,
  },
  tipText: {
    flex: 1,
    fontSize: 15,
    color: theme.colors.text,
    lineHeight: 22,
  },
  faqItem: {
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    overflow: 'hidden',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  faqQuestion: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginRight: theme.spacing.sm,
  },
  faqIcon: {
    fontSize: 24,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  faqAnswer: {
    fontSize: 15,
    color: theme.colors.textMuted,
    lineHeight: 22,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.md,
  },
  controlsList: {
    gap: theme.spacing.sm,
  },
  controlItem: {
    backgroundColor: theme.colors.backgroundLight,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  controlLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  controlDescription: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  supportButton: {
    backgroundColor: theme.colors.primary + '20',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginTop: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  supportButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});
