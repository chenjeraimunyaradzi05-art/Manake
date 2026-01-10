import { Stack } from "expo-router";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import { theme } from "../constants";
import { ErrorBoundary, ToastProvider, NoInternetBanner } from "../components";
import { useAuth, useNotifications } from "../hooks";
import { syncManager } from "../services/syncManager";

SplashScreen.preventAutoHideAsync();

function RootLayoutContent() {
  const { isRestoring } = useAuth();
  const [fontsLoaded] = useFonts({
    // Add custom fonts here if needed
  });

  // Initialize push notifications
  useNotifications({
    onNotificationReceived: (notification) => {
      console.log(
        "Notification received in foreground:",
        notification.request.content.title,
      );
    },
    onNotificationTapped: (response) => {
      console.log(
        "User tapped notification:",
        response.notification.request.content.title,
      );
    },
  });

  // Start sync manager for offline data
  useEffect(() => {
    syncManager.start();
    return () => syncManager.stop();
  }, []);

  useEffect(() => {
    if (fontsLoaded && !isRestoring) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, isRestoring]);

  if (!fontsLoaded || isRestoring) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <NoInternetBanner />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="profile/edit"
          options={{
            headerShown: true,
            headerTitle: "Edit Profile",
          }}
        />
        <Stack.Screen
          name="settings/index"
          options={{
            headerShown: true,
            headerTitle: "Settings",
          }}
        />
        <Stack.Screen
          name="story/[id]"
          options={{
            headerShown: true,
            headerTitle: "",
            headerTransparent: true,
            headerTintColor: "#fff",
            headerStyle: {
              backgroundColor: "transparent",
            },
          }}
        />
        <Stack.Screen
          name="story/create"
          options={{
            headerShown: true,
            headerTitle: "Share Your Story",
            presentation: "modal",
          }}
        />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <RootLayoutContent />
      </ToastProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
});
