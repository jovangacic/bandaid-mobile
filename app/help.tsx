import { Ionicons } from '@expo/vector-icons';
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
    answer: 'Each text has its own font size setting. You can adjust it when creating or editing the text. You can also set a default font size in Settings. You can also control font size during playback by pinching in or out on the screen.',
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

          {/* Teleprompter Tool Section */}
          <View style={styles.teleprompterSection}>
            <View style={styles.section}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="mic-outline" size={24} color={theme.colors.primary} />
                <Text style={[styles.sectionTitle, styles.sectionTitleWithIcon]}>Teleprompter Tool</Text>
              </View>
              <Text style={styles.description}>
                The Teleprompter is the first tool in the Bandaid toolbox. It helps musicians, 
                bands, and performers display lyrics and scripts in a professional, easy-to-read format 
                during live performances or content creation.
              </Text>
            </View>

            {/* Quick Tips */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Tips</Text>
              <View style={styles.tipsList}>
                <View style={styles.tipItem}>
                  <Ionicons name="bulb" size={20} color={theme.colors.accent} style={styles.tipIconStyle} />
                  <Text style={styles.tipText}>
                    Tap anywhere on the screen during playback to pause/resume
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons name="bulb" size={20} color={theme.colors.accent} style={styles.tipIconStyle} />
                  <Text style={styles.tipText}>
                    Use playlists to organize related texts for presentations or performances
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons name="bulb" size={20} color={theme.colors.accent} style={styles.tipIconStyle} />
                  <Text style={styles.tipText}>
                    Adjust speed and font size per text for optimal readability
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons name="bulb" size={20} color={theme.colors.accent} style={styles.tipIconStyle} />
                  <Text style={styles.tipText}>
                    Enable "Keep Screen On" in settings for uninterrupted playback
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons name="bulb" size={20} color={theme.colors.accent} style={styles.tipIconStyle} />
                  <Text style={styles.tipText}>
                    Press and hold to reorder texts in your lists or playlists
                  </Text>
                </View>
                  <View style={styles.tipItem}>
                  <Ionicons name="bulb" size={20} color={theme.colors.accent} style={styles.tipIconStyle} />
                  <Text style={styles.tipText}>
                    Pinch in or out on the playback screen to quickly adjust font size
                  </Text>
                </View>
                  <View style={styles.tipItem}>
                  <Ionicons name="bulb" size={20} color={theme.colors.accent} style={styles.tipIconStyle} />
                  <Text style={styles.tipText}>
                    Drag to right or left on the playback screen to go to the next or previous text
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

            {/* Playback Controls */}
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

          {/* Gig Calendar Section */}
          <View style={styles.gigCalendarSection}>
            <View style={styles.section}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="calendar-outline" size={24} color={theme.colors.primary} />
                <Text style={[styles.sectionTitle, styles.sectionTitleWithIcon]}>Gig Calendar</Text>
              </View>
              <Text style={styles.description}>
                Keep track of all your upcoming performances, rehearsals, and music events. 
                Set reminders and never miss a gig again!
              </Text>
            </View>

            {/* Gig Calendar Tips */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Tips</Text>
              <View style={styles.tipsList}>
                <View style={styles.tipItem}>
                  <Ionicons name="bulb" size={20} color={theme.colors.accent} style={styles.tipIconStyle} />
                  <Text style={styles.tipText}>
                    Set multiple reminders for each gig (7 days, 1 day, and custom hours before)
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons name="bulb" size={20} color={theme.colors.accent} style={styles.tipIconStyle} />
                  <Text style={styles.tipText}>
                    Enable recurring gigs for regular performances or rehearsals
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons name="bulb" size={20} color={theme.colors.accent} style={styles.tipIconStyle} />
                  <Text style={styles.tipText}>
                    Tap on a notification to jump directly to the gig details
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons name="bulb" size={20} color={theme.colors.accent} style={styles.tipIconStyle} />
                  <Text style={styles.tipText}>
                    Long press a gig to quickly delete it from your calendar
                  </Text>
                </View>
              </View>
            </View>

            {/* Gig Calendar FAQ */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
              <TouchableOpacity
                style={styles.faqItem}
                onPress={() => toggleFAQ(100)}
                activeOpacity={0.8}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>How do I create a new gig?</Text>
                  <Text style={styles.faqIcon}>{expandedIndex === 100 ? '−' : '+'}</Text>
                </View>
                {expandedIndex === 100 && (
                  <Text style={styles.faqAnswer}>
                    Tap the "+" button in the bottom right corner. Enter the gig title, date, time, 
                    and optional description. Configure your reminder settings, then tap "Save Gig".
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.faqItem}
                onPress={() => toggleFAQ(101)}
                activeOpacity={0.8}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>Can I set recurring gigs?</Text>
                  <Text style={styles.faqIcon}>{expandedIndex === 101 ? '−' : '+'}</Text>
                </View>
                {expandedIndex === 101 && (
                  <Text style={styles.faqAnswer}>
                    Yes! When creating or editing a gig, enable the "Recurring" option and set the interval 
                    in days. The app will automatically create the next occurrence after each gig passes.
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.faqItem}
                onPress={() => toggleFAQ(102)}
                activeOpacity={0.8}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>How do reminders work?</Text>
                  <Text style={styles.faqIcon}>{expandedIndex === 102 ? '−' : '+'}</Text>
                </View>
                {expandedIndex === 102 && (
                  <Text style={styles.faqAnswer}>
                    You can set reminders for 7 days before, 1 day before, and custom hours before (1-12 hours). 
                    Enable "Reminders" and select which notifications you want. Make sure to grant notification 
                    permissions when prompted.
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Record Track Section */}
          <View style={styles.recordTrackSection}>
            <View style={styles.section}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="radio-outline" size={24} color={theme.colors.primary} />
                <Text style={[styles.sectionTitle, styles.sectionTitleWithIcon]}>Record Track</Text>
              </View>
              <Text style={styles.description}>
                Record high-quality audio for song ideas, rehearsals, or voice memos. 
                Play back your recordings with loop functionality for practice and analysis.
              </Text>
            </View>

            {/* Record Track Tips */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quick Tips</Text>
              <View style={styles.tipsList}>
                <View style={styles.tipItem}>
                  <Ionicons name="bulb" size={20} color={theme.colors.accent} style={styles.tipIconStyle} />
                  <Text style={styles.tipText}>
                    Use the loop feature to practice difficult sections by setting start and end markers
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons name="bulb" size={20} color={theme.colors.accent} style={styles.tipIconStyle} />
                  <Text style={styles.tipText}>
                    Share recordings with bandmates via WhatsApp, Viber, or any messaging app
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons name="bulb" size={20} color={theme.colors.accent} style={styles.tipIconStyle} />
                  <Text style={styles.tipText}>
                    Long press a recording to delete it quickly from your list
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <Ionicons name="bulb" size={20} color={theme.colors.accent} style={styles.tipIconStyle} />
                  <Text style={styles.tipText}>
                    Give your recordings descriptive titles to stay organized
                  </Text>
                </View>
              </View>
            </View>

            {/* Record Track FAQ */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
              <TouchableOpacity
                style={styles.faqItem}
                onPress={() => toggleFAQ(200)}
                activeOpacity={0.8}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>How do I record audio?</Text>
                  <Text style={styles.faqIcon}>{expandedIndex === 200 ? '−' : '+'}</Text>
                </View>
                {expandedIndex === 200 && (
                  <Text style={styles.faqAnswer}>
                    Tap the "+" button to open the recorder. Press the red record button to start recording. 
                    Press stop when finished, give your recording a title, and tap "Save".
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.faqItem}
                onPress={() => toggleFAQ(201)}
                activeOpacity={0.8}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>How does the loop feature work?</Text>
                  <Text style={styles.faqIcon}>{expandedIndex === 201 ? '−' : '+'}</Text>
                </View>
                {expandedIndex === 201 && (
                  <Text style={styles.faqAnswer}>
                    During playback, tap the loop button. Drag the markers on the timeline to select the section 
                    you want to loop. The selected portion will repeat continuously until you disable looping.
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.faqItem}
                onPress={() => toggleFAQ(202)}
                activeOpacity={0.8}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>Can I edit the recording title after saving?</Text>
                  <Text style={styles.faqIcon}>{expandedIndex === 202 ? '−' : '+'}</Text>
                </View>
                {expandedIndex === 202 && (
                  <Text style={styles.faqAnswer}>
                    Yes! Open the recording player and tap the edit icon next to the title. 
                    Enter a new title and tap "Save" to update it.
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.faqItem}
                onPress={() => toggleFAQ(203)}
                activeOpacity={0.8}
              >
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>What audio format are recordings saved in?</Text>
                  <Text style={styles.faqIcon}>{expandedIndex === 203 ? '−' : '+'}</Text>
                </View>
                {expandedIndex === 203 && (
                  <Text style={styles.faqAnswer}>
                    Recordings are saved in M4A format, which provides high audio quality while 
                    maintaining reasonable file sizes. This format is widely compatible with most devices and apps.
                  </Text>
                )}
              </TouchableOpacity>
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
  section: {
    marginTop: theme.spacing.md,
  },
  teleprompterSection: {
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary + '40',
    padding: theme.spacing.lg,
    marginTop: theme.spacing.xl,
  },
  gigCalendarSection: {
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary + '40',
    padding: theme.spacing.lg,
    marginTop: theme.spacing.xl,
  },
  recordTrackSection: {
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary + '40',
    padding: theme.spacing.lg,
    marginTop: theme.spacing.xl,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  sectionTitleWithIcon: {
    marginBottom: 0,
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
    fontSize: theme.typography.heading3,
    marginRight: theme.spacing.sm,
  },
  tipIconStyle: {
    marginRight: theme.spacing.sm,
    marginTop: 2,
  },
  tipText: {
    flex: 1,
    fontSize: theme.typography.label,
    color: theme.colors.text,
    lineHeight: theme.typography.label * 1.47,
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
    fontSize: theme.typography.bodyMedium,
    fontWeight: '600',
    color: theme.colors.text,
    marginRight: theme.spacing.sm,
  },
  faqIcon: {
    fontSize: theme.typography.heading2,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  faqAnswer: {
    fontSize: theme.typography.label,
    color: theme.colors.textMuted,
    lineHeight: theme.typography.label * 1.47,
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
    fontSize: theme.typography.bodyMedium,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  controlDescription: {
    fontSize: theme.typography.bodySmall,
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
    fontSize: theme.typography.button,
    fontWeight: '600',
    color: theme.colors.primary,
  },
});
