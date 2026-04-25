/**
 * Story Upload Service
 * Handles story creation with image/video uploads
 */

import { Platform } from "react-native";
import { getAuthToken } from "./api";

// FileSystem will be dynamically imported if available
let FileSystem: any = null;

async function loadFileSystem() {
  try {
    FileSystem = await import("expo-file-system");
  } catch {
    console.log("expo-file-system not available");
  }
}

loadFileSystem();

// API Configuration
const API_BASE_URL = __DEV__
  ? Platform.select({
      ios: "http://localhost:3001/api",
      android: "http://10.0.2.2:3001/api",
      default: "http://localhost:3001/api",
    })
  : "https://manake.netlify.app/api";

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP ${response.status}`);
  }

  return response.json();
}

export interface StoryUploadData {
  title: string;
  content: string;
  category: "survivor" | "volunteer" | "donor" | "community" | "staff";
  isAnonymous: boolean;
  media?: {
    uri: string;
    type: "image" | "video";
    name: string;
    mimeType: string;
  }[];
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface StoryUploadResponse {
  id: string;
  title: string;
  status: "pending" | "published";
  message: string;
}

/**
 * Upload media file to server
 */
async function uploadMedia(
  uri: string,
  mimeType: string,
  _onProgress?: (progress: UploadProgress) => void,
): Promise<string> {
  // Check file exists if FileSystem is available
  if (FileSystem) {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      throw new Error("File not found");
    }
  }

  // Create form data
  const formData = new FormData();
  formData.append("file", {
    uri,
    type: mimeType,
    name: uri.split("/").pop() || "upload",
  } as any);

  // Upload (note: fetch doesn't support progress tracking)
  const response = await fetchApi<{ url: string }>("/stories/upload", {
    method: "POST",
    body: formData,
  });

  return response.url;
}

/**
 * Create a new story with optional media
 */
export async function createStory(
  data: StoryUploadData,
  onProgress?: (progress: UploadProgress) => void,
): Promise<StoryUploadResponse> {
  const mediaUrls: string[] = [];

  // Upload media files first
  if (data.media && data.media.length > 0) {
    for (let i = 0; i < data.media.length; i++) {
      const media = data.media[i];
      const url = await uploadMedia(media.uri, media.mimeType, (progress) => {
        // Adjust progress for multiple files
        const adjustedProgress: UploadProgress = {
          ...progress,
          percentage: Math.round(
            (i / data.media!.length) * 100 +
              progress.percentage / data.media!.length,
          ),
        };
        onProgress?.(adjustedProgress);
      });
      mediaUrls.push(url);
    }
  }

  // Create the story
  return fetchApi<StoryUploadResponse>("/stories", {
    method: "POST",
    body: JSON.stringify({
      title: data.title,
      content: data.content,
      category: data.category,
      isAnonymous: data.isAnonymous,
      imageUrl: mediaUrls[0],
      mediaUrls,
    }),
  });
}

/**
 * Update an existing story
 */
export async function updateStory(
  storyId: string,
  data: Partial<StoryUploadData>,
  onProgress?: (progress: UploadProgress) => void,
): Promise<StoryUploadResponse> {
  const mediaUrls: string[] = [];

  // Upload any new media files
  if (data.media && data.media.length > 0) {
    for (let i = 0; i < data.media.length; i++) {
      const media = data.media[i];
      // Skip already uploaded URLs
      if (media.uri.startsWith("http")) {
        mediaUrls.push(media.uri);
        continue;
      }
      const url = await uploadMedia(media.uri, media.mimeType, onProgress);
      mediaUrls.push(url);
    }
  }

  return fetchApi<StoryUploadResponse>(`/stories/${storyId}`, {
    method: "PATCH",
    body: JSON.stringify({
      ...data,
      imageUrl: mediaUrls[0],
      mediaUrls,
      media: undefined,
    }),
  });
}

/**
 * Delete a story
 */
export async function deleteStory(storyId: string): Promise<void> {
  await fetchApi(`/stories/${storyId}`, { method: "DELETE" });
}

/**
 * Get user's draft stories
 */
export async function getDraftStories(): Promise<StoryUploadResponse[]> {
  return fetchApi<StoryUploadResponse[]>("/stories/drafts");
}

/**
 * Save story as draft locally (for offline)
 */
export async function saveDraft(data: StoryUploadData): Promise<string> {
  if (!FileSystem) {
    console.log("FileSystem not available, cannot save draft");
    return `draft_${Date.now()}`;
  }

  const draftId = `draft_${Date.now()}`;
  const draftsDir = `${FileSystem.documentDirectory}drafts/`;

  // Ensure drafts directory exists
  await FileSystem.makeDirectoryAsync(draftsDir, { intermediates: true });

  // Save draft data
  await FileSystem.writeAsStringAsync(
    `${draftsDir}${draftId}.json`,
    JSON.stringify({ ...data, savedAt: new Date().toISOString() }),
  );

  return draftId;
}

/**
 * Load a saved draft
 */
export async function loadDraft(
  draftId: string,
): Promise<StoryUploadData | null> {
  if (!FileSystem) return null;

  const draftsDir = `${FileSystem.documentDirectory}drafts/`;
  const draftPath = `${draftsDir}${draftId}.json`;

  try {
    const content = await FileSystem.readAsStringAsync(draftPath);
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * Delete a draft
 */
export async function deleteDraft(draftId: string): Promise<void> {
  if (!FileSystem) return;

  const draftsDir = `${FileSystem.documentDirectory}drafts/`;
  await FileSystem.deleteAsync(`${draftsDir}${draftId}.json`, {
    idempotent: true,
  });
}

/**
 * Get all local drafts
 */
export async function getLocalDrafts(): Promise<
  { id: string; data: StoryUploadData }[]
> {
  if (!FileSystem) return [];

  const draftsDir = `${FileSystem.documentDirectory}drafts/`;

  try {
    const files = await FileSystem.readDirectoryAsync(draftsDir);
    const drafts = await Promise.all(
      files
        .filter((f: string) => f.endsWith(".json"))
        .map(async (f: string) => {
          const id = f.replace(".json", "");
          const data = await loadDraft(id);
          return data ? { id, data } : null;
        }),
    );
    return drafts.filter(Boolean) as { id: string; data: StoryUploadData }[];
  } catch {
    return [];
  }
}

export default {
  createStory,
  updateStory,
  deleteStory,
  getDraftStories,
  saveDraft,
  loadDraft,
  deleteDraft,
  getLocalDrafts,
};
