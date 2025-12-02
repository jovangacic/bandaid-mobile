import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Layout from '../components/Layout';
import SideMenu from '../components/SideMenu';
import { Recording } from '../models/Recording';
import { recordingStorage } from '../services/recordingStorage';
import theme from '../theme/colors';
import { showErrorToast, showSuccessToast } from '../utils/toast';

export default function Recorder() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [title, setTitle] = useState('');
  const [recordingUri, setRecordingUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const startRecording = async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        showErrorToast('Please grant microphone permission to record audio', 'Permission Required');
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );

      setRecording(newRecording);
      setIsRecording(true);
      setDuration(0);

      // Update duration periodically
      newRecording.setOnRecordingStatusUpdate((status) => {
        if (status.isRecording) {
          setDuration(status.durationMillis);
        }
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      showErrorToast('Failed to start recording');
    }
  };

  const stopRecording = async () => {
    if (!recording) return;

    try {
      setIsRecording(false);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      
      if (uri) {
        setRecordingUri(uri);
        const status = await recording.getStatusAsync() as any;
        setDuration(status.durationMillis || 0);
        setShowSaveModal(true);
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      showErrorToast('Failed to stop recording');
    }
  };

  const discardRecording = () => {
    setRecording(null);
    setRecordingUri(null);
    setDuration(0);
    setTitle('');
    setShowSaveModal(false);
  };

  const saveRecording = async () => {
    if (!recordingUri || !title.trim()) {
      showErrorToast('Please enter a title for the recording', 'Validation Error');
      return;
    }

    if (saving) return; // Prevent double-tap

    setSaving(true);
    try {
      const id = Date.now().toString();
      const filename = `recording_${id}.m4a`;
      const newUri = await recordingStorage.getRecordingUri(filename);

      // Copy file to permanent location
      await FileSystem.moveAsync({
        from: recordingUri,
        to: newUri,
      });

      const newRecording: Recording = {
        id,
        title: title.trim(),
        uri: newUri,
        duration,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await recordingStorage.saveRecording(newRecording);
      
      showSuccessToast('Recording saved successfully');
      setShowSaveModal(false);
      router.back();
    } catch (error) {
      console.error('Failed to save recording:', error);
      showErrorToast('Failed to save recording');
      setSaving(false);
    }
  };

  const formatDuration = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleCancel = () => {
    if (isRecording) {
      Alert.alert(
        'Recording in Progress',
        'Stop recording before going back?',
        [
          { text: 'Keep Recording', style: 'cancel' },
          { text: 'Stop & Go Back', style: 'destructive', onPress: async () => {
            if (recording) {
              await recording.stopAndUnloadAsync();
            }
            router.back();
          }},
        ]
      );
    } else {
      router.back();
    }
  };

  return (
    <Layout useSafeArea={true}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.cancelButton}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Record</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <View style={styles.recorderContainer}>
            {/* Microphone Icon */}
            <View style={[styles.microphoneCircle, isRecording && styles.recordingActive]}>
               <Ionicons name="recording" size={56} color={theme.colors.primary} />
            </View>

            {/* Duration Display */}
            <Text style={styles.duration}>{formatDuration(duration)}</Text>

            {/* Recording Status */}
            <Text style={styles.status}>
              {isRecording ? 'Recording...' : 'Ready to Record'}
            </Text>

            {/* Record Button */}
            <TouchableOpacity
              style={[styles.recordButton, isRecording && styles.stopButton]}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <Text style={styles.recordButtonText}>
                {isRecording ? 'Stop' : 'Record'}
              </Text>
            </TouchableOpacity>

            {/* Instructions */}
            {!isRecording && (
              <Text style={styles.instructions}>
                Tap Record to start capturing audio
              </Text>
            )}
          </View>
        </View>

        {/* Save Modal */}
        <Modal
          visible={showSaveModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowSaveModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Save Recording</Text>

              <TextInput
                style={styles.input}
                value={title}
                onChangeText={setTitle}
                placeholder="Enter recording title"
                placeholderTextColor={theme.colors.textMuted}
                autoFocus
              />

              <Text style={styles.modalDuration}>
                Duration: {formatDuration(duration)}
              </Text>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.discardButton]}
                  onPress={discardRecording}
                >
                  <Text style={styles.discardButtonText}>Discard</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton, saving && styles.saveButtonDisabled]}
                  onPress={saveRecording}
                  disabled={saving}
                >
                  {saving ? (
                    <View style={styles.savingContainer}>
                      <ActivityIndicator color="#fff" size="small" />
                      <Text style={[styles.saveButtonText, { marginLeft: 8 }]}>Saving...</Text>
                    </View>
                  ) : (
                    <Text style={styles.saveButtonText}>Save</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        <SideMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  recorderContainer: {
    alignItems: 'center',
    width: '100%',
  },
  microphoneCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: theme.colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  recordingActive: {
    backgroundColor: theme.colors.accent + '20',
    borderWidth: 3,
    borderColor: theme.colors.accent,
  },
  microphoneIcon: {
    fontSize: 64,
  },
  duration: {
    fontSize: 48,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
    fontVariant: ['tabular-nums'],
  },
  status: {
    fontSize: theme.typography.bodyLarge,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xl,
  },
  recordButton: {
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.xl * 2,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
  },
  stopButton: {
    backgroundColor: '#EF4444',
  },
  recordButtonText: {
    fontSize: theme.typography.bodyLarge,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  instructions: {
    fontSize: theme.typography.bodyMedium,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    width: '100%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: theme.typography.heading3,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  input: {
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.bodyMedium,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  modalDuration: {
    fontSize: theme.typography.bodyMedium,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  modalButton: {
    flex: 1,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  discardButton: {
    backgroundColor: theme.colors.backgroundLight,
  },
  discardButtonText: {
    fontSize: theme.typography.bodyMedium,
    fontWeight: '600',
    color: theme.colors.text,
  },
  saveButton: {
    backgroundColor: theme.colors.accent,
  },
  saveButtonText: {
    fontSize: theme.typography.bodyMedium,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
