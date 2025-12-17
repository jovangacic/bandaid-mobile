import { LinearGradient } from 'expo-linear-gradient';
import React, { memo, useCallback, useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import DraggableFlatList, { RenderItemParams, ScaleDecorator } from 'react-native-draggable-flatlist';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { usePlaylists } from '../context/PlaylistContext';
import { Text as TextType } from '../models/Text';
import theme from '../theme/colors';

interface TextListProps {
  texts: TextType[];
  onTextPress: (text: TextType) => void;
  onReorder?: (texts: TextType[]) => void;
  onEdit?: (text: TextType) => void;
  enableDrag?: boolean;
}

const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
};

const TextList = ({ texts, onTextPress, onReorder, onEdit, enableDrag = true }: TextListProps) => {
  const { playlists } = usePlaylists();
  
  // Memoize playlist lookup to avoid recalculating on every render
  const textPlaylistsMap = useMemo(() => {
    const map = new Map<string, Array<typeof playlists[number]>>();
    texts.forEach(text => {
      map.set(text.id, playlists.filter(p => p.textIds.includes(text.id)));
    });
    return map;
  }, [texts, playlists]);

  const renderItem = useCallback(({ item, drag, isActive }: RenderItemParams<TextType>) => {
    const itemPlaylists = textPlaylistsMap.get(item.id) || [];
    return (
      <ScaleDecorator>
        <TouchableOpacity
          onPress={() => onTextPress(item)}
          onLongPress={enableDrag ? drag : undefined}
          disabled={isActive}
          activeOpacity={0.7}
        >
          <View style={[styles.card, isActive && styles.cardDragging]}>
            <LinearGradient
              colors={[theme.colors.backgroundLight, theme.colors.background]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.cardGradient}
            >
              <View style={styles.cardHeader}>
                <View style={styles.dragIndicator}>
                  <Text style={styles.dragIcon}>☰</Text>
                </View>
                <Text style={styles.title} numberOfLines={1}>
                  {item.title}
                </Text>
                {onEdit && (
                  <TouchableOpacity 
                    onPress={(e) => {
                      e.stopPropagation();
                      onEdit(item);
                    }}
                    style={styles.editButton}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.editIcon}>✎</Text>
                  </TouchableOpacity>
                )}
              </View>
              
              <View style={styles.cardContent}>
                <Text style={styles.preview} numberOfLines={2}>
                  {item.content}
                </Text>
                
                {itemPlaylists.length > 0 && (
                  <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    style={styles.playlistContainer}
                    contentContainerStyle={styles.playlistContent}
                  >
                    {itemPlaylists.map(playlist => (
                      <View key={playlist.id} style={styles.playlistBadge}>
                        <Text style={styles.playlistBadgeText}>
                          {playlist.name.length > 20 ? `${playlist.name.substring(0, 20)}...` : playlist.name}
                        </Text>
                      </View>
                    ))}
                  </ScrollView>
                )}
                
                <View style={styles.footer}>
                  <Text style={styles.date}>
                    {formatDate(item.dateModified)}
                  </Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Speed: {item.scrollSpeed}</Text>
                  </View>
                </View>
              </View>
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  }, [textPlaylistsMap, onTextPress, onEdit, enableDrag]);

  const handleDragEnd = useCallback(({ data }: { data: TextType[] }) => {
    onReorder?.(data);
  }, [onReorder]);

  const keyExtractor = useCallback((item: TextType) => item.id, []);

  if (texts.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No texts yet</Text>
        <Text style={styles.emptySubtext}>Tap + to create your first text</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DraggableFlatList
        data={texts}
        keyExtractor={keyExtractor}
        renderItem={renderItem}
        onDragEnd={enableDrag ? handleDragEnd : undefined}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        activationDistance={enableDrag ? 10 : Number.MAX_SAFE_INTEGER}
        containerStyle={{ flex: 1 }}
      />
    </GestureHandlerRootView>
  );
};

export default memo(TextList);

const styles = StyleSheet.create({
  listContainer: {
    padding: theme.spacing.md,
    paddingBottom: 160, // Space for floating action button and bottom nav
  },
  card: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: theme.colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cardGradient: {
    borderWidth: 1,
    borderColor: theme.colors.primary + '30', // 30 is alpha for transparency
    borderRadius: theme.borderRadius.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.primary + '10',
  },
  cardContent: {
    padding: theme.spacing.md,
  },
  cardDragging: {
    opacity: 0.8,
    elevation: 8,
    shadowOpacity: 0.5,
  },
  dragIndicator: {
    marginRight: theme.spacing.md,
    padding: theme.spacing.xs,
  },
  dragIcon: {
    fontSize: 20,
    color: theme.colors.textMuted,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.colors.text,
  },
  editButton: {
    padding: theme.isTablet ? theme.spacing.md : theme.spacing.sm + 2,
    marginLeft: theme.spacing.xs,
    backgroundColor: theme.colors.accent + '20',
    borderRadius: theme.borderRadius.md,
    minWidth: theme.isTablet ? 48 : 40,
    minHeight: theme.isTablet ? 48 : 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editIcon: {
    fontSize: theme.isTablet ? 26 : 22,
    color: theme.colors.accent,
  },
  preview: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.sm,
    lineHeight: 20,
  },
  playlistContainer: {
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  playlistContent: {
    gap: theme.spacing.xs,
  },
  playlistBadge: {
    backgroundColor: theme.colors.accent + '30',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 1,
    borderColor: theme.colors.accent + '60',
  },
  playlistBadgeText: {
    fontSize: 11,
    color: theme.colors.accent,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  date: {
    fontSize: 12,
    color: theme.colors.accent,
  },
  badge: {
    backgroundColor: theme.colors.primary + '40',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.sm,
  },
  badgeText: {
    fontSize: 11,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  emptySubtext: {
    fontSize: 16,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
});
