import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FloatingActionButton from '../components/FloatingActionButton';
import { usePlaylists } from '../context/PlaylistContext';
import { useTexts } from '../context/TextContext';
import { Playlist } from '../models/Playlist';
import theme from '../theme/colors';
import TeleprompterLayout from './TeleprompterLayout';

export default function PlaylistsScreen() {
  const router = useRouter();
  const { playlists } = usePlaylists();
  const { texts } = useTexts();

  const getTextCountForPlaylist = (playlist: Playlist) => {
    return playlist.textIds.length;
  };

  const handlePlaylistPress = (playlistId: string) => {
    router.push(`/teleprompter/playlist-detail?id=${playlistId}` as any);
  };

  const handleAddPlaylist = () => {
    router.push('/teleprompter/add-playlist' as any);
  };

  const handleEditPlaylist = (playlistId: string) => {
    router.push(`/teleprompter/add-playlist?id=${playlistId}` as any);
  };

  const renderPlaylistItem = ({ item }: { item: Playlist }) => {
    const textCount = getTextCountForPlaylist(item);

    return (
      <TouchableOpacity
        onPress={() => handlePlaylistPress(item.id)}
        style={styles.card}
      >
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <View style={styles.cardInfo}>
              <Text style={styles.title}>{item.name}</Text>
              {item.description && (
                <Text style={styles.description} numberOfLines={2}>
                  {item.description}
                </Text>
              )}
              <Text style={styles.textCount}>
                {textCount} {textCount === 1 ? 'text' : 'texts'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                handleEditPlaylist(item.id);
              }}
              style={styles.editButton}
            >
              <Text style={styles.editIcon}>✎</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <TeleprompterLayout title="Playlists" count={playlists.length}>
      {playlists.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No playlists yet</Text>
          <Text style={styles.emptySubtext}>
            Tap the + button to create your first playlist
          </Text>
        </View>
      ) : (
        <FlatList
          data={playlists}
          renderItem={renderPlaylistItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
      )}

      <FloatingActionButton onPress={handleAddPlaylist} hasBottomNav={true} />
    </TeleprompterLayout>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: theme.spacing.md,
    paddingBottom: 160, // Space for floating action button and bottom nav
  },
  card: {
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  cardContent: {
    padding: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardInfo: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  description: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xs,
  },
  textCount: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  editButton: {
    padding: theme.isTablet ? theme.spacing.md : theme.spacing.sm + 2,
    backgroundColor: theme.colors.primary + '20',
    borderRadius: theme.borderRadius.md,
    minWidth: theme.isTablet ? 48 : 40,
    minHeight: theme.isTablet ? 48 : 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    fontSize: theme.isTablet ? 26 : 22,
    color: theme.colors.primary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: 16,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});
