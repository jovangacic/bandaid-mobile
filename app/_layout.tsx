import { Stack } from "expo-router";
import { PlaylistProvider } from "./context/PlaylistContext";
import { SettingsProvider } from "./context/SettingsContext";
import { TextProvider } from "./context/TextContext";

export default function RootLayout() {
  return (
    <SettingsProvider>
      <TextProvider>
        <PlaylistProvider>
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
        </PlaylistProvider>
      </TextProvider>
    </SettingsProvider>
  );
}
