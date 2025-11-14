import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import SideMenu from '../components/SideMenu';
import TeleprompterBottomNav from './TeleprompterBottomNav';

interface TeleprompterLayoutProps {
  title: string;
  count?: number;
  children: React.ReactNode;
}

export default function TeleprompterLayout({ title, count, children }: TeleprompterLayoutProps) {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <Layout useSafeArea={true}>
      <View style={styles.container}>
        <PageHeader
          title={title}
          count={count}
          onMenuPress={() => setMenuVisible(true)}
        />

        <View style={styles.content}>
          {children}
        </View>

        {/* Bottom Navigation - Static */}
        <TeleprompterBottomNav />

        {/* Side Menu */}
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
  },
});
