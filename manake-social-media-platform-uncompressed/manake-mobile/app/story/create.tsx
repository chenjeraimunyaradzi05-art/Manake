/**
 * Create Story Screen
 * Allows users to share their stories with optional media uploads
 */

import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { theme } from "../../constants";
import { useAuth, useConnectivity } from "../../hooks";
import { useMediaPicker, MediaAsset } from "../../hooks/useMediaPicker";
import { useToast } from "../../components";
import storyUploadService, {
  StoryUploadData,
  UploadProgress,
} from "../../services/storyUpload";

type Category = StoryUploadData["category"];

const CATEGORIES: {
  value: Category;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}[] = [
  { value: "survivor", label: "Survivor", icon: "heart-outline" },
  { value: "volunteer", label: "Volunteer", icon: "hand-left-outline" },
  { value: "donor", label: "Donor", icon: "gift-outline" },
  { value: "community", label: "Community", icon: "people-outline" },
  { value: "staff", label: "Staff", icon: "briefcase-outline" },
];

export default function CreateStoryScreen() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { isConnected } = useConnectivity();
  const { showToast } = useToast();

  const {
    selectedMedia,
    isLoading: mediaLoading,
    openCamera,
    openGallery,
    showPicker,
    removeMedia,
    clearMedia,
    canAddMore,
  } = useMediaPicker({
    allowsMultipleSelection: true,
    maxSelection: 5,
    mediaTypes: "all",
  });

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<Category>("community");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(
    null,
  );

  const isValid = title.trim().length >= 5 && content.trim().length >= 20;

  const handleSubmit = useCallback(async () => {
    if (!isAuthenticated) {
      Alert.alert("Sign In Required", "Please sign in to share your story.");
      return;
    }

    if (!isConnected) {
      // Save as draft for later
      Alert.alert(
        "No Connection",
        "Would you like to save this story as a draft?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Save Draft",
            onPress: async () => {
              const data: StoryUploadData = {
                title: title.trim(),
                content: content.trim(),
                category,
                isAnonymous,
                media: selectedMedia.map((m) => ({
                  uri: m.uri,
                  type: m.type,
                  name: m.name,
                  mimeType: m.mimeType,
                })),
              };
              await storyUploadService.saveDraft(data);
              showToast("Story saved as draft", "success");
              router.back();
            },
          },
        ],
      );
      return;
    }

    if (!isValid) {
      showToast(
        "Please add a title (5+ chars) and content (20+ chars)",
        "error",
      );
      return;
    }

    setSubmitting(true);
    setUploadProgress(null);

    try {
      const data: StoryUploadData = {
        title: title.trim(),
        content: content.trim(),
        category,
        isAnonymous,
        media: selectedMedia.map((m) => ({
          uri: m.uri,
          type: m.type,
          name: m.name,
          mimeType: m.mimeType,
        })),
      };

      const response = await storyUploadService.createStory(
        data,
        (progress) => {
          setUploadProgress(progress);
        },
      );

      showToast(response.message || "Story submitted for review!", "success");
      router.replace("/stories");
    } catch (error) {
      console.error("Failed to submit story:", error);
      showToast("Failed to submit story. Please try again.", "error");
    } finally {
      setSubmitting(false);
      setUploadProgress(null);
    }
  }, [
    isAuthenticated,
    isConnected,
    isValid,
    title,
    content,
    category,
    isAnonymous,
    selectedMedia,
    showToast,
    router,
  ]);

  const handleSaveDraft = useCallback(async () => {
    const data: StoryUploadData = {
      title: title.trim(),
      content: content.trim(),
      category,
      isAnonymous,
      media: selectedMedia.map((m) => ({
        uri: m.uri,
        type: m.type,
        name: m.name,
        mimeType: m.mimeType,
      })),
    };

    await storyUploadService.saveDraft(data);
    showToast("Draft saved", "success");
  }, [title, content, category, isAnonymous, selectedMedia, showToast]);

  const renderMediaPreview = () => {
    if (selectedMedia.length === 0) return null;

    return (
      <View style={styles.mediaPreviewContainer}>
        <View style={styles.mediaPreviewHeader}>
          <Text style={styles.mediaPreviewTitle}>
            Media ({selectedMedia.length}/5)
          </Text>
          <TouchableOpacity onPress={clearMedia}>
            <Text style={styles.clearMediaText}>Clear All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.mediaScroll}
        >
          {selectedMedia.map((media) => (
            <View key={media.uri} style={styles.mediaItem}>
              <Image
                source={{ uri: media.uri }}
                style={styles.mediaThumbnail}
              />
              {media.type === "video" && (
                <View style={styles.videoIndicator}>
                  <Ionicons name="play" size={16} color="#fff" />
                </View>
              )}
              <TouchableOpacity
                style={styles.removeMediaButton}
                onPress={() => removeMedia(media.uri)}
              >
                <Ionicons name="close-circle" size={24} color="#DC2626" />
              </TouchableOpacity>
            </View>
          ))}
          {canAddMore && (
            <TouchableOpacity
              style={styles.addMediaButton}
              onPress={showPicker}
              disabled={mediaLoading}
            >
              {mediaLoading ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <Ionicons name="add" size={32} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          )}
        </ScrollView>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Share Your Story</Text>
          <TouchableOpacity
            onPress={handleSaveDraft}
            style={styles.draftButton}
          >
            <Ionicons
              name="save-outline"
              size={24}
              color={theme.colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Title Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Title *</Text>
          <TextInput
            style={styles.titleInput}
            placeholder="Give your story a title..."
            placeholderTextColor={theme.colors.textSecondary}
            value={title}
            onChangeText={setTitle}
            maxLength={100}
          />
          <Text style={styles.charCount}>{title.length}/100</Text>
        </View>

        {/* Category Selector */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Category *</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
          >
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[
                  styles.categoryChip,
                  category === cat.value && styles.categoryChipActive,
                ]}
                onPress={() => setCategory(cat.value)}
              >
                <Ionicons
                  name={cat.icon}
                  size={18}
                  color={
                    category === cat.value ? "#fff" : theme.colors.textSecondary
                  }
                />
                <Text
                  style={[
                    styles.categoryText,
                    category === cat.value && styles.categoryTextActive,
                  ]}
                >
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Content Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Your Story *</Text>
          <TextInput
            style={styles.contentInput}
            placeholder="Share your experience, journey, or message..."
            placeholderTextColor={theme.colors.textSecondary}
            value={content}
            onChangeText={setContent}
            multiline
            numberOfLines={8}
            textAlignVertical="top"
            maxLength={5000}
          />
          <Text style={styles.charCount}>{content.length}/5000</Text>
        </View>

        {/* Media Upload */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Add Photos/Videos</Text>
          {selectedMedia.length === 0 ? (
            <View style={styles.mediaButtons}>
              <TouchableOpacity
                style={styles.mediaButton}
                onPress={openCamera}
                disabled={mediaLoading}
              >
                <Ionicons
                  name="camera-outline"
                  size={28}
                  color={theme.colors.primary}
                />
                <Text style={styles.mediaButtonText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.mediaButton}
                onPress={openGallery}
                disabled={mediaLoading}
              >
                <Ionicons
                  name="images-outline"
                  size={28}
                  color={theme.colors.primary}
                />
                <Text style={styles.mediaButtonText}>Gallery</Text>
              </TouchableOpacity>
            </View>
          ) : (
            renderMediaPreview()
          )}
        </View>

        {/* Anonymous Toggle */}
        <TouchableOpacity
          style={styles.anonymousToggle}
          onPress={() => setIsAnonymous(!isAnonymous)}
        >
          <View style={styles.anonymousInfo}>
            <Ionicons
              name={isAnonymous ? "eye-off-outline" : "eye-outline"}
              size={24}
              color={theme.colors.text}
            />
            <View style={styles.anonymousText}>
              <Text style={styles.anonymousTitle}>Post Anonymously</Text>
              <Text style={styles.anonymousSubtitle}>
                Your name won't be shown publicly
              </Text>
            </View>
          </View>
          <View style={[styles.toggle, isAnonymous && styles.toggleActive]}>
            <View
              style={[
                styles.toggleKnob,
                isAnonymous && styles.toggleKnobActive,
              ]}
            />
          </View>
        </TouchableOpacity>

        {/* Upload Progress */}
        {uploadProgress && (
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              Uploading... {uploadProgress.percentage}%
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${uploadProgress.percentage}%` },
                ]}
              />
            </View>
          </View>
        )}

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            (!isValid || submitting) && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!isValid || submitting}
        >
          {submitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="paper-plane-outline" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>Submit Story</Text>
            </>
          )}
        </TouchableOpacity>

        <Text style={styles.disclaimer}>
          Your story will be reviewed before being published. We may reach out
          for verification or additional details.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingTop: 8,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: theme.colors.text,
  },
  draftButton: {
    padding: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: 8,
  },
  titleInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  charCount: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: "right",
    marginTop: 4,
  },
  categoryScroll: {
    flexGrow: 0,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: theme.colors.surface,
    marginRight: 8,
    gap: 6,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  categoryChipActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  categoryText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
  },
  categoryTextActive: {
    color: "#fff",
    fontWeight: "600",
  },
  contentInput: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: theme.colors.text,
    borderWidth: 1,
    borderColor: theme.colors.border,
    minHeight: 160,
  },
  mediaButtons: {
    flexDirection: "row",
    gap: 12,
  },
  mediaButton: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: theme.colors.border,
  },
  mediaButtonText: {
    marginTop: 8,
    fontSize: 14,
    color: theme.colors.primary,
    fontWeight: "500",
  },
  mediaPreviewContainer: {
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 12,
  },
  mediaPreviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  mediaPreviewTitle: {
    fontSize: 14,
    color: theme.colors.text,
    fontWeight: "500",
  },
  clearMediaText: {
    fontSize: 14,
    color: "#DC2626",
  },
  mediaScroll: {
    flexGrow: 0,
  },
  mediaItem: {
    position: "relative",
    marginRight: 8,
  },
  mediaThumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: theme.colors.background,
  },
  videoIndicator: {
    position: "absolute",
    bottom: 4,
    left: 4,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 4,
    padding: 2,
  },
  removeMediaButton: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#fff",
    borderRadius: 12,
  },
  addMediaButton: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: theme.colors.background,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: theme.colors.border,
  },
  anonymousToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: theme.colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  anonymousInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  anonymousText: {
    flex: 1,
  },
  anonymousTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colors.text,
  },
  anonymousSubtitle: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    marginTop: 2,
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.border,
    padding: 2,
  },
  toggleActive: {
    backgroundColor: theme.colors.primary,
  },
  toggleKnob: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
  },
  toggleKnobActive: {
    transform: [{ translateX: 22 }],
  },
  progressContainer: {
    marginBottom: 20,
  },
  progressText: {
    fontSize: 14,
    color: theme.colors.text,
    marginBottom: 8,
  },
  progressBar: {
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: theme.colors.primary,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.primary,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    marginBottom: 16,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
  },
  disclaimer: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 18,
  },
});
