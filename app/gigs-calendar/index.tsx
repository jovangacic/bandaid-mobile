import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import FloatingActionButton from '../components/FloatingActionButton';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';
import SideMenu from '../components/SideMenu';
import { Gig } from '../models/Gig';
import { gigStorage } from '../services/gigStorage';
import theme from '../theme/colors';
import { showErrorToast, showSuccessToast } from '../utils/toast';

export default function GigManager() {
  const router = useRouter();
  const [menuVisible, setMenuVisible] = useState(false);
  const [gigs, setGigs] = useState<Gig[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGigs = useCallback(async () => {
    try {
      const loadedGigs = await gigStorage.getAllGigs();
      setGigs(loadedGigs);
    } catch (error) {
      console.error('Error loading gigs:', error);
      Alert.alert('Error', 'Failed to load gigs');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Request notification permissions on mount
    gigStorage.requestNotificationPermissions();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadGigs();
    }, [loadGigs])
  );

  const handleAddGig = () => {
    router.push('/gigs-calendar/add-gig');
  };

  const handleEditGig = (gig: Gig) => {
    router.push({
      pathname: '/gigs-calendar/add-gig',
      params: { gigId: gig.id },
    });
  };

  const handleDeleteGig = (gig: Gig) => {
    Alert.alert(
      'Delete Gig',
      `Are you sure you want to delete "${gig.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await gigStorage.deleteGig(gig.id);
              await loadGigs();
              showSuccessToast('Gig deleted successfully');
            } catch (error) {
              showErrorToast('Failed to delete gig');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const renderGigItem = ({ item }: { item: Gig }) => {
    const gigDateTime = new Date(`${item.date}T${item.time}`);
    const isPast = gigDateTime < new Date();

    return (
      <TouchableOpacity
        style={[styles.gigCard, isPast && styles.gigCardPast]}
        onPress={() => handleEditGig(item)}
        onLongPress={() => handleDeleteGig(item)}
      >
        <View style={styles.gigHeader}>
          <Text style={[styles.gigTitle, isPast && styles.textPast]}>
            {item.title}
          </Text>
          {item.reminderSettings.enabled && (
            <Ionicons name="notifications" size={18} color={theme.colors.accent} />
          )}
        </View>
        
        <View style={styles.gigDateTime}>
          <View style={styles.gigInfoRow}>
            <Ionicons name="calendar" size={16} color={isPast ? theme.colors.textMuted : theme.colors.text} />
            <Text style={[styles.gigDate, isPast && styles.textPast]}>
              {formatDate(item.date)}
            </Text>
          </View>
          <View style={styles.gigInfoRow}>
            <Ionicons name="time" size={16} color={isPast ? theme.colors.textMuted : theme.colors.text} />
            <Text style={[styles.gigTime, isPast && styles.textPast]}>
              {item.time}
            </Text>
          </View>
        </View>

        {item.description ? (
          <Text style={[styles.gigDescription, isPast && styles.textPast]} numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}
      </TouchableOpacity>
    );
  };

  return (
    <Layout useSafeArea={true}>
      <View style={styles.container}>
        <PageHeader
          title="Gigs"
          count={gigs.length}
          onMenuPress={() => setMenuVisible(true)}
        />

        {loading ? (
          <View style={styles.centerContent}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        ) : gigs.length === 0 ? (
          <View style={styles.centerContent}>
            <Ionicons name="calendar" size={64} color={theme.colors.textMuted} />
            <Text style={styles.emptyText}>No gigs scheduled</Text>
            <Text style={styles.emptySubtext}>
              Tap the + button to add your first gig
            </Text>
          </View>
        ) : (
          <FlatList
            data={gigs}
            renderItem={renderGigItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
          />
        )}

        {/* Add Button */}
        <FloatingActionButton onPress={handleAddGig} />

        <SideMenu visible={menuVisible} onClose={() => setMenuVisible(false)} />
      </View>
    </Layout>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  loadingText: {
    fontSize: theme.typography.bodyMedium,
    color: theme.colors.textMuted,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    fontSize: theme.typography.heading3,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  emptySubtext: {
    fontSize: theme.typography.bodyMedium,
    color: theme.colors.textMuted,
    textAlign: 'center',
  },
  listContent: {
    padding: theme.spacing.md,
  },
  gigCard: {
    backgroundColor: theme.colors.backgroundLight,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 4,
    borderLeftColor: theme.colors.accent,
  },
  gigCardPast: {
    opacity: 0.6,
    borderLeftColor: theme.colors.textMuted,
  },
  gigHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  gigTitle: {
    fontSize: theme.typography.heading4,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
  },
  reminderBadge: {
    fontSize: 18,
    marginLeft: theme.spacing.xs,
  },
  gigDateTime: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  gigInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  gigDate: {
    fontSize: theme.typography.bodySmall,
    color: theme.colors.text,
  },
  gigTime: {
    fontSize: theme.typography.bodySmall,
    color: theme.colors.text,
  },
  gigDescription: {
    fontSize: theme.typography.bodySmall,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
    lineHeight: theme.typography.bodySmall * 1.4,
  },
  textPast: {
    color: theme.colors.textMuted,
  },
});
