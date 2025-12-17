import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from "react-native";
import FloatingActionButton from "../components/FloatingActionButton";
import Layout from "../components/Layout";
import SearchInput from '../components/SearchInput';
import TextList from "../components/TextList";
import { useTexts } from "../context/TextContext";
import { Text as TextType } from "../models/Text";
import theme from "../theme/colors";
import TeleprompterLayout from "./TeleprompterLayout";

export default function Home() {
  const router = useRouter();
  const { texts, loading, reorderTexts } = useTexts();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTexts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return texts;
    return texts.filter((t) => (t.title || '').toLowerCase().includes(q));
  }, [texts, searchQuery]);

  const handleTextPress = useCallback((text: TextType) => {
    router.push(`/teleprompter/text-view?id=${text.id}` as any);
  }, [router]);

  const handleAddText = useCallback(() => {
    router.push('/teleprompter/add-text' as any);
  }, [router]);

  const handleReorder = useCallback((reorderedTexts: TextType[]) => {
    reorderTexts(reorderedTexts);
  }, [reorderTexts]);

  const handleEdit = useCallback((text: TextType) => {
    router.push(`/teleprompter/add-text?id=${text.id}` as any);
  }, [router]);

  if (loading) {
    return (
      <Layout>
        <View style={styles.centerContainer}>
          <Text style={styles.loadingText}>Loading texts...</Text>
        </View>
      </Layout>
    );
  }

  return (
    <TeleprompterLayout title="Texts" count={filteredTexts.length}>
      <SearchInput value={searchQuery} onChangeText={setSearchQuery} placeholder="Search texts..." />

      {/* Text List */}
      <TextList
        texts={filteredTexts}
        onTextPress={handleTextPress}
        onReorder={searchQuery.trim().length > 0 ? undefined : handleReorder}
        onEdit={handleEdit}
        enableDrag={searchQuery.trim().length === 0}
      />

      {/* Floating Action Button */}
      <FloatingActionButton onPress={handleAddText} hasBottomNav={true} />
    </TeleprompterLayout>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  searchContainer: {
    // kept for backward compatibility; styles moved to SearchInput
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
  searchInput: {},
  clearButton: {},
  clearButtonText: {},
});
