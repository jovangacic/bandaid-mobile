import { useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import GradientText from './components/GradientText';
import Layout from './components/Layout';
import PageHeader from './components/PageHeader';
import SideMenu from './components/SideMenu';
import theme, { colors } from './theme/colors';

interface Tool {
  id: string;
  name: string;
  icon: string;
  description: string;
  route: string;
  available: boolean;
}

const TOOLS: Tool[] = [
  {
    id: 'teleprompter',
    name: 'Teleprompter',
    icon: '🎤',
    description: 'The on-stage assistant who never forgets your lines',
    route: '/teleprompter',
    available: true,
  },
  {
    id: 'metronome',
    name: 'Metronome',
    icon: '🥁',
    description: 'Practice with precision timing',
    route: '/metronome',
    available: false,
  },
  {
    id: 'tuner',
    name: 'Tuner',
    icon: '🎸',
    description: 'Keep your instruments in tune',
    route: '/tuner',
    available: false,
  },
  {
    id: 'gig-manager',
    name: 'Gig Manager',
    icon: '📋',
    description: 'Organize your gigs & rehearsals',
    route: '/gig-manager',
    available: false,
  },
  {
    id: 'practice-timer',
    name: 'Practice Timer',
    icon: '⏱️',
    description: 'Track your practice sessions',
    route: '/practice-timer',
    available: false,
  },
];

export default function ToolsHome() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = React.useState(false);

  const handleToolPress = (tool: Tool) => {
    if (tool.available && tool.route) {
      router.push(tool.route as any);
    }
  };

  return (
    <Layout useSafeArea={true}>
      <View style={styles.container}>
        <PageHeader
          title="Tools"
          onMenuPress={() => setMenuVisible(true)}
        />

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <View style={styles.welcomeSection}>
            <GradientText text='bandaid' colors={[colors.purple[700], colors.orange[400]]}
              style={{ fontSize: 40 }}></GradientText>
            <Text style={styles.welcomeText}>
              The toolbox for musicians. Select a tool below to get started.
            </Text>
          </View>

          <View style={styles.toolsGrid}>
            {TOOLS.map((tool) => (
              <TouchableOpacity
                key={tool.id}
                style={[
                  styles.toolCard,
                  !tool.available && styles.toolCardDisabled,
                ]}
                onPress={() => handleToolPress(tool)}
                disabled={!tool.available}
                activeOpacity={0.7}
              >
                <View style={styles.toolHeader}>
                  <Text style={styles.toolIcon}>{tool.icon}</Text>
                  {!tool.available && (
                    <View style={styles.comingSoonBadge}>
                      <Text style={styles.comingSoonText}>Soon</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.toolName, !tool.available && styles.toolNameDisabled]}>
                  {tool.name}
                </Text>
                <Text style={[styles.toolDescription, !tool.available && styles.toolDescriptionDisabled]}>
                  {tool.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <SideMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.md,
    paddingBottom: 40,
  },
  welcomeSection: {
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  welcomeText: {
    fontSize: 16,
    marginTop: theme.spacing.md,
    color: theme.colors.textMuted,
    lineHeight: 24,
    textAlign: 'center',
  },
  toolsGrid: {
    gap: theme.spacing.md,
  },
  toolCard: {
    backgroundColor: theme.colors.backgroundLight,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.primary + '40',
  },
  toolCardDisabled: {
    opacity: 0.5,
    borderColor: theme.colors.textMuted + '20',
  },
  toolHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  toolIcon: {
    fontSize: 48,
  },
  comingSoonBadge: {
    backgroundColor: theme.colors.accent + '30',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  comingSoonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: theme.colors.accent,
  },
  toolName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  toolNameDisabled: {
    color: theme.colors.textMuted,
  },
  toolDescription: {
    fontSize: 15,
    color: theme.colors.textMuted,
    lineHeight: 22,
  },
  toolDescriptionDisabled: {
    color: theme.colors.textMuted,
  },
});
