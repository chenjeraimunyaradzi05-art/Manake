import React from "react";
import { View, Image, StyleSheet, Text, ViewStyle } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { theme } from "../../constants";

interface AvatarProps {
  uri?: string | null;
  name?: string;
  size?: "small" | "medium" | "large" | "xlarge";
  style?: ViewStyle;
  showBadge?: boolean;
  badgeColor?: string;
}

export function Avatar({
  uri,
  name,
  size = "medium",
  style,
  showBadge = false,
  badgeColor = theme.colors.primary,
}: AvatarProps) {
  const getSize = () => {
    switch (size) {
      case "small":
        return 32;
      case "medium":
        return 48;
      case "large":
        return 64;
      case "xlarge":
        return 96;
      default:
        return 48;
    }
  };

  const getInitials = () => {
    if (!name) return "?";
    const names = name.split(" ");
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  const avatarSize = getSize();
  const fontSize = avatarSize * 0.4;
  const badgeSize = avatarSize * 0.25;

  return (
    <View
      style={[
        styles.container,
        { width: avatarSize, height: avatarSize },
        style,
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={[
            styles.image,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
            },
          ]}
        />
      ) : (
        <View
          style={[
            styles.placeholder,
            {
              width: avatarSize,
              height: avatarSize,
              borderRadius: avatarSize / 2,
            },
          ]}
        >
          {name ? (
            <Text style={[styles.initials, { fontSize }]}>{getInitials()}</Text>
          ) : (
            <FontAwesome name="user" size={fontSize} color="#fff" />
          )}
        </View>
      )}
      {showBadge && (
        <View
          style={[
            styles.badge,
            {
              width: badgeSize,
              height: badgeSize,
              borderRadius: badgeSize / 2,
              backgroundColor: badgeColor,
            },
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  image: {
    backgroundColor: "#e5e7eb",
  },
  placeholder: {
    backgroundColor: theme.colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  initials: {
    color: "#fff",
    fontWeight: "600",
  },
  badge: {
    position: "absolute",
    bottom: 0,
    right: 0,
    borderWidth: 2,
    borderColor: "#fff",
  },
});

export default Avatar;
