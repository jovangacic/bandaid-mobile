import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import theme from '../theme/colors';

interface FormHeaderProps {
  title: string;
  onCancel: () => void;
}

export default function FormHeader({ title, onCancel }: FormHeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity onPress={onCancel} style={styles.cancelButton}>
        <Text style={styles.cancelText}>Cancel</Text>
      </TouchableOpacity>
      <Text style={styles.headerTitle}>{title}</Text>
      <View style={styles.placeholder} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.backgroundLight,
  },
  cancelButton: {
    padding: theme.spacing.xs,
  },
  cancelText: {
    color: theme.colors.accent,
    fontSize: theme.typography.bodyMedium,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: theme.typography.heading3,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  placeholder: {
    width: 60,
  },
});
