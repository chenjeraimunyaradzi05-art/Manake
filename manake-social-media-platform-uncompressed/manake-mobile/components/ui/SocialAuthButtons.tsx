import React from "react";
import { View, StyleSheet, ViewStyle } from "react-native";
import { Button } from "./Button";
import { theme } from "../../constants";

export type SocialProvider = "google" | "apple" | "facebook" | "twitter";

export interface SocialIconButtonProps {
  provider: SocialProvider;
  onPress: () => void;
  style?: ViewStyle;
  disabled?: boolean;
  loading?: boolean;
}

function providerMeta(provider: SocialProvider) {
  switch (provider) {
    case "google":
      return { title: "Continue with Google", icon: "google" as const };
    case "apple":
      return { title: "Continue with Apple", icon: "apple" as const };
    case "facebook":
      return { title: "Continue with Facebook", icon: "facebook" as const };
    case "twitter":
      return { title: "Continue with Twitter", icon: "twitter" as const };
  }
}

export function SocialIconButton({
  provider,
  onPress,
  style,
  disabled,
  loading,
}: SocialIconButtonProps) {
  const meta = providerMeta(provider);
  return (
    <View style={style}>
      <Button
        title={meta.title}
        onPress={onPress}
        variant="outline"
        size="medium"
        fullWidth
        icon={meta.icon}
        disabled={disabled}
        loading={loading}
      />
    </View>
  );
}

export interface SocialAuthButtonsProps {
  onProviderPress?: (provider: SocialProvider) => void;
  style?: ViewStyle;
  disabled?: boolean;
  loadingProvider?: SocialProvider | null;
}

export function SocialAuthButtons({
  onProviderPress,
  style,
  disabled,
  loadingProvider,
}: SocialAuthButtonsProps) {
  const handlePress = (provider: SocialProvider) => () =>
    onProviderPress?.(provider);

  return (
    <View style={[styles.container, style]}>
      <SocialIconButton
        provider="google"
        onPress={handlePress("google")}
        disabled={disabled}
        loading={loadingProvider === "google"}
      />
      <View style={styles.gap} />
      <SocialIconButton
        provider="apple"
        onPress={handlePress("apple")}
        disabled={disabled}
        loading={loadingProvider === "apple"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  gap: {
    height: theme.spacing.s,
  },
});

export default SocialAuthButtons;
