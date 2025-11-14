import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import theme from '../theme/colors';

interface LayoutProps {
  children?: React.ReactNode;
  style?: ViewStyle;
  useSafeArea?: boolean;
}

export default function Layout({ children, style, useSafeArea = true }: LayoutProps) {
  const Container = useSafeArea ? SafeAreaView : View;
  
  return (
    <Container style={[styles.container, style]}>
      {children}
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
});
