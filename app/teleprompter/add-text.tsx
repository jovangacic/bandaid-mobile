import Slider from '@react-native-community/slider';
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
import PlaylistSelectionModal from '../components/PlaylistSelectionModal';
import { usePlaylists } from '../context/PlaylistContext';
import { useSettings } from '../context/SettingsContext';
import { useTexts } from '../context/TextContext';
import { createText } from '../models/Text';
import theme from '../theme/colors';

const MAX_CONTENT_LENGTH = 3000;

export default function AddText() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { texts, saveTextWithPlaylists, deleteTextWithConfirmation } = useTexts();
  const { getPlaylistsForText } = usePlaylists();
  const { settings } = useSettings();
  
  // Check if we're editing an existing text
  const isEditing = !!id;
  const textToEdit = isEditing ? texts.find(t => t.id === id) : null;
  
  const [title, setTitle] = useState(textToEdit?.title || '');
  const [content, setContent] = useState(textToEdit?.content || '');
  const [scrollSpeed, setScrollSpeed] = useState(textToEdit?.scrollSpeed || settings.defaultSpeed || 10);
  const [fontSize, setFontSize] = useState(textToEdit?.fontSize || settings.defaultFontSize || 24);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [playlistModalVisible, setPlaylistModalVisible] = useState(false);
  const [selectedPlaylistIds, setSelectedPlaylistIds] = useState<string[]>([]);

  // Initialize values when text or settings load
  useEffect(() => {
    if (textToEdit) {
      setTitle(textToEdit.title);
      setContent(textToEdit.content);
      setScrollSpeed(textToEdit.scrollSpeed);
      setFontSize(textToEdit.fontSize || settings.defaultFontSize || 24);
    }
  }, [textToEdit, settings.defaultFontSize]);

  // Load playlist selections when editing
  useEffect(() => {
    if (isEditing && id) {
      const textPlaylists = getPlaylistsForText(id);
      setSelectedPlaylistIds(textPlaylists.map(p => p.id));
    }
  }, [isEditing, id]);

  const handleSubmit = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content');
      return;
    }

    if (content.length > MAX_CONTENT_LENGTH) {
      Alert.alert('Error', `Content must be less than ${MAX_CONTENT_LENGTH} characters`);
      return;
    }

    try {
      setIsSubmitting(true);
      
      const textData = isEditing && id ? {
        title: title.trim(),
        content: content,
        scrollSpeed,
        fontSize,
        dateModified: new Date(),
      } : createText({
        title: title.trim(),
        content: content,
        scrollSpeed,
        fontSize,
        order: texts.length,
      });
      
      const currentPlaylistIds = isEditing && id 
        ? getPlaylistsForText(id).map(p => p.id)
        : [];
      
      await saveTextWithPlaylists(
        textData as any,
        selectedPlaylistIds,
        isEditing && id ? id : undefined,
        currentPlaylistIds
      );
      
      router.back();
    } catch (error) {
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'save'} text. Please try again.`);
      console.error(`Error ${isEditing ? 'updating' : 'saving'} text:`, error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!textToEdit) return;
    await deleteTextWithConfirmation(textToEdit, () => router.back());
  };

  const handleCancel = () => {
    const hasChanges = isEditing
      ? (title !== textToEdit?.title || content !== textToEdit?.content || scrollSpeed !== textToEdit?.scrollSpeed)
      : (title || content);

    if (hasChanges) {
      Alert.alert(
        'Discard Changes?',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
        ]
      );
    } else {
      router.back();
    }
  };

  const contentLength = content.length;
  const isContentTooLong = contentLength > MAX_CONTENT_LENGTH;

  return (
    <Layout useSafeArea={true}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
        keyboardVerticalOffset={0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{isEditing ? 'Edit Text' : 'New Text'}</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Title Input */}
          <View style={styles.section}>
            <Text style={styles.label}>Title</Text>
            <TextInput
              style={styles.titleInput}
              placeholder="Enter title..."
              placeholderTextColor={theme.colors.textMuted}
              value={title}
              onChangeText={setTitle}
              maxLength={100}
              returnKeyType="next"
            />
          </View>

          {/* Content Input */}
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Content</Text>
              <View style={styles.countsContainer}>
                {settings.showWordCount && (
                  <Text style={styles.charCount}>
                    {content.trim().split(/\s+/).filter(w => w).length} words
                  </Text>
                )}
                <Text
                  style={[
                    styles.charCount,
                    isContentTooLong && styles.charCountError,
                  ]}
                >
                  {contentLength}/{MAX_CONTENT_LENGTH}
                </Text>
              </View>
            </View>
            <TextInput
              style={[
                styles.contentInput,
                isContentTooLong && styles.contentInputError,
              ]}
              placeholder="Paste or type your lyrics here..."
              placeholderTextColor={theme.colors.textMuted}
              value={content}
              onChangeText={setContent}
              multiline
              textAlignVertical="top"
              maxLength={MAX_CONTENT_LENGTH + 100} // Allow some buffer for user to see error
            />
          </View>

          {/* Scroll Speed Slider */}
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Scroll Speed</Text>
              <Text style={styles.speedValue}>{scrollSpeed}</Text>
            </View>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Slow</Text>
              <Slider
                style={styles.slider}
                minimumValue={1}
                maximumValue={20}
                step={1}
                value={scrollSpeed}
                onValueChange={setScrollSpeed}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.backgroundLight}
                thumbTintColor={theme.colors.accent}
              />
              <Text style={styles.sliderLabel}>Fast</Text>
            </View>
          </View>

          {/* Font Size Slider */}
          <View style={styles.section}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Font Size</Text>
              <Text style={styles.speedValue}>{fontSize}</Text>
            </View>
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>Small</Text>
              <Slider
                style={styles.slider}
                minimumValue={16}
                maximumValue={48}
                step={1}
                value={fontSize}
                onValueChange={setFontSize}
                minimumTrackTintColor={theme.colors.primary}
                maximumTrackTintColor={theme.colors.backgroundLight}
                thumbTintColor={theme.colors.accent}
              />
              <Text style={styles.sliderLabel}>Large</Text>
            </View>
          </View>

          {/* Playlists Selection */}
          <View style={styles.section}>
            <Text style={styles.label}>Playlists</Text>
            <TouchableOpacity
              style={styles.playlistButton}
              onPress={() => setPlaylistModalVisible(true)}
            >
              <Text style={styles.playlistButtonText}>
                {selectedPlaylistIds.length === 0
                  ? 'Add to playlists'
                  : `${selectedPlaylistIds.length} playlist${selectedPlaylistIds.length === 1 ? '' : 's'} selected`}
              </Text>
              <Text style={styles.playlistButtonIcon}>›</Text>
            </TouchableOpacity>
          </View>

          {/* Footer with Save Button */}
          <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.saveButton,
              (isSubmitting || isContentTooLong || !title.trim() || !content.trim()) &&
                styles.saveButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting || isContentTooLong || !title.trim() || !content.trim()}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={
                isSubmitting || isContentTooLong || !title.trim() || !content.trim()
                  ? [theme.colors.textMuted, theme.colors.textMuted, theme.colors.textMuted]
                  : [theme.colors.primaryDark, theme.colors.primary, theme.colors.accent]
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.saveButtonGradient}
            >
              <Text style={styles.saveButtonText}>
                {isSubmitting ? 'Saving...' : (isEditing ? 'Update' : 'Save')}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          </View>

          {/* Delete Button - Only show when editing */}
          {isEditing && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDelete}
              activeOpacity={0.8}
            >
              <Text style={styles.deleteButtonText}>Delete Text</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <PlaylistSelectionModal
        visible={playlistModalVisible}
        textId={isEditing ? id : undefined}
        onClose={() => setPlaylistModalVisible(false)}
        onSave={(ids) => setSelectedPlaylistIds(ids)}
      />
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
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  placeholder: {
    width: 60,
  },
  section: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  countsContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  titleInput: {
    backgroundColor: theme.colors.backgroundLight,
    color: theme.colors.text,
    fontSize: 16,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary + '40',
  },
  contentInput: {
    backgroundColor: theme.colors.backgroundLight,
    color: theme.colors.text,
    fontSize: 14,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary + '40',
    minHeight: 300,
    lineHeight: 22,
  },
  contentInputError: {
    borderColor: '#ef4444',
  },
  charCount: {
    fontSize: 14,
    color: theme.colors.textMuted,
  },
  charCountError: {
    color: '#ef4444',
    fontWeight: 'bold',
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  slider: {
    flex: 1,
    height: 40,
  },
  sliderLabel: {
    fontSize: 12,
    color: theme.colors.textMuted,
    width: 40,
    textAlign: 'center',
  },
  speedValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.accent,
  },
  playlistButton: {
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.colors.primary + '40',
  },
  playlistButtonText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  playlistButtonIcon: {
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
