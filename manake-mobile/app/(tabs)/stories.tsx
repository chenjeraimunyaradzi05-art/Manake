import React, { useEffect, useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { FontAwesome } from "@expo/vector-icons";
import { router } from "expo-router";
import { theme } from "../../constants";
import { StoryCard } from "../../components";
import { useStoriesStore } from "../../store";
import type { Story, StoryCategory } from "../../types";

const categories: {
  key: StoryCategory | "all";
  label: string;
  icon: keyof typeof FontAwesome.glyphMap;
}[] = [
  { key: "all", label: "All", icon: "th-large" },
  { key: "recovery", label: "Recovery", icon: "heart" },
  { key: "education", label: "Education", icon: "graduation-cap" },
  { key: "employment", label: "Employment", icon: "briefcase" },
  { key: "family", label: "Family", icon: "users" },
  { key: "community", label: "Community", icon: "globe" },
  { key: "life-skills", label: "Life Skills", icon: "lightbulb-o" },
];

export default function StoriesScreen() {
  const {
    stories,
    featuredStories,
    isLoading,
    error,
    hasMore,
    fetchStories,
    fetchFeaturedStories,
    loadMockData,
    likeStory,
    unlikeStory,
  } = useStoriesStore();

  const [selectedCategory, setSelectedCategory] = useState<
    StoryCategory | "all"
  >("all");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    // Fetch data; store falls back to mock in dev on failure.
    fetchStories(true);
    fetchFeaturedStories();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStories(true);
    await fetchFeaturedStories();
    setRefreshing(false);
  }, [fetchStories, fetchFeaturedStories]);

  const handleStoryPress = (story: Story) => {
    router.push(`/story/${story.id}`);
  };

  const handleLikePress = (story: Story) => {
    if (story.isLiked) {
      unlikeStory(story.id);
    } else {
      likeStory(story.id);
    }
  };

  const handleLoadMore = () => {
    if (!isLoading && hasMore) {
      fetchStories();
    }
  };

  const filteredStories =
    selectedCategory === "all"
      ? stories
      : stories.filter((s) => s.category === selectedCategory);

  const renderHeader = () => (
    <View>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Recovery Stories</Text>
        <Text style={styles.headerSubtitle}>
          Real stories of hope, healing, and transformation
        </Text>
      </View>

      {/* Featured Stories Carousel */}
      {featuredStories.length > 0 && (
        <View style={styles.featuredSection}>
          <Text style={styles.sectionTitle}>Featured</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.featuredScroll}
          >
            {featuredStories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                variant="featured"
                onPress={() => handleStoryPress(story)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Category Filter */}
      <View style={styles.filterSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.filterChip,
                selectedCategory === cat.key && styles.filterChipActive,
              ]}
              onPress={() => setSelectedCategory(cat.key)}
            >
              <FontAwesome
                name={cat.icon}
                size={14}
                color={
                  selectedCategory === cat.key ? "#fff" : theme.colors.textLight
                }
              />
              <Text
                style={[
                  styles.filterChipText,
                  selectedCategory === cat.key && styles.filterChipTextActive,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Stories Count */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          {filteredStories.length}{" "}
          {filteredStories.length === 1 ? "story" : "stories"}
        </Text>
        <TouchableOpacity style={styles.sortButton}>
          <FontAwesome
            name="sliders"
            size={16}
            color={theme.colors.textLight}
          />
          <Text style={styles.sortText}>Sort</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStoryCard = ({ item }: { item: Story }) => (
    <View style={styles.cardWrapper}>
      <StoryCard story={item} onPress={() => handleStoryPress(item)} />
    </View>
  );

  const renderFooter = () => {
    if (!isLoading) return null;
    return (
      <View style={styles.loaderFooter}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View style={styles.emptyState}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.emptyText}>Loading stories...</Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyState}>
        <FontAwesome name="book" size={48} color={theme.colors.textLight} />
        <Text style={styles.emptyTitle}>No Stories Found</Text>
        <Text style={styles.emptyText}>
          {selectedCategory !== "all"
            ? `No stories in the ${selectedCategory} category yet.`
            : "Check back soon for inspiring recovery stories."}
        </Text>
        {selectedCategory !== "all" && (
          <TouchableOpacity
            style={styles.resetButton}
            onPress={() => setSelectedCategory("all")}
          >
            <Text style={styles.resetButtonText}>View All Stories</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (error) {
    return (
      <View style={styles.errorState}>
        <FontAwesome
          name="exclamation-circle"
          size={48}
          color={theme.colors.danger}
        />
        <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => fetchStories(true)}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <FlatList
      data={filteredStories}
      renderItem={renderStoryCard}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={renderHeader}
      ListFooterComponent={renderFooter}
      ListEmptyComponent={renderEmpty}
      contentContainerStyle={styles.listContent}
      onEndReached={handleLoadMore}
      onEndReachedThreshold={0.5}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 20,
  },
  // Header
  header: {
    padding: 20,
    backgroundColor: theme.colors.primary,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 15,
    color: "rgba(255,255,255,0.85)",
  },
  // Featured Section
  featuredSection: {
    marginTop: 24,
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  featuredScroll: {
    paddingLeft: 20,
    paddingRight: 4,
  },
  // Filter Section
  filterSection: {
    marginTop: 16,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  filterChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  filterChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterChipText: {
    fontSize: 13,
    fontWeight: "500",
    color: theme.colors.textLight,
  },
  filterChipTextActive: {
    color: "#fff",
  },
  // Results Header
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 12,
  },
  resultsText: {
    fontSize: 14,
    color: theme.colors.textLight,
    fontWeight: "500",
  },
  sortButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sortText: {
    fontSize: 14,
    color: theme.colors.textLight,
  },
  // Card Wrapper
  cardWrapper: {
    paddingHorizontal: 20,
  },
  // Loading Footer
  loaderFooter: {
    paddingVertical: 20,
    alignItems: "center",
  },
  // Empty State
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: theme.colors.textLight,
    textAlign: "center",
    lineHeight: 20,
  },
  resetButton: {
    marginTop: 20,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  resetButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  // Error State
  errorState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 40,
    backgroundColor: "#f8f9fa",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: theme.colors.textLight,
    textAlign: "center",
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 20,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
