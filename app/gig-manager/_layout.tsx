import { Stack } from 'expo-router';

export default function SetlistManagerLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    />
  );
}
