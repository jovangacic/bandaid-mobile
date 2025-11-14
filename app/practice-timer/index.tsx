import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import SideMenu from '../components/SideMenu';
import theme from '../theme/colors';

export default function PracticeTimer() {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <Layout useSafeArea={true}>
      <View style={styles.container}>
        <PageHeader
          title="Practice Timer"
          count={0}
          onMenuPress={() => setMenuVisible(true)}
        />

        <View style={styles.content}>
          <Text style={styles.comingSoonText}>Coming Soon</Text>
          <Text style={styles.descriptionText}>
            Track and analyze your practice sessions to improve faster.
          </Text>
        </View>

        <SideMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  comingSoonText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.md,
  },
  descriptionText: {
    fontSize: 16,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});
