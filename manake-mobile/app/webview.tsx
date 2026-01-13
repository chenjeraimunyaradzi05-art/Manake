import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Platform,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Stack, useLocalSearchParams } from "expo-router";
import { WebView } from "react-native-webview";
import { theme } from "../constants";
import { Button } from "../components/ui";

export default function WebviewScreen() {
  const params = useLocalSearchParams<{ url?: string; title?: string }>();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const uri = useMemo(() => {
    const raw = typeof params.url === "string" ? params.url : undefined;
    if (!raw) return "https://manake.org.zw";
    return raw;
  }, [params.url]);

  const title = typeof params.title === "string" ? params.title : "Browser";

  if (Platform.OS === "web") {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title }} />

        <View style={styles.webFallback}>
          <Text style={styles.webTitle}>This page opens in a new tab</Text>
          <Text style={styles.webUrl} numberOfLines={2}>
            {uri}
          </Text>
          <Button
            title="Open"
            fullWidth
            onPress={() => {
              void Linking.openURL(uri);
            }}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title }} />

      <WebView
        source={{ uri }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        onError={(event) => {
          setLoading(false);
          setLoadError(
            event.nativeEvent?.description || "Failed to load this page",
          );
        }}
        onHttpError={(event) => {
          setLoading(false);
          setLoadError(
            `Request failed (HTTP ${event.nativeEvent.statusCode})`,
          );
        }}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </View>
        )}
      />

      {loadError ? (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorTitle}>Couldn’t load this page</Text>
          <Text style={styles.errorText}>{loadError}</Text>
          <Button
            title="Open in browser"
            fullWidth
            onPress={() => {
              void Linking.openURL(uri);
            }}
          />
        </View>
      ) : null}

      {loading ? (
        <View pointerEvents="none" style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  webFallback: {
    flex: 1,
    padding: theme.spacing.l,
    justifyContent: "center",
    gap: theme.spacing.m,
  },
  webTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.text,
  },
  webUrl: {
    color: theme.colors.textSecondary,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.background,
  },
  errorOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    padding: theme.spacing.l,
    justifyContent: "center",
    backgroundColor: theme.colors.background,
    gap: theme.spacing.m,
  },
  errorTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "700",
    color: theme.colors.text,
  },
  errorText: {
    color: theme.colors.textSecondary,
  },
  loadingOverlay: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
});
