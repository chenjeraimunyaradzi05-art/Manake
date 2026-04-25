/**
 * Social Feed Screen
 * Displays aggregated social media posts from Instagram, Facebook, and Twitter
 */

import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../constants";
import { useAuth, useConnectivity } from "../../hooks";
import { useToast } from "../../components";
import api from "../../services/api";
import { router } from "expo-router";
import socialFeedService, {
  SocialPost,
  SocialFeedFilters,
} from "../../services/socialFeed";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type Platform = "all" | "instagram" | "facebook" | "twitter";

const PLATFORM_ICONS: Record<Platform, keyof typeof Ionicons.glyphMap> = {
  all: "apps-outline",
  instagram: "logo-instagram",
  facebook: "logo-facebook",
  twitter: "logo-twitter",
};

const PLATFORM_COLORS: Record<Platform, string> = {
  all: theme.colors.primary,
  instagram: "#E4405F",
  facebook: "#1877F2",
  twitter: "#1DA1F2",
};

interface PostCardProps {
  post: SocialPost;
  onLike: () => void;
  onShare: () => void;
  onOpen: () => void;
}

function PostCard({ post, onLike, onShare, onOpen }: PostCardProps) {
  const platformColor = PLATFORM_COLORS[post.platform];

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString();
  };

  const formatNumber = (num?: number) => {
    if (!num) return "0";
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  return (
    <View style={styles.postCard}>
      {/* Header */}
      <View style={styles.postHeader}>
        <View style={styles.authorContainer}>
          {post.author.avatarUrl ? (
            <Image
              source={{ uri: post.author.avatarUrl }}
              style={styles.avatar}
            />
          ) : (
            <View
              style={[
                styles.avatarPlaceholder,
                { backgroundColor: platformColor },
              ]}
            >
              <Text style={styles.avatarInitial}>
                {post.author.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
          <View style={styles.authorInfo}>
            <Text style={styles.authorName}>{post.author.name}</Text>
            <Text style={styles.authorUsername}>@{post.author.username}</Text>
          </View>
        </View>
        <View
          style={[styles.platformBadge, { backgroundColor: platformColor }]}
        >
          <Ionicons
            name={PLATFORM_ICONS[post.platform]}
            size={14}
            color="#fff"
          />
        </View>
      </View>

      {/* Content */}
      <Text style={styles.postContent} numberOfLines={5}>
        {post.content}
      </Text>

      {/* Media */}
      {post.mediaUrl && (
        <TouchableOpacity onPress={onOpen} activeOpacity={0.9}>
          <View style={styles.mediaContainer}>
            <Image
              source={{ uri: post.thumbnailUrl || post.mediaUrl }}
              style={styles.mediaImage}
              resizeMode="cover"
            />
            {post.mediaType === "video" && (
              <View style={styles.playButton}>
                <Ionicons name="play" size={32} color="#fff" />
              </View>
            )}
            {post.mediaType === "carousel" && (
              <View style={styles.carouselIndicator}>
                <Ionicons name="copy-outline" size={16} color="#fff" />
              </View>
            )}
          </View>
        </TouchableOpacity>
      )}

      {/* Timestamp */}
      <Text style={styles.timestamp}>{formatTimestamp(post.timestamp)}</Text>

      {/* Actions */}
      <View style={styles.postActions}>
        <TouchableOpacity style={styles.actionButton} onPress={onLike}>
          <Ionicons
            name="heart-outline"
            size={20}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.actionText}>{formatNumber(post.likes)}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons
            name="chatbubble-outline"
            size={20}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.actionText}>{formatNumber(post.comments)}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onShare}>
          <Ionicons
            name="share-outline"
            size={20}
            color={theme.colors.textSecondary}
          />
          <Text style={styles.actionText}>{formatNumber(post.shares)}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onOpen}>
          <Ionicons
            name="open-outline"
            size={20}
            color={theme.colors.textSecondary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function SocialFeedScreen() {
  const { isAuthenticated } = useAuth();
  const { isConnected } = useConnectivity();
  const { showToast } = useToast();

  const [posts, setPosts] = useState<SocialPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  const [hasMore, setHasMore] = useState(true);
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>("all");

  const fetchPosts = useCallback(
    async (refresh = false) => {
      if (!isConnected) {
        showToast("No internet connection", "error");
        return;
      }

      try {
        if (refresh) {
          setRefreshing(true);
        } else if (!posts.length) {
          setLoading(true);
        }

        const filters: SocialFeedFilters = {
          limit: 20,
          platforms:
            selectedPlatform === "all" ? undefined : [selectedPlatform],
        };

        if (!refresh && nextCursor) {
          filters.cursor = nextCursor;
        }

        const response = await socialFeedService.getSocialFeed(filters);

        if (refresh) {
          setPosts(response.posts);
        } else {
          setPosts((prev) => [...prev, ...response.posts]);
        }

        setNextCursor(response.nextCursor);
        setHasMore(response.hasMore);
      } catch (error) {
        console.error("Failed to fetch social feed:", error);
        showToast("Failed to load social feed", "error");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [isConnected, selectedPlatform, nextCursor, posts.length, showToast],
  );

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !nextCursor) return;

    setLoadingMore(true);
    await fetchPosts(false);
    setLoadingMore(false);
  }, [fetchPosts, hasMore, loadingMore, nextCursor]);

  const handleRefresh = useCallback(() => {
    setNextCursor(undefined);
    fetchPosts(true);
  }, [fetchPosts]);

  const handlePlatformChange = useCallback((platform: Platform) => {
    setSelectedPlatform(platform);
    setPosts([]);
    setNextCursor(undefined);
    setHasMore(true);
  }, []);

  const handleLike = useCallback(
    async (post: SocialPost) => {
      if (!isAuthenticated) {
        showToast("Please log in to like posts", "error");
        return;
      }

      try {
        const shouldUnlike = Boolean(post.isLiked);

        // Optimistic UI update
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id !== post.id || p.platform !== post.platform) return p;
            const nextLikes = Math.max(0, (p.likes || 0) + (shouldUnlike ? -1 : 1));
            return { ...p, likes: nextLikes, isLiked: !shouldUnlike };
          }),
        );

        if (shouldUnlike) {
          await socialFeedService.unlikeSocialPost(post.id, post.platform);
          showToast("Like removed", "success");
        } else {
          await socialFeedService.likeSocialPost(post.id, post.platform);
          showToast("Post liked!", "success");
        }
      } catch (error) {
        // Revert optimistic update on failure
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id !== post.id || p.platform !== post.platform) return p;
            return { ...p, likes: post.likes, isLiked: post.isLiked };
          }),
        );
        showToast("Failed to like post", "error");
      }
    },
    [isAuthenticated, showToast],
  );

  const handleShare = useCallback(
    async (post: SocialPost) => {
      if (!isAuthenticated) {
        showToast("Please log in to share posts", "error");
        return;
      }

      try {
        // Optimistic UI update
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id !== post.id || p.platform !== post.platform) return p;
            return {
              ...p,
              shares: (p.shares || 0) + 1,
              isShared: true,
            };
          }),
        );

        await socialFeedService.shareSocialPost(post.id, post.platform);
        showToast("Post shared!", "success");
      } catch (error) {
        // Revert optimistic update on failure
        setPosts((prev) =>
          prev.map((p) => {
            if (p.id !== post.id || p.platform !== post.platform) return p;
            return { ...p, shares: post.shares, isShared: post.isShared };
          }),
        );
        showToast("Failed to share post", "error");
      }
    },
    [isAuthenticated, showToast],
  );

  const handleOpenPost = useCallback((post: SocialPost) => {
    // Keep users inside the app for web content
    router.push({
      pathname: "/webview",
      params: { url: post.permalink, title: "Social post" },
    });
  }, []);

  useEffect(() => {
    fetchPosts(true);
  }, [selectedPlatform]);

  const renderPlatformFilter = () => (
    <View style={styles.platformFilter}>
      {(["all", "instagram", "facebook", "twitter"] as Platform[]).map(
        (platform) => (
          <TouchableOpacity
            key={platform}
            style={[
              styles.platformButton,
              selectedPlatform === platform && {
                backgroundColor: PLATFORM_COLORS[platform],
              },
            ]}
            onPress={() => handlePlatformChange(platform)}
          >
            <Ionicons
              name={PLATFORM_ICONS[platform]}
              size={20}
              color={
                selectedPlatform === platform
                  ? "#fff"
                  : theme.colors.textSecondary
              }
            />
            <Text
              style={[
                styles.platformButtonText,
                selectedPlatform === platform && { color: "#fff" },
              ]}
            >
              {platform.charAt(0).toUpperCase() + platform.slice(1)}
            </Text>
          </TouchableOpacity>
        ),
      )}
    </View>
  );

  const renderPost = ({ item }: { item: SocialPost }) => (
    <PostCard
      post={item}
      onLike={() => handleLike(item)}
      onShare={() => handleShare(item)}
      onOpen={() => handleOpenPost(item)}
    />
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color={theme.colors.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyState}>
        <Ionicons
          name="newspaper-outline"
          size={64}
          color={theme.colors.textSecondary}
        />
        <Text style={styles.emptyTitle}>No posts yet</Text>
        <Text style={styles.emptySubtitle}>
          Connect your social accounts to see posts here
        </Text>
      </View>
    );
  };

  if (loading && !posts.length) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading social feed...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderPlatformFilter()}
      <FlatList
        data={posts}
        keyExtractor={(item) => `${item.platform}-${item.id}`}
        renderItem={renderPost}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={theme.colors.primary}
          />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={
          posts.length === 0 ? styles.emptyList : undefined
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: theme.colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.colors.textSecondary,
  },
  platformFilter: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  platformButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    gap: 6,
  },
  platformButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  postCard: {
    backgroundColor: theme.colors.surface,
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  authorContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarInitial: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
  },
  authorInfo: {
    marginLeft: 12,
    flex: 1,
  },
  authorName: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
  },
  authorUsername: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  platformBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  postContent: {
    fontSize: 14,
    lineHeight: 20,
    color: theme.colors.text,
    marginBottom: 12,
  },
  mediaContainer: {
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 12,
    position: "relative",
  },
  mediaImage: {
    width: "100%",
    height: SCREEN_WIDTH - 64,
    backgroundColor: theme.colors.background,
  },
  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -24,
    marginLeft: -24,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  carouselIndicator: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 4,
    borderRadius: 4,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  timestamp: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginBottom: 12,
  },
  postActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: 12,
    gap: 24,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  actionText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
  },
  loadingMore: {
    paddingVertical: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colors.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
  },
  emptyList: {
    flex: 1,
  },
});
