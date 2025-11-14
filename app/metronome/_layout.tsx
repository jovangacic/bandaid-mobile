import { Stack } from 'expo-router';

export default function MetronomeLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    />
  );
}
