import { Stack } from "expo-router";
import { useEffect } from "react";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import * as Sentry from "@sentry/react-native";
import { theme } from "../constants";
import { ErrorBoundary, ToastProvider, NoInternetBanner } from "../components";
import { useAuth, useNotifications } from "../hooks";
import { syncManager } from "../services/syncManager";

SplashScreen.preventAutoHideAsync();

Sentry.init({
  dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
  enabled: Boolean(process.env.EXPO_PUBLIC_SENTRY_DSN),
  tracesSampleRate: 0.1,
  profilesSampleRate: 0.1,
  enableAutoPerformanceTracing: true,
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    if (process.env.NODE_ENV === "development") return null;

    if (event.user) {
      delete (event.user as any).email;
      delete (event.user as any).ip_address;
    }

    if (event.request) {
      if (event.request.headers) {
        const { authorization, cookie, ...rest } = event.request.headers;
        event.request.headers = rest;
      }
      delete (event.request as any).cookies;
      delete (event.request as any).data;
    }

    return event;
  },
});

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
          name="webview"
          options={{
            headerShown: true,
            headerTitle: "Browser",
          }}
        />
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
