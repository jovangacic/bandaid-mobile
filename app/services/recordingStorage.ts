import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { Recording } from '../models/Recording';

const STORAGE_KEY = '@bandaid_recordings';
const RECORDINGS_DIR = `${FileSystem.documentDirectory}recordings/`;

export const recordingStorage = {
  async ensureDirectoryExists(): Promise<void> {
    const dirInfo = await FileSystem.getInfoAsync(RECORDINGS_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(RECORDINGS_DIR, { intermediates: true });
    }
  },

  async getAllRecordings(): Promise<Recording[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading recordings:', error);
      return [];
    }
  },

  async saveRecording(recording: Recording): Promise<void> {
    try {
      const recordings = await this.getAllRecordings();
      const existingIndex = recordings.findIndex((r) => r.id === recording.id);

      if (existingIndex !== -1) {
        recordings[existingIndex] = recording;
      } else {
        recordings.push(recording);
      }

      // Sort by creation date (newest first)
      recordings.sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(recordings));
    } catch (error) {
      console.error('Error saving recording:', error);
      throw error;
    }
  },

  async deleteRecording(id: string): Promise<void> {
    try {
      const recordings = await this.getAllRecordings();
      const recording = recordings.find((r) => r.id === id);
      
      if (recording) {
        // Delete the audio file
        const fileInfo = await FileSystem.getInfoAsync(recording.uri);
        if (fileInfo.exists) {
          await FileSystem.deleteAsync(recording.uri);
        }
      }

      // Remove from storage
      const filtered = recordings.filter((r) => r.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error deleting recording:', error);
      throw error;
    }
  },

  async getRecordingUri(filename: string): Promise<string> {
    await this.ensureDirectoryExists();
    return `${RECORDINGS_DIR}${filename}`;
  },
};
