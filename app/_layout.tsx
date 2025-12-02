import * as Notifications from 'expo-notifications';
import { Stack, useRouter } from "expo-router";
import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect, useRef } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { toastConfig } from "./config/toastConfig";
import { PlaylistProvider } from "./context/PlaylistContext";
import { SettingsProvider, useSettings } from "./context/SettingsContext";
import { TextProvider } from "./context/TextContext";

function AppNavigator() {
  const { settings } = useSettings();
  const router = useRouter();
  const responseListener = useRef<Notifications.Subscription | null>(null);

  useEffect(() => {
    const applyOrientation = async () => {
      try {
        switch (settings.orientationMode) {
          case 'portrait':
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT);
            break;
          case 'landscape':
            await ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
            break;
          case 'auto':
            await ScreenOrientation.unlockAsync();
            break;
        }
      } catch (error) {
        console.error('Error applying orientation:', error);
      }
    };

    applyOrientation();
  }, [settings.orientationMode]);

  useEffect(() => {
    // Check if app was opened from a notification (when app was closed)
    Notifications.getLastNotificationResponseAsync().then(response => {
      if (response?.notification.request.content.data.gigId) {
        const gigId = response.notification.request.content.data.gigId;
        // Small delay to ensure navigation is ready
        setTimeout(() => {
          router.push({
            pathname: '/gigs-calendar/add-gig',
            params: { gigId: gigId as string },
          });
        }, 100);
      }
    });

    // Handle notification clicks when app is running
    responseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const gigId = response.notification.request.content.data.gigId;
      if (gigId) {
        // Navigate to gig calendar with the specific gig
        router.push({
          pathname: '/gigs-calendar/add-gig',
          params: { gigId: gigId as string },
        });
      }
    });

    return () => {
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [router]);

  return (
    <Stack
      screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}
    >
      <Stack.Screen
        name="index"
      />
      <Stack.Screen
        name="home"
      />
      <Stack.Screen
        name="teleprompter"
      />
      <Stack.Screen
        name="gigs-calendar"
      />
      <Stack.Screen
        name="record-track"
      />
      <Stack.Screen
        name="practice-timer"
      />
      <Stack.Screen
        name="settings"
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="about"
        options={{
          presentation: 'modal',
        }}
      />
      <Stack.Screen
        name="help"
        options={{
          presentation: 'modal',
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SettingsProvider>
        <TextProvider>
          <PlaylistProvider>
            <AppNavigator />
            <Toast config={toastConfig} />
          </PlaylistProvider>
        </TextProvider>
      </SettingsProvider>
    </GestureHandlerRootView>
  );
}
