import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Layout from '../components/Layout';
import TextSelectionModal from '../components/TextSelectionModal';
import { usePlaylists } from '../context/PlaylistContext';
import { createPlaylist } from '../models/Playlist';
import theme from '../theme/colors';

export default function AddPlaylistScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { playlists, savePlaylistWithTexts, deletePlaylistWithConfirmation } = usePlaylists();
  
  const isEditing = !!id;
  const playlistToEdit = isEditing ? playlists.find(p => p.id === id) : null;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedTextIds, setSelectedTextIds] = useState<string[]>([]);
  const [textModalVisible, setTextModalVisible] = useState(false);

  useEffect(() => {
    if (playlistToEdit) {
      setName(playlistToEdit.name);
      setDescription(playlistToEdit.description || '');
      setSelectedTextIds(playlistToEdit.textIds);
    }
  }, [playlistToEdit]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a playlist name');
      return;
    }

    try {
      const playlistData = isEditing && playlistToEdit ? {
        name: name.trim(),
        description: description.trim() || undefined,
      } : createPlaylist({
        name: name.trim(),
        description: description.trim() || undefined,
      });

      const currentTextIds = isEditing && playlistToEdit ? playlistToEdit.textIds : [];
      
      await savePlaylistWithTexts(
        playlistData as any,
        selectedTextIds,
        isEditing && playlistToEdit ? playlistToEdit.id : undefined,
        currentTextIds
      );

      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save playlist');
    }
  };

  const handleDelete = async () => {
    if (!playlistToEdit) return;
    await deletePlaylistWithConfirmation(playlistToEdit, () => router.back());
  };

  return (
    <Layout>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.title}>
              {isEditing ? 'Edit Playlist' : 'New Playlist'}
            </Text>
            <View style={styles.placeholder} />
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Playlist Name*</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Enter playlist name"
                placeholderTextColor={theme.colors.textMuted}
                maxLength={100}
              />
              <Text style={styles.charCount}>{name.length}/100</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={description}
                onChangeText={setDescription}
                placeholder="Enter playlist description"
                placeholderTextColor={theme.colors.textMuted}
                multiline
                numberOfLines={4}
                maxLength={300}
                textAlignVertical="top"
              />
              <Text style={styles.charCount}>{description.length}/300</Text>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Texts</Text>
              <TouchableOpacity
                style={styles.textsButton}
                onPress={() => setTextModalVisible(true)}
              >
                <Text style={styles.textsButtonText}>
                  {selectedTextIds.length === 0
                    ? 'Select texts for this playlist'
                    : `${selectedTextIds.length} text${selectedTextIds.length === 1 ? '' : 's'} selected`}
                </Text>
                <Text style={styles.textsButtonIcon}>›</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, !name.trim() && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={!name.trim()}
          >
            <LinearGradient
              colors={
                name.trim()
                  ? [theme.colors.primaryDark, theme.colors.primary, theme.colors.accent]
                  : [theme.colors.textMuted, theme.colors.textMuted]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButtonGradient}
            >
              <Text style={styles.saveButtonText}>
                {isEditing ? 'Update' : 'Create'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          </View>

          {isEditing && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
            >
              <Text style={styles.deleteButtonText}>Delete Playlist</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <TextSelectionModal
        visible={textModalVisible}
        playlistId={id || ''}
        currentTextIds={selectedTextIds}
        onClose={() => setTextModalVisible(false)}
        onSave={(ids) => setSelectedTextIds(ids)}
      />
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  cancelButton: {
    padding: theme.spacing.xs,
  },
  cancelText: {
    color: theme.colors.accent,
    fontSize: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  placeholder: {
    width: 60,
  },
  form: {
    // Padding is now in scrollContent
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  textArea: {
    minHeight: 120,
    maxHeight: 200,
  },
  charCount: {
    fontSize: 12,
    color: theme.colors.textMuted,
    textAlign: 'right',
    marginTop: theme.spacing.xs,
  },
  textsButton: {
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.colors.primary + '40',
  },
  textsButtonText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  textsButtonIcon: {
    fontSize: 24,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    paddingVertical: theme.spacing.lg,
    gap: theme.spacing.md,
    marginTop: theme.spacing.lg,
  },
  footerCancelButton: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.backgroundLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerCancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  saveButton: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  saveButtonDisabled: {
    opacity: 0.5,
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
  deleteButton: {
    padding: theme.spacing.md,
    backgroundColor: '#ef444420',
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ef4444',
  },
});
