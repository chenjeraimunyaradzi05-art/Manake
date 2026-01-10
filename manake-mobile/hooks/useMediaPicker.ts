/**
 * useMediaPicker Hook
 * Provides camera and gallery access for media selection
 */

import { useState, useCallback } from "react";
import { Alert, Platform } from "react-native";

// Type definitions - actual implementation requires: npx expo install expo-image-picker
export interface MediaAsset {
  uri: string;
  type: "image" | "video";
  name: string;
  mimeType: string;
  width?: number;
  height?: number;
  duration?: number;
}

export interface UseMediaPickerOptions {
  allowsMultipleSelection?: boolean;
  maxSelection?: number;
  mediaTypes?: "images" | "videos" | "all";
  quality?: number;
  allowsEditing?: boolean;
  aspect?: [number, number];
  videoMaxDuration?: number;
}

interface ImagePickerAsset {
  uri: string;
  type?: string;
  fileName?: string;
  mimeType?: string;
  width: number;
  height: number;
  duration?: number;
}

interface ImagePickerResult {
  canceled: boolean;
  assets?: ImagePickerAsset[];
}

const defaultOptions: UseMediaPickerOptions = {
  allowsMultipleSelection: false,
  maxSelection: 5,
  mediaTypes: "all",
  quality: 0.8,
  allowsEditing: true,
  aspect: [4, 3],
  videoMaxDuration: 60,
};

let ImagePicker: any = null;

// Try to load expo-image-picker
async function loadImagePicker() {
  try {
    ImagePicker = await import("expo-image-picker");
  } catch {
    console.log("expo-image-picker not installed");
  }
}

loadImagePicker();

export function useMediaPicker(options: UseMediaPickerOptions = {}) {
  const [selectedMedia, setSelectedMedia] = useState<MediaAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const mergedOptions = { ...defaultOptions, ...options };

  const getMimeType = (uri: string, type: "image" | "video"): string => {
    const extension = uri.split(".").pop()?.toLowerCase();

    if (type === "video") {
      switch (extension) {
        case "mp4":
          return "video/mp4";
        case "mov":
          return "video/quicktime";
        case "avi":
          return "video/x-msvideo";
        default:
          return "video/mp4";
      }
    }

    switch (extension) {
      case "png":
        return "image/png";
      case "gif":
        return "image/gif";
      case "webp":
        return "image/webp";
      case "heic":
        return "image/heic";
      default:
        return "image/jpeg";
    }
  };

  const requestCameraPermission = async (): Promise<boolean> => {
    if (!ImagePicker) {
      Alert.alert("Not Available", "Camera is not available");
      return false;
    }
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Camera Permission Required",
        "Please grant camera access to take photos and videos.",
        [{ text: "OK" }],
      );
      return false;
    }
    return true;
  };

  const requestMediaLibraryPermission = async (): Promise<boolean> => {
    if (!ImagePicker) {
      Alert.alert("Not Available", "Media library is not available");
      return false;
    }
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Media Library Permission Required",
        "Please grant media library access to select photos and videos.",
        [{ text: "OK" }],
      );
      return false;
    }
    return true;
  };

  const processPickerResult = (result: ImagePickerResult): MediaAsset[] => {
    if (result.canceled || !result.assets) {
      return [];
    }

    return result.assets.map((asset: ImagePickerAsset) => {
      const type = asset.type === "video" ? "video" : "image";
      return {
        uri: asset.uri,
        type,
        name:
          asset.fileName || asset.uri.split("/").pop() || `media_${Date.now()}`,
        mimeType: asset.mimeType || getMimeType(asset.uri, type),
        width: asset.width,
        height: asset.height,
        duration: asset.duration,
      };
    });
  };

  const openCamera = useCallback(async (): Promise<MediaAsset | null> => {
    if (!ImagePicker) {
      Alert.alert("Not Available", "Please install expo-image-picker");
      return null;
    }

    setIsLoading(true);
    try {
      const hasPermission = await requestCameraPermission();
      if (!hasPermission) return null;

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: mergedOptions.allowsEditing,
        aspect: mergedOptions.aspect,
        quality: mergedOptions.quality,
        videoMaxDuration: mergedOptions.videoMaxDuration,
      });

      const assets = processPickerResult(result);
      if (assets.length > 0) {
        setSelectedMedia((prev) =>
          [...prev, ...assets].slice(0, mergedOptions.maxSelection),
        );
        return assets[0];
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [mergedOptions]);

  const openGallery = useCallback(async (): Promise<MediaAsset[]> => {
    if (!ImagePicker) {
      Alert.alert("Not Available", "Please install expo-image-picker");
      return [];
    }

    setIsLoading(true);
    try {
      const hasPermission = await requestMediaLibraryPermission();
      if (!hasPermission) return [];

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing:
          !mergedOptions.allowsMultipleSelection && mergedOptions.allowsEditing,
        allowsMultipleSelection: mergedOptions.allowsMultipleSelection,
        selectionLimit: mergedOptions.maxSelection,
        aspect: mergedOptions.aspect,
        quality: mergedOptions.quality,
        videoMaxDuration: mergedOptions.videoMaxDuration,
      });

      const assets = processPickerResult(result);
      if (assets.length > 0) {
        setSelectedMedia((prev) =>
          [...prev, ...assets].slice(0, mergedOptions.maxSelection),
        );
      }
      return assets;
    } finally {
      setIsLoading(false);
    }
  }, [mergedOptions]);

  const showPicker = useCallback(async (): Promise<void> => {
    Alert.alert(
      "Add Media",
      "Choose a source",
      [
        {
          text: "Camera",
          onPress: () => openCamera(),
        },
        {
          text: "Gallery",
          onPress: () => openGallery(),
        },
        {
          text: "Cancel",
          style: "cancel",
        },
      ],
      { cancelable: true },
    );
  }, [openCamera, openGallery]);

  const removeMedia = useCallback((uri: string) => {
    setSelectedMedia((prev) => prev.filter((m) => m.uri !== uri));
  }, []);

  const clearMedia = useCallback(() => {
    setSelectedMedia([]);
  }, []);

  const canAddMore = selectedMedia.length < (mergedOptions.maxSelection || 5);

  return {
    selectedMedia,
    isLoading,
    openCamera,
    openGallery,
    showPicker,
    removeMedia,
    clearMedia,
    canAddMore,
    setSelectedMedia,
  };
}

export default useMediaPicker;
