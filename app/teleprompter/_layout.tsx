import { Stack } from 'expo-router';

export default function TeleprompterLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'fade',
      }}
    />
  );
}
