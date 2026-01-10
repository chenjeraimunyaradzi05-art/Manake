import React from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { theme } from "../../constants";

export interface VideoPlayerProps {
  uri?: string;
  style?: ViewStyle;
}

export function VideoPlayer({ style }: VideoPlayerProps) {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.text}>Video</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    aspectRatio: 16 / 9,
    borderRadius: 12,
    backgroundColor: theme.colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: theme.colors.textSecondary,
    fontSize: 14,
    fontWeight: "600",
  },
});

export default VideoPlayer;
