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
import { usePlaylists } from '../context/PlaylistContext';
import theme from '../theme/colors';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

interface PlaylistSelectionModalProps {
  visible: boolean;
  textId?: string; // If provided, shows currently selected playlists
  onClose: () => void;
  onSave: (selectedPlaylistIds: string[]) => void;
}

export default function PlaylistSelectionModal({
  visible,
  textId,
  onClose,
  onSave,
}: PlaylistSelectionModalProps) {
  const { playlists, getPlaylistsForText } = usePlaylists();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (visible && textId) {
      // Load currently selected playlists
      const currentPlaylists = getPlaylistsForText(textId);
      setSelectedIds(currentPlaylists.map(p => p.id));
    } else if (visible && !textId) {
      // Reset selection for new text
      setSelectedIds([]);
    }
  }, [visible, textId]);

  const togglePlaylist = (playlistId: string) => {
    setSelectedIds(prev =>
      prev.includes(playlistId)
        ? prev.filter(id => id !== playlistId)
        : [...prev, playlistId]
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
            <Text style={styles.title}>Select Playlists</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          {playlists.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No playlists yet</Text>
              <Text style={styles.emptySubtext}>
                Create playlists from the Playlists page
              </Text>
            </View>
          ) : (
            <ScrollView style={styles.listContainer}>
              {playlists.map(playlist => {
                const isSelected = selectedIds.includes(playlist.id);
                return (
                  <TouchableOpacity
                    key={playlist.id}
                    style={[styles.playlistItem, isSelected && styles.playlistItemSelected]}
                    onPress={() => togglePlaylist(playlist.id)}
                  >
                    <View style={styles.checkboxContainer}>
                      <View style={[styles.checkbox, isSelected && styles.checkboxChecked]}>
                        {isSelected && <Text style={styles.checkmark}>✓</Text>}
                      </View>
                    </View>
                    <View style={styles.playlistInfo}>
                      <Text style={styles.playlistName}>{playlist.name}</Text>
                      {playlist.description && (
                        <Text style={styles.playlistDescription} numberOfLines={1}>
                          {playlist.description}
                        </Text>
                      )}
                      <Text style={styles.textCount}>
                        {playlist.textIds.length} {playlist.textIds.length === 1 ? 'text' : 'texts'}
                      </Text>
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
    minHeight: Math.min(SCREEN_HEIGHT * 0.75, 550),
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
  playlistItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  playlistItemSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary + '10',
  },
  checkboxContainer: {
    marginRight: theme.spacing.md,
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
  playlistInfo: {
    flex: 1,
  },
  playlistName: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  playlistDescription: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xs,
  },
  textCount: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
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
