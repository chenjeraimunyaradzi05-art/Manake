import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { theme } from "../../constants";

interface StatCardProps {
  icon: keyof typeof FontAwesome.glyphMap;
  value: string | number;
  label: string;
  color?: string;
  onPress?: () => void;
}

export function StatCard({
  icon,
  value,
  label,
  color = theme.colors.primary,
  onPress,
}: StatCardProps) {
  const content = (
    <View style={styles.card}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}15` }]}>
        <FontAwesome name={icon} size={20} color={color} />
      </View>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );

  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return content;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    minWidth: 100,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  value: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 2,
  },
  label: {
    fontSize: 12,
    color: theme.colors.textLight,
    textAlign: "center",
  },
});

export default StatCard;
