import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { Gig } from '../models/Gig';

const STORAGE_KEY = '@bandaid_gigs';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export const gigStorage = {

  async getAllGigs(): Promise<Gig[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEY);
      const gigs = data ? JSON.parse(data) : [];
      
      // Always sort by date and time ascending (nearest event first)
      gigs.sort((a: Gig, b: Gig) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });
      
      return gigs;
    } catch (error) {
      console.error('Error loading gigs:', error);
      return [];
    }
  },

  async saveGig(gig: Gig): Promise<void> {
    try {
      const gigs = await this.getAllGigs();
      const existingIndex = gigs.findIndex((g) => g.id === gig.id);

      if (existingIndex !== -1) {
        gigs[existingIndex] = gig;
      } else {
        gigs.push(gig);
      }

      // Sort by date and time
      gigs.sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.time}`);
        const dateB = new Date(`${b.date}T${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(gigs));
      
      // Schedule notifications for this gig
      await this.scheduleGigNotifications(gig);
    } catch (error) {
      console.error('Error saving gig:', error);
      throw error;
    }
  },

  async deleteGig(id: string): Promise<void> {
    try {
      const gigs = await this.getAllGigs();
      const filtered = gigs.filter((g) => g.id !== id);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      
      // Cancel all notifications for this gig
      await this.cancelGigNotifications(id);
    } catch (error) {
      console.error('Error deleting gig:', error);
      throw error;
    }
  },

  async scheduleGigNotifications(gig: Gig): Promise<void> {
    if (!gig.reminderSettings.enabled) {
      return;
    }

    // Cancel existing notifications for this gig
    await this.cancelGigNotifications(gig.id);

    const gigDateTime = new Date(`${gig.date}T${gig.time}`);
    const now = new Date();

    // If gig has passed and is recurring, create next occurrence
    if (gigDateTime < now && gig.reminderSettings.recurring) {
      await this.createNextRecurringGig(gig);
      return;
    }

    // Schedule 7 days before
    if (gig.reminderSettings.sevenDaysBefore) {
      // Calculate exact time by subtracting milliseconds (7 days = 7 * 24 * 60 * 60 * 1000)
      const sevenDaysBefore = new Date(gigDateTime.getTime() - (7 * 24 * 60 * 60 * 1000));
      
      if (sevenDaysBefore > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Upcoming Gig in 7 Days',
            body: `${gig.title} - ${gig.date} at ${gig.time}`,
            data: { gigId: gig.id, type: '7days' },
          },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: sevenDaysBefore },
          identifier: `${gig.id}-7days`,
        });
      }
    }

    // Schedule 1 day before
    if (gig.reminderSettings.oneDayBefore) {
      // Calculate exact time by subtracting milliseconds (1 day = 24 * 60 * 60 * 1000)
      const oneDayBefore = new Date(gigDateTime.getTime() - (24 * 60 * 60 * 1000));
      
      if (oneDayBefore > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Gig Tomorrow!',
            body: `${gig.title} - ${gig.time}`,
            data: { gigId: gig.id, type: '1day' },
          },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: oneDayBefore },
          identifier: `${gig.id}-1day`,
        });
      }
    }

    // Schedule hours before
    for (const hours of gig.reminderSettings.hoursBeforeOptions) {
      // Calculate exact time by subtracting milliseconds to preserve exact time
      const hoursBefore = new Date(gigDateTime.getTime() - (hours * 60 * 60 * 1000));
      
      if (hoursBefore > now) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: `Gig in ${hours} ${hours === 1 ? 'Hour' : 'Hours'}!`,
            body: `${gig.title} starts at ${gig.time}`,
            data: { gigId: gig.id, type: `${hours}hours` },
          },
          trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: hoursBefore },
          identifier: `${gig.id}-${hours}hours`,
        });
        console.log(`Scheduled ${hours}h notification for ${hoursBefore.toLocaleString()} (Gig at ${gigDateTime.toLocaleString()})`);
      }
    }
  },

  async cancelGigNotifications(gigId: string): Promise<void> {
    const allNotifications = await Notifications.getAllScheduledNotificationsAsync();
    const gigNotifications = allNotifications.filter((notif: Notifications.NotificationRequest) =>
      notif.identifier.startsWith(gigId)
    );

    for (const notif of gigNotifications) {
      await Notifications.cancelScheduledNotificationAsync(notif.identifier);
    }
  },

  async requestNotificationPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    return finalStatus === 'granted';
  },

  async createNextRecurringGig(gig: Gig): Promise<void> {
    if (!gig.reminderSettings.recurring) {
      return;
    }

    const currentDate = new Date(`${gig.date}T${gig.time}`);
    const nextDate = new Date(currentDate);
    nextDate.setDate(nextDate.getDate() + gig.reminderSettings.recurringIntervalDays);

    const nextGig: Gig = {
      ...gig,
      id: Date.now().toString(),
      date: nextDate.toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await this.saveGig(nextGig);
  },
};
