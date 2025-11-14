import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import LoadingScreen from "./components/LoadingScreen";

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Simulate app bootstrap/initialization
    const bootstrapApp = async () => {
      // Add any initialization logic here (e.g., loading fonts, checking auth, etc.)
      await new Promise(resolve => setTimeout(resolve, 2500)); // 2.5 second loading
      
      setIsLoading(false);
      router.replace("/home");
    };

    bootstrapApp();
  }, []);

  if (isLoading) {
    return <LoadingScreen title="bandaid" text="Loading..." />;
  }

  return <View style={{ flex: 1 }} />;
}
