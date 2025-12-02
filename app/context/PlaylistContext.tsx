import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Playlist } from '../models/Playlist';
import { playlistStorage } from '../services/playlistStorage';
import { showErrorToast, showSuccessToast } from '../utils/toast';

interface PlaylistContextType {
  playlists: Playlist[];
  loading: boolean;
  addPlaylist: (playlist: Playlist) => Promise<void>;
  updatePlaylist: (id: string, updates: Partial<Playlist>) => Promise<void>;
  deletePlaylist: (id: string) => Promise<void>;
  reorderPlaylists: (playlists: Playlist[]) => Promise<void>;
  reorderTextsInPlaylist: (playlistId: string, reorderedTextIds: string[]) => Promise<void>;
  addTextToPlaylist: (playlistId: string, textId: string) => Promise<void>;
  removeTextFromPlaylist: (playlistId: string, textId: string) => Promise<void>;
  refreshPlaylists: () => Promise<void>;
  getPlaylistsForText: (textId: string) => Playlist[];
  savePlaylistWithTexts: (
    playlist: Playlist,
    textIds: string[],
    existingPlaylistId?: string,
    existingTextIds?: string[]
  ) => Promise<string>;
  deletePlaylistWithConfirmation: (playlist: Playlist, onSuccess: () => void) => Promise<void>;
}

const PlaylistContext = createContext<PlaylistContextType | undefined>(undefined);

interface PlaylistProviderProps {
  children?: ReactNode;
}

export const PlaylistProvider = ({ children }: PlaylistProviderProps) => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPlaylists();
  }, []);

  const loadPlaylists = async () => {
    try {
      setLoading(true);
      const loadedPlaylists = await playlistStorage.getPlaylists();
      const sortedPlaylists = loadedPlaylists.sort((a, b) => a.order - b.order);
      setPlaylists(sortedPlaylists);
    } catch (error) {
      console.error('Failed to load playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const addPlaylist = async (playlist: Playlist) => {
    try {
      const updatedPlaylists = await playlistStorage.addPlaylist(playlist);
      setPlaylists(updatedPlaylists.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Failed to add playlist:', error);
      throw error;
    }
  };

  const updatePlaylist = async (id: string, updates: Partial<Playlist>) => {
    try {
      const updatedPlaylists = await playlistStorage.updatePlaylist(id, updates);
      setPlaylists(updatedPlaylists.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Failed to update playlist:', error);
      throw error;
    }
  };

  const deletePlaylist = async (id: string) => {
    try {
      const updatedPlaylists = await playlistStorage.deletePlaylist(id);
      setPlaylists(updatedPlaylists.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Failed to delete playlist:', error);
      throw error;
    }
  };

  const reorderPlaylists = async (reorderedPlaylists: Playlist[]) => {
    try {
      await playlistStorage.reorderPlaylists(reorderedPlaylists);
      setPlaylists(reorderedPlaylists);
    } catch (error) {
      console.error('Failed to reorder playlists:', error);
      throw error;
    }
  };

  const reorderTextsInPlaylist = async (playlistId: string, reorderedTextIds: string[]) => {
    try {
      // Update the playlist's textIds array with the new order
      await updatePlaylist(playlistId, { textIds: reorderedTextIds });
    } catch (error) {
      console.error('Failed to reorder texts in playlist:', error);
      throw error;
    }
  };

  const addTextToPlaylist = async (playlistId: string, textId: string) => {
    try {
      const updatedPlaylists = await playlistStorage.addTextToPlaylist(playlistId, textId);
      setPlaylists(updatedPlaylists.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Failed to add text to playlist:', error);
      throw error;
    }
  };

  const removeTextFromPlaylist = async (playlistId: string, textId: string) => {
    try {
      const updatedPlaylists = await playlistStorage.removeTextFromPlaylist(playlistId, textId);
      setPlaylists(updatedPlaylists.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Failed to remove text from playlist:', error);
      throw error;
    }
  };

  const refreshPlaylists = async () => {
    await loadPlaylists();
  };

  const getPlaylistsForText = (textId: string): Playlist[] => {
    return playlists.filter(playlist => playlist.textIds.includes(textId));
  };

  const savePlaylistWithTexts = async (
    playlist: Playlist,
    textIds: string[],
    existingPlaylistId?: string,
    existingTextIds: string[] = []
  ): Promise<string> => {
    try {
      let playlistId: string;
      
      if (existingPlaylistId) {
        await updatePlaylist(existingPlaylistId, playlist);
        playlistId = existingPlaylistId;
      } else {
        await addPlaylist(playlist);
        playlistId = playlist.id;
      }
      
      // Add newly selected texts
      for (const textId of textIds) {
        if (!existingTextIds.includes(textId)) {
          await addTextToPlaylist(playlistId, textId);
        }
      }
      
      // Remove unselected texts
      for (const textId of existingTextIds) {
        if (!textIds.includes(textId)) {
          await removeTextFromPlaylist(playlistId, textId);
        }
      }
      
      return playlistId;
    } catch (error) {
      console.error('Failed to save playlist with texts:', error);
      throw error;
    }
  };

  const deletePlaylistWithConfirmation = async (playlist: Playlist, onSuccess: () => void) => {
    const { Alert } = await import('react-native');
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    const textCount = playlist.textIds.length;
    
    // Check if confirmation is required from settings
    const settingsStr = await AsyncStorage.default.getItem('@bandaid_settings');
    const settings = settingsStr ? JSON.parse(settingsStr) : { confirmDelete: true };
    
    if (!settings.confirmDelete) {
      // Skip confirmation and delete directly
      try {
        await deletePlaylist(playlist.id);
        showSuccessToast('Playlist deleted successfully');
        onSuccess();
      } catch (error) {
        showErrorToast('Failed to delete playlist');
      }
      return;
    }
    
    Alert.alert(
      'Delete Playlist',
      `Are you sure you want to delete "${playlist.name}"? ${
        textCount > 0 ? `This playlist contains ${textCount} text(s).` : ''
      } The texts will not be deleted.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deletePlaylist(playlist.id);
              showSuccessToast('Playlist deleted successfully');
              onSuccess();
            } catch (error) {
              showErrorToast('Failed to delete playlist');
            }
          },
        },
      ]
    );
  };

  return (
    <PlaylistContext.Provider
      value={{
        playlists,
        loading,
        addPlaylist,
        updatePlaylist,
        deletePlaylist,
        reorderPlaylists,
        reorderTextsInPlaylist,
        addTextToPlaylist,
        removeTextFromPlaylist,
        refreshPlaylists,
        getPlaylistsForText,
        savePlaylistWithTexts,
        deletePlaylistWithConfirmation,
      }}
    >
      {children}
    </PlaylistContext.Provider>
  );
};

export const usePlaylists = () => {
  const context = useContext(PlaylistContext);
  if (context === undefined) {
    throw new Error('usePlaylists must be used within a PlaylistProvider');
  }
  return context;
};
