import React, { useEffect, useRef } from "react";
import {
  View,
  Animated,
  StyleSheet,
  ViewStyle,
  DimensionValue,
} from "react-native";
import { theme } from "../../constants";

interface SkeletonLoaderProps {
  /** Width of the skeleton. Can be a number or percentage string */
  width?: DimensionValue;
  /** Height of the skeleton. Can be a number or percentage string */
  height?: DimensionValue;
  /** Border radius of the skeleton */
  borderRadius?: number;
  /** Whether to make it circular (overrides borderRadius) */
  circle?: boolean;
  /** Custom styles */
  style?: ViewStyle;
}

/**
 * A skeleton loader component for showing loading placeholders
 */
export function SkeletonLoader({
  width = "100%",
  height = 16,
  borderRadius = 4,
  circle = false,
  style,
}: SkeletonLoaderProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  const size = circle ? (typeof height === "number" ? height : 40) : undefined;

  return (
    <Animated.View
      style={[
        styles.skeleton,
        {
          width: circle ? size : width,
          height: circle ? size : height,
          borderRadius: circle ? (size ? size / 2 : 20) : borderRadius,
          opacity,
        },
        style,
      ]}
    />
  );
}

/**
 * Pre-built skeleton for a story card
 */
export function StoryCardSkeleton() {
  return (
    <View style={styles.storyCard}>
      <SkeletonLoader
        height={200}
        borderRadius={12}
        style={styles.storyImage}
      />
      <View style={styles.storyContent}>
        <SkeletonLoader width="80%" height={20} style={styles.mb8} />
        <SkeletonLoader width="100%" height={14} style={styles.mb4} />
        <SkeletonLoader width="60%" height={14} style={styles.mb16} />
        <View style={styles.storyFooter}>
          <View style={styles.authorRow}>
            <SkeletonLoader circle height={32} />
            <SkeletonLoader width={100} height={14} style={styles.ml8} />
          </View>
          <SkeletonLoader width={60} height={14} />
        </View>
      </View>
    </View>
  );
}

/**
 * Pre-built skeleton for a list of items
 */
export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <View key={index} style={styles.listItem}>
          <SkeletonLoader circle height={48} />
          <View style={styles.listItemContent}>
            <SkeletonLoader width="70%" height={16} style={styles.mb4} />
            <SkeletonLoader width="50%" height={12} />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: theme.colors.border,
  },
  storyCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
  },
  storyImage: {
    width: "100%",
  },
  storyContent: {
    padding: 16,
  },
  storyFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  listItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  listItemContent: {
    flex: 1,
    marginLeft: 12,
  },
  mb4: {
    marginBottom: 4,
  },
  mb8: {
    marginBottom: 8,
  },
  mb16: {
    marginBottom: 16,
  },
  ml8: {
    marginLeft: 8,
  },
});

export default SkeletonLoader;
