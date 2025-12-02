import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import FloatingActionButton from '../components/FloatingActionButton';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import SideMenu from '../components/SideMenu';
import { Recording } from '../models/Recording';
import { recordingStorage } from '../services/recordingStorage';
import theme from '../theme/colors';
import { showErrorToast, showSuccessToast } from '../utils/toast';

export default function RecordTrack() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [loading, setLoading] = useState(true);

  const loadRecordings = useCallback(async () => {
    try {
      const loadedRecordings = await recordingStorage.getAllRecordings();
      setRecordings(loadedRecordings);
    } catch (error) {
      console.error('Error loading recordings:', error);
      Alert.alert('Error', 'Failed to load recordings');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Request audio permissions on mount
    Audio.requestPermissionsAsync();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadRecordings();
    }, [loadRecordings])
  );

  const handleNewRecording = () => {
    router.push('/record-track/recorder');
  };

  const handleRecordingPress = (recording: Recording) => {
    router.push({
      pathname: '/record-track/player',
      params: { recordingId: recording.id },
    });
  };

  const handleDeleteRecording = (recording: Recording) => {
    Alert.alert(
      'Delete Recording',
      `Are you sure you want to delete "${recording.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await recordingStorage.deleteRecording(recording.id);
              await loadRecordings();
              showSuccessToast('Recording deleted successfully');
            } catch (error) {
              showErrorToast('Failed to delete recording');
            }
          },
        },
      ]
    );
  };

  const handleShareRecording = async (recording: Recording) => {
    try {
      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert('Error', 'Sharing is not available on this device');
        return;
      }

      await Sharing.shareAsync(recording.uri, {
        mimeType: 'audio/m4a',
        dialogTitle: `Share ${recording.title}`,
        UTI: 'public.audio',
      });
    } catch (error) {
      console.error('Error sharing recording:', error);
      Alert.alert('Error', 'Failed to share recording');
    }
  };

  const formatDuration = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderRecordingItem = ({ item }: { item: Recording }) => {
    return (
      <TouchableOpacity
        style={styles.recordingCard}
        onPress={() => handleRecordingPress(item)}
        onLongPress={() => handleDeleteRecording(item)}
      >
        <View style={styles.recordingHeader}>
          <Ionicons name="musical-notes" size={32} color={theme.colors.primary} />
          <View style={styles.recordingInfo}>
            <Text style={styles.recordingTitle}>{item.title}</Text>
            <Text style={styles.recordingDate}>{formatDate(item.createdAt)}</Text>
          </View>
          <Text style={styles.recordingDuration}>{formatDuration(item.duration)}</Text>
        </View>
        <View style={styles.recordingActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={(e) => {
              e.stopPropagation();
              handleShareRecording(item);
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="share-social" size={20} color={theme.colors.accent} />
            <Text style={styles.actionButtonText}>Share</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Layout useSafeArea={true}>
      <View style={styles.container}>
        <PageHeader
          title="Records"
          count={recordings.length}
          onMenuPress={() => setMenuVisible(true)}
        />

        {loading ? (
          <View style={styles.centerContent}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : recordings.length === 0 ? (
          <View style={styles.centerContent}>
            <Ionicons name="mic" size={64} color={theme.colors.textMuted} />
            <Text style={styles.emptyText}>No recordings yet</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to create your first recording
            </Text>
          </View>
        ) : (
          <FlatList
            data={recordings}
            renderItem={renderRecordingItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        )}

        <FloatingActionButton onPress={handleNewRecording} />

        <SideMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  loadingText: {
    fontSize: theme.typography.bodyMedium,
    color: theme.colors.textMuted,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    fontSize: theme.typography.heading3,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    fontSize: theme.typography.bodyMedium,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  listContent: {
    padding: theme.spacing.md,
  },
  recordingCard: {
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accent,
  },
  recordingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingIcon: {
    fontSize: 32,
    marginRight: theme.spacing.sm,
  },
  recordingInfo: {
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  recordingTitle: {
    fontSize: theme.typography.heading4,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  recordingDate: {
    fontSize: theme.typography.bodySmall,
    color: theme.colors.textMuted,
  },
  recordingDuration: {
    fontSize: theme.typography.bodyMedium,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  recordingActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.md,
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.backgroundLight + '80',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  actionButtonText: {
    fontSize: theme.typography.bodySmall,
    color: theme.colors.accent,
    fontWeight: '500',
  },
  deleteText: {
    color: theme.colors.error,
  },
});
