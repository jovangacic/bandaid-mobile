import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  Image,
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
  icon: keyof typeof Ionicons.glyphMap;
  description: string;
  route: string;
  available: boolean;
}

const TOOLS: Tool[] = [
  {
    id: 'teleprompter',
    name: 'Teleprompter',
    icon: 'mic',
    description: 'The on-stage assistant who never forgets your lines',
    route: '/teleprompter',
    available: true,
  },
  {
    id: 'gigs-calendar',
    name: 'Gigs Calendar',
    icon: 'calendar',
    description: 'Organize your gigs & rehearsals',
    route: '/gigs-calendar',
    available: true,
  },
  {
    id: 'record-track',
    name: 'Record Track',
    icon: 'recording',
    description: 'Record, loop, and listen to your audio tracks',
    route: '/record-track',
    available: true,
  },
  {
    id: 'practice-timer',
    name: 'Practice Timer',
    icon: 'timer',
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
            <Image
              source={require('../assets/images/bandaid-sign-04.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <GradientText text='bandaid' colors={[colors.purple[700], colors.orange[400]]}
              style={{ fontSize: theme.typography.displayLarge }}></GradientText>
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
                  <Ionicons 
                    name={tool.icon} 
                    size={48} 
                    color={!tool.available ? theme.colors.textMuted : theme.colors.primary}
                  />
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
    paddingTop: theme.spacing.sm,
    paddingBottom: 40,
  },
  welcomeSection: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    alignItems: 'center',
  },
  logo: {
    width: theme.isTablet ? 75 : 50,
    height: theme.isTablet ? 75 : 50,
    marginBottom: theme.spacing.sm,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  welcomeText: {
    fontSize: theme.typography.bodyMedium,
    marginTop: theme.spacing.md,
    color: theme.colors.textMuted,
    lineHeight: theme.typography.bodyMedium * 1.5,
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
    fontSize: theme.typography.toolIcon,
  },
  comingSoonBadge: {
    backgroundColor: theme.colors.accent + '30',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  comingSoonText: {
    fontSize: theme.typography.caption,
    fontWeight: 'bold',
    color: theme.colors.accent,
  },
  toolName: {
    fontSize: theme.typography.toolName,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  toolNameDisabled: {
    color: theme.colors.textMuted,
  },
  toolDescription: {
    fontSize: theme.typography.toolDescription,
    color: theme.colors.textMuted,
    lineHeight: theme.typography.toolDescription * 1.47,
  },
  toolDescriptionDisabled: {
    color: theme.colors.textMuted,
  },
});
