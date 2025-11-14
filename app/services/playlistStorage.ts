import AsyncStorage from '@react-native-async-storage/async-storage';
import { Playlist } from '../models/Playlist';

const STORAGE_KEY = '@bandaid_playlists';

const serializePlaylists = (playlists: Playlist[]): string => {
  return JSON.stringify(
    playlists.map(playlist => ({
      ...playlist,
      dateCreated: playlist.dateCreated.toISOString(),
      dateModified: playlist.dateModified.toISOString(),
    }))
  );
};

const deserializePlaylists = (data: string): Playlist[] => {
  const parsed = JSON.parse(data);
  return parsed.map((playlist: any) => ({
    ...playlist,
    dateCreated: new Date(playlist.dateCreated),
    dateModified: new Date(playlist.dateModified),
  }));
};

export const playlistStorage = {
  async getPlaylists(): Promise<Playlist[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      if (!data) return [];
      return deserializePlaylists(data);
    } catch (error) {
      console.error('Error loading playlists:', error);
      return [];
    }
  },

  async savePlaylists(playlists: Playlist[]): Promise<void> {
    try {
      const data = serializePlaylists(playlists);
      await AsyncStorage.setItem(STORAGE_KEY, data);
    } catch (error) {
      console.error('Error saving playlists:', error);
      throw error;
    }
  },

  async addPlaylist(playlist: Playlist): Promise<Playlist[]> {
    const playlists = await this.getPlaylists();
    playlists.push(playlist);
    await this.savePlaylists(playlists);
    return playlists;
  },

  async updatePlaylist(id: string, updates: Partial<Playlist>): Promise<Playlist[]> {
    const playlists = await this.getPlaylists();
    const index = playlists.findIndex(p => p.id === id);
    if (index !== -1) {
      playlists[index] = { ...playlists[index], ...updates, dateModified: new Date() };
      await this.savePlaylists(playlists);
    }
    return playlists;
  },

  async deletePlaylist(id: string): Promise<Playlist[]> {
    const playlists = await this.getPlaylists();
    const filtered = playlists.filter(p => p.id !== id);
    await this.savePlaylists(filtered);
    return filtered;
  },

  async reorderPlaylists(reorderedPlaylists: Playlist[]): Promise<void> {
    const withUpdatedOrder = reorderedPlaylists.map((playlist, index) => ({
      ...playlist,
      order: index,
    }));
    await this.savePlaylists(withUpdatedOrder);
  },

  async addTextToPlaylist(playlistId: string, textId: string): Promise<Playlist[]> {
    const playlists = await this.getPlaylists();
    const playlist = playlists.find(p => p.id === playlistId);
    if (playlist && !playlist.textIds.includes(textId)) {
      playlist.textIds.push(textId);
      playlist.dateModified = new Date();
      await this.savePlaylists(playlists);
    }
    return playlists;
  },

  async removeTextFromPlaylist(playlistId: string, textId: string): Promise<Playlist[]> {
    const playlists = await this.getPlaylists();
    const playlist = playlists.find(p => p.id === playlistId);
    if (playlist) {
      playlist.textIds = playlist.textIds.filter(id => id !== textId);
      playlist.dateModified = new Date();
      await this.savePlaylists(playlists);
    }
    return playlists;
  },

  async clearPlaylists(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEY);
  },
};
