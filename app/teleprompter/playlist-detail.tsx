import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import FloatingActionButton from '../components/FloatingActionButton';
import Layout from '../components/Layout';
import SideMenu from '../components/SideMenu';
import TextList from '../components/TextList';
import TextSelectionModal from '../components/TextSelectionModal';
import { usePlaylists } from '../context/PlaylistContext';
import { useTexts } from '../context/TextContext';
import theme from '../theme/colors';

export default function PlaylistDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { playlists, addTextToPlaylist, removeTextFromPlaylist, reorderTextsInPlaylist } = usePlaylists();
  const { texts } = useTexts();
  const [menuVisible, setMenuVisible] = useState(false);
  const [textSelectionVisible, setTextSelectionVisible] = useState(false);

  const playlist = playlists.find(p => p.id === id);

  if (!playlist) {
    return (
      <Layout>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Playlist not found</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </Layout>
    );
  }

  // Get texts in the order specified by the playlist's textIds array
  const playlistTexts = playlist.textIds
    .map(textId => texts.find(t => t.id === textId))
    .filter((text): text is NonNullable<typeof text> => text !== undefined);

  const handleTextPress = (text: any) => {
    const currentIndex = playlistTexts.findIndex(t => t.id === text.id);
    router.push(`/teleprompter/text-view?id=${text.id}&currentIndex=${currentIndex}` as any);
  };

  const handleReorder = async (reorderedTexts: any[]) => {
    const reorderedTextIds = reorderedTexts.map(text => text.id);
    await reorderTextsInPlaylist(playlist.id, reorderedTextIds);
  };

  const handleEdit = (text: any) => {
    router.push(`/teleprompter/add-text?id=${text.id}` as any);
  };

  const handleAddTexts = () => {
    setTextSelectionVisible(true);
  };

  const handleSaveTextSelection = async (selectedTextIds: string[]) => {
    if (!playlist) return;

    const currentTextIds = playlist.textIds;

    // Add newly selected texts
    for (const textId of selectedTextIds) {
      if (!currentTextIds.includes(textId)) {
        await addTextToPlaylist(playlist.id, textId);
      }
    }

    // Remove unselected texts
    for (const textId of currentTextIds) {
      if (!selectedTextIds.includes(textId)) {
        await removeTextFromPlaylist(playlist.id, textId);
      }
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Layout>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>

          <MaskedView
            style={styles.titleContainer}
            maskElement={
              <Text style={styles.title} numberOfLines={1}>{playlist.name}</Text>
            }
          >
            <LinearGradient
              colors={[theme.colors.primaryDark, theme.colors.primary, theme.colors.accent]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradient}
            >
              <Text style={[styles.title, styles.transparentText]} numberOfLines={1}>
                {playlist.name}
              </Text>
            </LinearGradient>
          </MaskedView>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setMenuVisible(true)}
          >
            <Text style={styles.menuIcon}>☰</Text>
          </TouchableOpacity>
        </View>

        {playlist.description && (
          <View style={styles.descriptionContainer}>
            <Text style={styles.description}>{playlist.description}</Text>
          </View>
        )}

        <View style={styles.countBadge}>
          <Text style={styles.countText}>
            {playlistTexts.length} {playlistTexts.length === 1 ? 'text' : 'texts'}
          </Text>
        </View>

        {playlistTexts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No texts in this playlist</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to add texts to this playlist
            </Text>
          </View>
        ) : (
          <TextList
            texts={playlistTexts}
            onTextPress={handleTextPress}
            onReorder={handleReorder}
            onEdit={handleEdit}
          />
        )}

        <FloatingActionButton onPress={handleAddTexts} />
        <SideMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
        
        <TextSelectionModal
          visible={textSelectionVisible}
          playlistId={playlist.id}
          currentTextIds={playlist.textIds}
          onClose={() => setTextSelectionVisible(false)}
          onSave={handleSaveTextSelection}
        />
      </Layout>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.md,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  backText: {
    color: theme.colors.accent,
    fontSize: 16,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: theme.spacing.md,
  },
  gradient: {
    paddingHorizontal: theme.spacing.lg,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  transparentText: {
    opacity: 0,
  },
  menuButton: {
    padding: theme.spacing.sm,
  },
  menuIcon: {
    fontSize: 28,
    color: theme.colors.text,
  },
  descriptionContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.sm,
  },
  description: {
    fontSize: 14,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  countBadge: {
    alignSelf: 'center',
    backgroundColor: theme.colors.primary + '30',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.primary + '60',
  },
  countText: {
    fontSize: 12,
    color: theme.colors.primary,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.lg,
  },
});
