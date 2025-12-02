import React from 'react';
import { StyleSheet } from 'react-native';
import { BaseToast, ErrorToast, InfoToast } from 'react-native-toast-message';
import theme from '../theme/colors';

export const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={styles.successToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text2NumberOfLines={2}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={styles.errorToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text2NumberOfLines={2}
    />
  ),
  info: (props: any) => (
    <InfoToast
      {...props}
      style={styles.infoToast}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text2NumberOfLines={2}
    />
  ),
};

const styles = StyleSheet.create({
  successToast: {
    borderLeftColor: theme.colors.accent,
    borderLeftWidth: 6,
    backgroundColor: theme.colors.backgroundLight,
    height: 70,
    width: '90%',
  },
  errorToast: {
    borderLeftColor: theme.colors.error,
    borderLeftWidth: 6,
    backgroundColor: theme.colors.backgroundLight,
    height: 70,
    width: '90%',
  },
  infoToast: {
    borderLeftColor: theme.colors.primary,
    borderLeftWidth: 6,
    backgroundColor: theme.colors.backgroundLight,
    height: 70,
    width: '90%',
  },
  contentContainer: {
    paddingHorizontal: 15,
    backgroundColor: theme.colors.backgroundLight,
  },
  text1: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  text2: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
});
