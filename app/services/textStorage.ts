import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text } from '../models/Text';

const STORAGE_KEY = '@bandaid_texts';

export const textStorage = {
  // Get all texts
  getTexts: async (): Promise<Text[]> => {
    try {
      const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
      if (jsonValue) {
        const texts = JSON.parse(jsonValue);
        // Convert date strings back to Date objects
        return texts.map((text: any) => ({
          ...text,
          dateCreated: new Date(text.dateCreated),
          dateModified: new Date(text.dateModified),
        }));
      }
      return [];
    } catch (error) {
      console.error('Error loading texts:', error);
      return [];
    }
  },

  // Save all texts
  saveTexts: async (texts: Text[]): Promise<void> => {
    try {
      const jsonValue = JSON.stringify(texts);
      await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
    } catch (error) {
      console.error('Error saving texts:', error);
      throw error;
    }
  },

  // Add a new text
  addText: async (text: Text): Promise<Text[]> => {
    try {
      const texts = await textStorage.getTexts();
      const newTexts = [...texts, text];
      await textStorage.saveTexts(newTexts);
      return newTexts;
    } catch (error) {
      console.error('Error adding text:', error);
      throw error;
    }
  },

  // Update a text
  updateText: async (id: string, updates: Partial<Text>): Promise<Text[]> => {
    try {
      const texts = await textStorage.getTexts();
      const updatedTexts = texts.map(text => 
        text.id === id 
          ? { ...text, ...updates, dateModified: new Date() }
          : text
      );
      await textStorage.saveTexts(updatedTexts);
      return updatedTexts;
    } catch (error) {
      console.error('Error updating text:', error);
      throw error;
    }
  },

  // Delete a text
  deleteText: async (id: string): Promise<Text[]> => {
    try {
      const texts = await textStorage.getTexts();
      const filteredTexts = texts.filter(text => text.id !== id);
      await textStorage.saveTexts(filteredTexts);
      return filteredTexts;
    } catch (error) {
      console.error('Error deleting text:', error);
      throw error;
    }
  },

  // Reorder texts
  reorderTexts: async (texts: Text[]): Promise<void> => {
    try {
      const reorderedTexts = texts.map((text, index) => ({
        ...text,
        order: index,
      }));
      await textStorage.saveTexts(reorderedTexts);
    } catch (error) {
      console.error('Error reordering texts:', error);
      throw error;
    }
  },

  // Clear all texts (useful for development/testing)
  clearTexts: async (): Promise<void> => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing texts:', error);
      throw error;
    }
  },
};
