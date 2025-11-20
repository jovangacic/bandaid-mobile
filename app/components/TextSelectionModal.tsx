import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTexts } from '../context/TextContext';
import theme from '../theme/colors';

const SCREEN_HEIGHT = Dimensions.get('window').height;

interface TextSelectionModalProps {
  visible: boolean;
  playlistId: string;
  currentTextIds: string[]; // Currently selected text IDs in the playlist
  onClose: () => void;
  onSave: (selectedTextIds: string[]) => void;
}

export default function TextSelectionModal({
  visible,
  playlistId,
  currentTextIds,
  onClose,
  onSave,
}: TextSelectionModalProps) {
  const { texts } = useTexts();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (visible) {
      // Load currently selected texts
      setSelectedIds(currentTextIds);
    }
  }, [visible, currentTextIds]);

  const toggleText = (textId: string) => {
    setSelectedIds(prev =>
      prev.includes(textId)
        ? prev.filter(id => id !== textId)
        : [...prev, textId]
    );
  };

  const handleSave = () => {
    onSave(selectedIds);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableOpacity 
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={(e) => e.stopPropagation()}
        >
          <View style={styles.modalContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Select Texts</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {texts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No texts available</Text>
              <Text style={styles.emptySubtext}>
                Create texts from the All Texts page
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.listContainer}>
              {texts.map(text => {
                const isSelected = selectedIds.includes(text.id);
                return (
                  <TouchableOpacity
                    key={text.id}
                    style={[styles.textItem, isSelected && styles.textItemSelected]}
                    onPress={() => toggleText(text.id)}
                  >
                    <View style={styles.checkboxContainer}>
                      <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                        {isSelected && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                    </View>
                    <View style={styles.textInfo}>
                      <Text style={styles.textTitle}>{text.title}</Text>
                      <Text style={styles.textPreview} numberOfLines={2}>
                        {text.content}
                      </Text>
                      <View style={styles.textMeta}>
                        <Text style={styles.speedBadge}>Speed: {text.scrollSpeed}</Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          )}

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <LinearGradient
                colors={[theme.colors.primaryDark, theme.colors.primary, theme.colors.accent]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.saveButtonGradient}
              >
                <Text style={styles.saveButtonText}>
                  Save ({selectedIds.length})
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
    maxHeight: SCREEN_HEIGHT * 0.96,
    minHeight: Math.min(SCREEN_HEIGHT * 0.8, 600),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.backgroundLight,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  closeButton: {
    padding: theme.spacing.sm,
  },
  closeIcon: {
    fontSize: 24,
    color: theme.colors.textMuted,
  },
  listContainer: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  textItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  textItemSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  checkboxContainer: {
    marginRight: theme.spacing.md,
    marginTop: 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: theme.colors.textMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  checkmark: {
    color: theme.colors.background,
    fontSize: 16,
    fontWeight: 'bold',
  },
  textInfo: {
    flex: 1,
  },
  textTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  textPreview: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xs,
    lineHeight: 20,
  },
  textMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  speedBadge: {
    fontSize: 11,
    color: theme.colors.primary,
    fontWeight: '600',
    backgroundColor: theme.colors.primary + '20',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  footer: {
    flexDirection: 'row',
    padding: theme.spacing.lg,
    paddingBottom: 48,
    gap: theme.spacing.md,
    borderTopWidth: 1,
    borderTopColor: theme.colors.backgroundLight,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  saveButton: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  saveButtonGradient: {
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.background,
  },
});
