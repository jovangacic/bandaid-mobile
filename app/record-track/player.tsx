import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { Audio } from 'expo-av';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useRef, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
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

// Helper function to interpolate between two hex colors
const interpolateColor = (color1: string, color2: string, factor: number): string => {
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');
  
  const r1 = parseInt(hex1.substring(0, 2), 16);
  const g1 = parseInt(hex1.substring(2, 4), 16);
  const b1 = parseInt(hex1.substring(4, 6), 16);
  
  const r2 = parseInt(hex2.substring(0, 2), 16);
  const g2 = parseInt(hex2.substring(2, 4), 16);
  const b2 = parseInt(hex2.substring(4, 6), 16);
  
  const r = Math.round(r1 + (r2 - r1) * factor);
  const g = Math.round(g1 + (g2 - g1) * factor);
  const b = Math.round(b1 + (b2 - b1) * factor);
  
  const toHex = (n: number) => {
    const hex = n.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export default function Player() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const recordingId = params.recordingId as string;

  const [menuVisible, setMenuVisible] = useState(false);
  const [recording, setRecording] = useState<Recording | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [position, setPosition] = useState(0);
  const [duration, setDuration] = useState(0);
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [saving, setSaving] = useState(false);

  const [loopEnabled, setLoopEnabled] = useState(false);
  const [loopStart, setLoopStart] = useState(0);
  const [loopEnd, setLoopEnd] = useState(0);
  const [showLoopControls, setShowLoopControls] = useState(false);

  // Refs to avoid stale closures in playback callback
  const loopEnabledRef = useRef(false);
  const loopStartRef = useRef(0);
  const loopEndRef = useRef(0);

  // Update refs when loop values change
  useEffect(() => {
    loopEnabledRef.current = loopEnabled;
    loopStartRef.current = loopStart;
    loopEndRef.current = loopEnd;
  }, [loopEnabled, loopStart, loopEnd]);

  useEffect(() => {
    loadRecording();
    return () => {
      if (soundRef.current) {
        soundRef.current.stopAsync().catch(() => {});
        soundRef.current.unloadAsync().catch(() => {});
      }
    };
  }, [recordingId]);

  const loadRecording = async () => {
    try {
      const recordings = await recordingStorage.getAllRecordings();
      const found = recordings.find((r) => r.id === recordingId);

      if (found) {
        setRecording(found);
        setEditTitle(found.title);
        setDuration(found.duration);
        await loadSound(found.uri);
      } else {
        Alert.alert('Error', 'Recording not found', [
          { text: 'OK', onPress: () => router.back() },
        ]);
      }
    } catch (error) {
      console.error('Error loading recording:', error);
      Alert.alert('Error', 'Failed to load recording');
    }
  };

  const loadSound = async (uri: string) => {
    try {
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri },
        { 
          shouldPlay: false,
          progressUpdateIntervalMillis: 50,
        },
        onPlaybackStatusUpdate
      );
      setSound(newSound);
      soundRef.current = newSound;
    } catch (error) {
      console.error('Error loading sound:', error);
      Alert.alert('Error', 'Failed to load audio file');
    }
  };

  const onPlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded) {
      setPosition(status.positionMillis);
      setDuration(status.durationMillis || duration);
      setIsPlaying(status.isPlaying);

      // Handle loop - use refs to get current values
      const isLooping = loopEnabledRef.current;
      const startPos = loopStartRef.current;
      const endPos = loopEndRef.current;
      
      if (isLooping && endPos > startPos && status.positionMillis >= endPos) {
        soundRef.current?.setPositionAsync(startPos);
      }
    }
  };

  const togglePlayPause = async () => {
    if (!sound) return;

    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      const status = await sound.getStatusAsync();
      if (status.isLoaded) {
        // If loop is enabled, start from loop start if outside loop range
        if (loopEnabled && loopEnd > loopStart) {
          if (status.positionMillis < loopStart || status.positionMillis >= loopEnd) {
            await sound.setPositionAsync(loopStart);
          }
        } else if (status.durationMillis && status.positionMillis >= status.durationMillis - 100) {
          await sound.setPositionAsync(0);
        }
      }
      await sound.playAsync();
    }
  };

  const seekTo = async (value: number) => {
    if (!sound) return;
    await sound.setPositionAsync(value);
  };

  const handleSliderChange = (value: number) => {
    seekTo(value);
  };

  const handleSaveTitle = async () => {
    if (!recording || !editTitle.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (saving) return; // Prevent double-tap

    setSaving(true);
    try {
      const updatedRecording = {
        ...recording,
        title: editTitle.trim(),
        updatedAt: new Date().toISOString(),
      };

      await recordingStorage.saveRecording(updatedRecording);
      setRecording(updatedRecording);
      setShowEditModal(false);
    } catch (error) {
      Alert.alert('Error', 'Failed to update title');
      setSaving(false);
    }
  };

  const handleShare = async () => {
    if (!recording) return;

    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Error', 'Sharing is not available on this device');
        return;
      }

      await Sharing.shareAsync(recording.uri, {
        mimeType: 'audio/x-m4a',
        dialogTitle: `Share ${recording.title}`,
        UTI: 'public.audio',
      });
    } catch (error) {
      console.error('Error sharing recording:', error);
      Alert.alert('Error', 'Failed to share recording');
    }
  };

  const toggleLoopMode = () => {
    if (loopEnabled) {
      // Disable loop
      setLoopEnabled(false);
      setShowLoopControls(false);
      setLoopStart(0);
      setLoopEnd(0);
    } else {
      // Enable loop mode - show controls
      setShowLoopControls(true);
      if (loopStart === 0 && loopEnd === 0) {
        // Initialize with full duration
        setLoopStart(0);
        setLoopEnd(duration);
      }
    }
  };

  const activateLoop = () => {
    if (loopStart >= loopEnd) {
      Alert.alert('Error', 'Loop start must be before loop end');
      return;
    }
    setLoopEnabled(true);
    setShowLoopControls(false);
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleCancel = () => {
    router.back();
  };

  if (!recording) {
    return (
      <Layout useSafeArea={true}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleCancel} style={styles.headerCancelButton}>
              <Text style={styles.headerCancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Player</Text>
            <View style={styles.placeholder} />
          </View>
          <View style={styles.centerContent}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </View>
      </Layout>
    );
  }

  return (
    <Layout useSafeArea={true}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleCancel} style={styles.headerCancelButton}>
            <Text style={styles.headerCancelText}>Cancel</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Player</Text>
          <TouchableOpacity onPress={handleShare} style={styles.headerShareButton}>
            <Ionicons name="share-social" size={24} color={theme.colors.accent} />
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.content} 
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.infoCard}>
            <TouchableOpacity onPress={() => setShowEditModal(true)}>
              <Text style={styles.recordingTitle}>{recording.title}</Text>
              <Text style={styles.editHint}>Tap to edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.sliderContainer}>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={duration}
              value={position}
              onSlidingComplete={handleSliderChange}
              minimumTrackTintColor={interpolateColor(
                theme.colors.primary,
                theme.colors.accent,
                position / duration
              )}
              maximumTrackTintColor={theme.colors.backgroundLight}
              thumbTintColor={theme.colors.accent}
            />
            
            {/* Loop range indicators */}
            {(loopEnabled || showLoopControls) && loopEnd > loopStart && (
              <View style={styles.loopRangeContainer}>
                <View 
                  style={[
                    styles.loopRangeHighlight,
                    {
                      left: `${(loopStart / duration) * 100}%`,
                      width: `${((loopEnd - loopStart) / duration) * 100}%`,
                    }
                  ]} 
                />
              </View>
            )}
          </View>

          {/* Loop controls - shown when setting up loop */}
          {showLoopControls && (
            <View style={styles.loopControlsSection}>
              <View style={styles.loopControlRow}>
                <Text style={styles.loopControlLabel}>Start: {formatTime(loopStart)}</Text>
                <Slider
                  style={styles.loopControlSlider}
                  minimumValue={0}
                  maximumValue={duration}
                  value={loopStart}
                  onValueChange={setLoopStart}
                  minimumTrackTintColor={theme.colors.primary}
                  maximumTrackTintColor={theme.colors.backgroundLight}
                  thumbTintColor={theme.colors.primary}
                />
              </View>
              <View style={styles.loopControlRow}>
                <Text style={styles.loopControlLabel}>End: {formatTime(loopEnd)}</Text>
                <Slider
                  style={styles.loopControlSlider}
                  minimumValue={0}
                  maximumValue={duration}
                  value={loopEnd}
                  onValueChange={setLoopEnd}
                  minimumTrackTintColor={theme.colors.accent}
                  maximumTrackTintColor={theme.colors.backgroundLight}
                  thumbTintColor={theme.colors.accent}
                />
              </View>
              <TouchableOpacity onPress={activateLoop} style={styles.activateLoopButton}>
                <Text style={styles.activateLoopText}>Activate Loop</Text>
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            {loopEnabled && (
              <Text style={styles.loopIndicatorText}>
                🔁 {formatTime(loopStart)} - {formatTime(loopEnd)}
              </Text>
            )}
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>

          <View style={styles.controlsContainer}>
            <TouchableOpacity
              style={[
                styles.loopButton,
                (loopEnabled || showLoopControls) && styles.loopButtonActive
              ]}
              onPress={toggleLoopMode}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="repeat" 
                size={24} 
                color={(loopEnabled || showLoopControls) ? theme.colors.accent : theme.colors.text}
              />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.playButton}
              onPress={togglePlayPause}
              activeOpacity={0.7}
            >
              <Ionicons 
                name={isPlaying ? 'pause' : 'play'} 
                size={36} 
                color={theme.colors.background}
              />
            </TouchableOpacity>
          </View>
        </ScrollView>

        <SideMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />

        {/* Edit Title Modal */}
        <Modal
          visible={showEditModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowEditModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Title</Text>
              <TextInput
                style={styles.modalInput}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="Enter title"
                placeholderTextColor={theme.colors.textMuted}
                autoFocus
              />
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setShowEditModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.saveButton, saving && styles.saveButtonDisabled]}
                  onPress={handleSaveTitle}
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
  headerCancelButton: {
    padding: theme.spacing.xs,
  },
  headerCancelText: {
    color: theme.colors.accent,
    fontSize: theme.typography.bodyMedium,
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: theme.typography.heading3,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  headerShareButton: {
    padding: theme.spacing.xs,
  },
  placeholder: {
    width: 60,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.colors.text,
    fontSize: theme.typography.bodyMedium,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
    paddingBottom: theme.spacing.xl * 2,
  },
  infoCard: {
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  recordingTitle: {
    fontSize: theme.typography.heading3,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  editHint: {
    fontSize: theme.typography.bodySmall,
    color: theme.colors.textMuted,
  },
  sliderContainer: {
    marginBottom: theme.spacing.md,
    position: 'relative',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  loopRangeContainer: {
    position: 'absolute',
    top: 15,
    left: 0,
    right: 0,
    height: 10,
    pointerEvents: 'none',
  },
  loopRangeHighlight: {
    position: 'absolute',
    height: '100%',
    backgroundColor: theme.colors.accent + '40',
    borderLeftWidth: 2,
    borderRightWidth: 2,
    borderColor: theme.colors.accent,
  },
  loopControlsSection: {
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  loopControlRow: {
    marginBottom: theme.spacing.sm,
  },
  loopControlLabel: {
    fontSize: theme.typography.bodySmall,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  loopControlSlider: {
    width: '100%',
    height: 30,
  },
  activateLoopButton: {
    backgroundColor: theme.colors.accent,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  activateLoopText: {
    color: theme.colors.background,
    fontSize: theme.typography.bodyMedium,
    fontWeight: '600',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  timeText: {
    fontSize: theme.typography.bodyMedium,
    color: theme.colors.text,
    fontWeight: '500',
  },
  loopIndicatorText: {
    fontSize: theme.typography.bodySmall,
    color: theme.colors.accent,
    fontWeight: '600',
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.lg,
    gap: theme.spacing.lg,
  },
  loopButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.backgroundLight,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  loopButtonActive: {
    borderColor: theme.colors.accent,
    backgroundColor: theme.colors.accent + '20',
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: theme.colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
  modalInput: {
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.typography.bodyMedium,
    color: theme.colors.text,
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
  cancelButton: {
    backgroundColor: theme.colors.backgroundLight,
  },
  cancelButtonText: {
    color: theme.colors.text,
    fontSize: theme.typography.bodyMedium,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: theme.colors.accent,
  },
  saveButtonText: {
    color: theme.colors.background,
    fontSize: theme.typography.bodyMedium,
    fontWeight: '600',
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
