import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { Text } from '../models/Text';
import { textStorage } from '../services/textStorage';

interface TextContextType {
  texts: Text[];
  loading: boolean;
  addText: (text: Text) => Promise<void>;
  updateText: (id: string, updates: Partial<Text>) => Promise<void>;
  deleteText: (id: string) => Promise<void>;
  reorderTexts: (texts: Text[]) => Promise<void>;
  refreshTexts: () => Promise<void>;
  saveTextWithPlaylists: (
    text: Text,
    playlistIds: string[],
    existingTextId?: string,
    existingPlaylistIds?: string[]
  ) => Promise<string>;
  deleteTextWithConfirmation: (text: Text, onSuccess: () => void) => Promise<void>;
}

const TextContext = createContext<TextContextType | undefined>(undefined);

export const TextProvider = ({ children }: { children: ReactNode }) => {
  const [texts, setTexts] = useState<Text[]>([]);
  const [loading, setLoading] = useState(true);
  const saveTimeoutRef = useRef<any>(null);

  // Load texts on mount
  useEffect(() => {
    loadTexts();
  }, []);

  const loadTexts = async () => {
    try {
      setLoading(true);
      const loadedTexts = await textStorage.getTexts();
      // Sort by order
      const sortedTexts = loadedTexts.sort((a, b) => a.order - b.order);
      setTexts(sortedTexts);
    } catch (error) {
      console.error('Failed to load texts:', error);
    } finally {
      setLoading(false);
    }
  };

  const addText = async (text: Text) => {
    try {
      const updatedTexts = await textStorage.addText(text);
      setTexts(updatedTexts.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Failed to add text:', error);
      throw error;
    }
  };

  const updateText = async (id: string, updates: Partial<Text>) => {
    try {
      const updatedTexts = await textStorage.updateText(id, updates);
      setTexts(updatedTexts.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Failed to update text:', error);
      throw error;
    }
  };

  const deleteText = async (id: string) => {
    try {
      const updatedTexts = await textStorage.deleteText(id);
      setTexts(updatedTexts.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Failed to delete text:', error);
      throw error;
    }
  };

  const reorderTexts = async (reorderedTexts: Text[]) => {
    try {
      // Update state immediately for smooth UX
      setTexts(reorderedTexts);
      
      // Clear any pending save
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      
      // Debounce the save operation to avoid multiple rapid writes
      saveTimeoutRef.current = setTimeout(() => {
        textStorage.reorderTexts(reorderedTexts).catch(error => {
          console.error('Failed to persist reordered texts:', error);
          // Revert on error
          loadTexts();
        });
      }, 300); // Save after 300ms of no changes
    } catch (error) {
      console.error('Failed to reorder texts:', error);
      throw error;
    }
  };

  const refreshTexts = async () => {
    await loadTexts();
  };

  const saveTextWithPlaylists = async (
    text: Text,
    playlistIds: string[],
    existingTextId?: string,
    existingPlaylistIds: string[] = []
  ): Promise<string> => {
    try {
      let textId: string;
      
      if (existingTextId) {
        await updateText(existingTextId, text);
        textId = existingTextId;
      } else {
        await addText(text);
        textId = text.id;
      }
      
      // Import dynamically to avoid circular dependency
      const { playlistStorage } = await import('../services/playlistStorage');
      
      // Add to new playlists
      for (const playlistId of playlistIds) {
        if (!existingPlaylistIds.includes(playlistId)) {
          await playlistStorage.addTextToPlaylist(playlistId, textId);
        }
      }
      
      // Remove from unchecked playlists
      for (const playlistId of existingPlaylistIds) {
        if (!playlistIds.includes(playlistId)) {
          await playlistStorage.removeTextFromPlaylist(playlistId, textId);
        }
      }
      
      return textId;
    } catch (error) {
      console.error('Failed to save text with playlists:', error);
      throw error;
    }
  };

  const deleteTextWithConfirmation = async (text: Text, onSuccess: () => void) => {
    const { Alert } = await import('react-native');
    const AsyncStorage = await import('@react-native-async-storage/async-storage');
    
    // Check if confirmation is required from settings
    const settingsStr = await AsyncStorage.default.getItem('@bandaid_settings');
    const settings = settingsStr ? JSON.parse(settingsStr) : { confirmDelete: true };
    
    if (!settings.confirmDelete) {
      // Skip confirmation and delete directly
      try {
        await deleteText(text.id);
        onSuccess();
      } catch (error) {
        Alert.alert('Error', 'Failed to delete text');
      }
      return;
    }
    
    Alert.alert(
      'Delete Text',
      `Are you sure you want to delete "${text.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteText(text.id);
              onSuccess();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete text');
            }
          },
        },
      ]
    );
  };

  return (
    <TextContext.Provider
      value={{
        texts,
        loading,
        addText,
        updateText,
        deleteText,
        reorderTexts,
        refreshTexts,
        saveTextWithPlaylists,
        deleteTextWithConfirmation,
      }}
    >
      {children}
    </TextContext.Provider>
  );
};

// Custom hook to use the text context
export const useTexts = () => {
  const context = useContext(TextContext);
  if (context === undefined) {
    throw new Error('useTexts must be used within a TextProvider');
  }
  return context;
};
