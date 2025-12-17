import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FloatingActionButton from '../components/FloatingActionButton';
import SearchInput from '../components/SearchInput';
import { usePlaylists } from '../context/PlaylistContext';
import { Playlist } from '../models/Playlist';
import theme from '../theme/colors';
import TeleprompterLayout from './TeleprompterLayout';

export default function PlaylistsScreen() {
  const router = useRouter();
  const { playlists } = usePlaylists();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPlaylists = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return playlists;
    return playlists.filter((p) => (p.name || '').toLowerCase().includes(q));
  }, [playlists, searchQuery]);

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
    <TeleprompterLayout title="Playlists" count={filteredPlaylists.length}>
      <SearchInput value={searchQuery} onChangeText={setSearchQuery} placeholder="Search playlists..." />

      {filteredPlaylists.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>
            {playlists.length === 0 ? 'No playlists yet' : 'No playlists found'}
          </Text>
          {playlists.length === 0 && (
            <Text style={styles.emptySubtext}>
              Tap the + button to create your first playlist
            </Text>
          )}
        </View>
      ) : (
        <FlatList
          data={filteredPlaylists}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.backgroundLight,
  },
  searchInput: {
    flex: 1,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    color: theme.colors.text,
  },
  clearButton: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    color: theme.colors.textMuted,
  },
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
