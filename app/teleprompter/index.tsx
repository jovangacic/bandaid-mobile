import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { StyleSheet, Text, View } from "react-native";
import FloatingActionButton from "../components/FloatingActionButton";
import Layout from "../components/Layout";
import TextList from "../components/TextList";
import { useTexts } from "../context/TextContext";
import { Text as TextType } from "../models/Text";
import theme from "../theme/colors";
import TeleprompterLayout from "./TeleprompterLayout";

export default function Home() {
  const router = useRouter();
  const { texts, loading, reorderTexts } = useTexts();

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
    <TeleprompterLayout title="Texts" count={texts.length}>
      {/* Text List */}
      <TextList texts={texts} onTextPress={handleTextPress} onReorder={handleReorder} onEdit={handleEdit} />

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
});
