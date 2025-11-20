import { Stack } from "expo-router";
import * as ScreenOrientation from 'expo-screen-orientation';
import { useEffect } from 'react';
import { PlaylistProvider } from "./context/PlaylistContext";
import { SettingsProvider, useSettings } from "./context/SettingsContext";
import { TextProvider } from "./context/TextContext";

function AppNavigator() {
  const { settings } = useSettings();

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
        name="metronome"
      />
      <Stack.Screen
        name="tuner"
      />
      <Stack.Screen
        name="gig-manager"
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
    <SettingsProvider>
      <TextProvider>
        <PlaylistProvider>
          <AppNavigator />
        </PlaylistProvider>
      </TextProvider>
    </SettingsProvider>
  );
}
