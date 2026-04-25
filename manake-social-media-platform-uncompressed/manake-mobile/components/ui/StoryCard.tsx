import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { theme } from "../../constants";
import type { Story } from "../../types";

interface StoryCardProps {
  story: Story;
  onPress: () => void;
  variant?: "default" | "compact" | "featured";
}

const { width } = Dimensions.get("window");

export function StoryCard({
  story,
  onPress,
  variant = "default",
}: StoryCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (variant === "compact") {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={styles.compactCard}
        activeOpacity={0.7}
      >
        <Image source={{ uri: story.image }} style={styles.compactImage} />
        <View style={styles.compactContent}>
          <Text style={styles.compactTitle} numberOfLines={2}>
            {story.title}
          </Text>
          <View style={styles.compactMeta}>
            <Text style={styles.compactAuthor}>{story.author}</Text>
            <View style={styles.statsRow}>
              <FontAwesome name="heart" size={12} color={theme.colors.danger} />
              <Text style={styles.statText}>{story.likes}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  if (variant === "featured") {
    return (
      <TouchableOpacity
        onPress={onPress}
        style={styles.featuredCard}
        activeOpacity={0.7}
      >
        <Image source={{ uri: story.image }} style={styles.featuredImage} />
        <View style={styles.featuredOverlay}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>
              {story.category.toUpperCase()}
            </Text>
          </View>
          <View style={styles.featuredContent}>
            <Text style={styles.featuredTitle} numberOfLines={2}>
              {story.title}
            </Text>
            <Text style={styles.featuredExcerpt} numberOfLines={2}>
              {story.excerpt}
            </Text>
            <View style={styles.featuredMeta}>
              <View style={styles.authorRow}>
                {story.authorImage && (
                  <Image
                    source={{ uri: story.authorImage }}
                    style={styles.authorImage}
                  />
                )}
                <Text style={styles.featuredAuthor}>{story.author}</Text>
              </View>
              <Text style={styles.featuredDate}>{story.readTime} min read</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  }

  // Default variant
  return (
    <TouchableOpacity onPress={onPress} style={styles.card} activeOpacity={0.7}>
      <Image source={{ uri: story.image }} style={styles.image} />
      <View style={styles.content}>
        <View style={styles.tagRow}>
          <View
            style={[
              styles.tag,
              { backgroundColor: getCategoryColor(story.category) },
            ]}
          >
            <Text style={styles.tagText}>{story.category}</Text>
          </View>
          <Text style={styles.readTime}>{story.readTime} min</Text>
        </View>
        <Text style={styles.title} numberOfLines={2}>
          {story.title}
        </Text>
        <Text style={styles.excerpt} numberOfLines={2}>
          {story.excerpt}
        </Text>
        <View style={styles.footer}>
          <View style={styles.authorRow}>
            {story.authorImage && (
              <Image
                source={{ uri: story.authorImage }}
                style={styles.authorImage}
              />
            )}
            <Text style={styles.author}>{story.author}</Text>
          </View>
          <View style={styles.statsRow}>
            <FontAwesome
              name={story.isLiked ? "heart" : "heart-o"}
              size={14}
              color={
                story.isLiked ? theme.colors.danger : theme.colors.textLight
              }
            />
            <Text style={styles.statText}>{story.likes}</Text>
            <FontAwesome
              name="comment-o"
              size={14}
              color={theme.colors.textLight}
              style={{ marginLeft: 12 }}
            />
            <Text style={styles.statText}>{story.comments}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    recovery: "#10b981",
    education: "#3b82f6",
    employment: "#8b5cf6",
    family: "#f59e0b",
    community: "#ec4899",
    "life-skills": "#06b6d4",
  };
  return colors[category] || theme.colors.primary;
};

const styles = StyleSheet.create({
  // Default Card
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 180,
  },
  content: {
    padding: 16,
  },
  tagRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  readTime: {
    fontSize: 12,
    color: theme.colors.textLight,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 8,
    lineHeight: 24,
  },
  excerpt: {
    fontSize: 14,
    color: theme.colors.textLight,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  authorRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  author: {
    fontSize: 13,
    color: theme.colors.text,
    fontWeight: "500",
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statText: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginLeft: 4,
  },

  // Compact Card
  compactCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  compactImage: {
    width: 100,
    height: 100,
  },
  compactContent: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  compactTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: theme.colors.text,
    lineHeight: 20,
  },
  compactMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  compactAuthor: {
    fontSize: 12,
    color: theme.colors.textLight,
  },

  // Featured Card
  featuredCard: {
    width: width - 40,
    height: 280,
    borderRadius: 20,
    overflow: "hidden",
    marginRight: 16,
  },
  featuredImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  featuredOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 20,
    justifyContent: "space-between",
  },
  categoryBadge: {
    alignSelf: "flex-start",
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  featuredContent: {},
  featuredTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 8,
    lineHeight: 28,
  },
  featuredExcerpt: {
    fontSize: 14,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 20,
    marginBottom: 12,
  },
  featuredMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  featuredAuthor: {
    fontSize: 13,
    color: "#fff",
    fontWeight: "500",
  },
  featuredDate: {
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
  },
});

export default StoryCard;
