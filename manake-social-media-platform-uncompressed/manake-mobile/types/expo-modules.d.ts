// Type declarations for optional Expo packages
// These packages are dynamically imported and have runtime fallbacks

declare module "expo-notifications" {
  export interface NotificationTriggerInput {
    seconds?: number;
    repeats?: boolean;
    channelId?: string;
  }

  export interface NotificationContentInput {
    title?: string;
    body?: string;
    data?: Record<string, unknown>;
    sound?: boolean | string;
    badge?: number;
  }

  export interface NotificationRequestInput {
    content: NotificationContentInput;
    trigger: NotificationTriggerInput | null;
    identifier?: string;
  }

  export interface ExpoPushToken {
    type: "expo";
    data: string;
  }

  export interface Notification {
    date: number;
    request: {
      identifier: string;
      content: NotificationContentInput;
      trigger: NotificationTriggerInput | null;
    };
  }

  export interface NotificationResponse {
    notification: Notification;
    actionIdentifier: string;
  }

  export interface NotificationChannel {
    id: string;
    name: string;
    importance: number;
    description?: string;
  }

  export interface Subscription {
    remove: () => void;
  }

  export type PermissionStatus = "granted" | "denied" | "undetermined";

  export interface NotificationPermissionsStatus {
    status: PermissionStatus;
    expires: "never" | number;
    granted: boolean;
    canAskAgain: boolean;
  }

  export function getPermissionsAsync(): Promise<NotificationPermissionsStatus>;
  export function requestPermissionsAsync(): Promise<NotificationPermissionsStatus>;
  export function getExpoPushTokenAsync(options?: {
    projectId?: string;
  }): Promise<ExpoPushToken>;
  export function scheduleNotificationAsync(
    request: NotificationRequestInput,
  ): Promise<string>;
  export function cancelScheduledNotificationAsync(
    identifier: string,
  ): Promise<void>;
  export function cancelAllScheduledNotificationsAsync(): Promise<void>;
  export function setNotificationHandler(handler: {
    handleNotification: (notification: Notification) => Promise<{
      shouldShowAlert: boolean;
      shouldPlaySound: boolean;
      shouldSetBadge: boolean;
    }>;
  }): void;
  export function addNotificationReceivedListener(
    listener: (notification: Notification) => void,
  ): Subscription;
  export function addNotificationResponseReceivedListener(
    listener: (response: NotificationResponse) => void,
  ): Subscription;
  export function setNotificationChannelAsync(
    channelId: string,
    channel: NotificationChannel,
  ): Promise<NotificationChannel | null>;

  export const AndroidImportance: {
    MIN: number;
    LOW: number;
    DEFAULT: number;
    HIGH: number;
    MAX: number;
  };
}

declare module "expo-device" {
  export const isDevice: boolean;
  export const brand: string | null;
  export const manufacturer: string | null;
  export const modelName: string | null;
  export const modelId: string | null;
  export const designName: string | null;
  export const productName: string | null;
  export const deviceYearClass: number | null;
  export const totalMemory: number | null;
  export const supportedCpuArchitectures: string[] | null;
  export const osName: string | null;
  export const osVersion: string | null;
  export const osBuildId: string | null;
  export const osInternalBuildId: string | null;
  export const osBuildFingerprint: string | null;
  export const platformApiLevel: number | null;
  export const deviceName: string | null;

  export enum DeviceType {
    UNKNOWN = 0,
    PHONE = 1,
    TABLET = 2,
    DESKTOP = 3,
    TV = 4,
  }

  export function getDeviceTypeAsync(): Promise<DeviceType>;
  export function getUptimeAsync(): Promise<number>;
  export function getMaxMemoryAsync(): Promise<number>;
  export function isRootedExperimentalAsync(): Promise<boolean>;
  export function isSideLoadingEnabledAsync(): Promise<boolean>;
  export function getPlatformFeaturesAsync(): Promise<string[]>;
  export function hasPlatformFeatureAsync(feature: string): Promise<boolean>;
}

declare module "expo-image-picker" {
  export interface ImagePickerOptions {
    mediaTypes?: MediaTypeOptions;
    allowsEditing?: boolean;
    aspect?: [number, number];
    quality?: number;
    base64?: boolean;
    exif?: boolean;
    videoMaxDuration?: number;
    allowsMultipleSelection?: boolean;
    selectionLimit?: number;
    presentationStyle?:
      | "fullScreen"
      | "pageSheet"
      | "formSheet"
      | "currentContext"
      | "overFullScreen"
      | "overCurrentContext"
      | "popover";
  }

  export interface CameraOptions extends ImagePickerOptions {
    cameraType?: CameraType;
    videoQuality?: "low" | "medium" | "high" | "highest";
  }

  export interface ImagePickerAsset {
    assetId?: string | null;
    uri: string;
    width: number;
    height: number;
    type?: "image" | "video";
    fileName?: string | null;
    fileSize?: number;
    exif?: Record<string, unknown> | null;
    base64?: string | null;
    duration?: number | null;
    mimeType?: string;
  }

  export interface ImagePickerResult {
    canceled: boolean;
    assets: ImagePickerAsset[] | null;
  }

  export interface PermissionResponse {
    status: "granted" | "denied" | "undetermined";
    expires: "never" | number;
    granted: boolean;
    canAskAgain: boolean;
  }

  export enum MediaTypeOptions {
    All = "All",
    Videos = "Videos",
    Images = "Images",
  }

  export enum CameraType {
    front = "front",
    back = "back",
  }

  export function requestCameraPermissionsAsync(): Promise<PermissionResponse>;
  export function requestMediaLibraryPermissionsAsync(): Promise<PermissionResponse>;
  export function getCameraPermissionsAsync(): Promise<PermissionResponse>;
  export function getMediaLibraryPermissionsAsync(): Promise<PermissionResponse>;
  export function launchCameraAsync(
    options?: CameraOptions,
  ): Promise<ImagePickerResult>;
  export function launchImageLibraryAsync(
    options?: ImagePickerOptions,
  ): Promise<ImagePickerResult>;
}

declare module "expo-file-system" {
  export const documentDirectory: string | null;
  export const cacheDirectory: string | null;
  export const bundleDirectory: string | null;

  export interface FileInfo {
    exists: boolean;
    uri?: string;
    size?: number;
    isDirectory?: boolean;
    modificationTime?: number;
    md5?: string;
  }

  export interface DownloadResult {
    uri: string;
    status: number;
    headers: Record<string, string>;
    md5?: string;
  }

  export interface UploadResult {
    status: number;
    headers: Record<string, string>;
    body: string;
  }

  export interface DownloadProgressData {
    totalBytesWritten: number;
    totalBytesExpectedToWrite: number;
  }

  export interface DownloadResumable {
    downloadAsync(): Promise<DownloadResult | undefined>;
    pauseAsync(): Promise<DownloadPauseState>;
    resumeAsync(): Promise<DownloadResult | undefined>;
    savable(): DownloadPauseState;
  }

  export interface DownloadPauseState {
    url: string;
    fileUri: string;
    options: DownloadOptions;
    resumeData?: string;
  }

  export interface DownloadOptions {
    headers?: Record<string, string>;
    md5?: boolean;
    sessionType?: number;
  }

  export interface ReadingOptions {
    encoding?: EncodingType;
    length?: number;
    position?: number;
  }

  export interface WritingOptions {
    encoding?: EncodingType;
  }

  export enum EncodingType {
    UTF8 = "utf8",
    Base64 = "base64",
  }

  export function getInfoAsync(
    fileUri: string,
    options?: { md5?: boolean; size?: boolean },
  ): Promise<FileInfo>;
  export function readAsStringAsync(
    fileUri: string,
    options?: ReadingOptions,
  ): Promise<string>;
  export function writeAsStringAsync(
    fileUri: string,
    contents: string,
    options?: WritingOptions,
  ): Promise<void>;
  export function deleteAsync(
    fileUri: string,
    options?: { idempotent?: boolean },
  ): Promise<void>;
  export function moveAsync(options: {
    from: string;
    to: string;
  }): Promise<void>;
  export function copyAsync(options: {
    from: string;
    to: string;
  }): Promise<void>;
  export function makeDirectoryAsync(
    fileUri: string,
    options?: { intermediates?: boolean },
  ): Promise<void>;
  export function readDirectoryAsync(fileUri: string): Promise<string[]>;
  export function downloadAsync(
    uri: string,
    fileUri: string,
    options?: DownloadOptions,
  ): Promise<DownloadResult>;
  export function uploadAsync(
    url: string,
    fileUri: string,
    options?: {
      headers?: Record<string, string>;
      httpMethod?: "POST" | "PUT" | "PATCH";
      uploadType?: number;
      fieldName?: string;
      mimeType?: string;
      parameters?: Record<string, string>;
    },
  ): Promise<UploadResult>;
  export function createDownloadResumable(
    uri: string,
    fileUri: string,
    options?: DownloadOptions,
    callback?: (downloadProgress: DownloadProgressData) => void,
    resumeData?: string,
  ): DownloadResumable;
}

declare module "@react-native-async-storage/async-storage" {
  export interface AsyncStorageStatic {
    getItem(
      key: string,
      callback?: (error?: Error | null, result?: string | null) => void,
    ): Promise<string | null>;
    setItem(
      key: string,
      value: string,
      callback?: (error?: Error | null) => void,
    ): Promise<void>;
    removeItem(
      key: string,
      callback?: (error?: Error | null) => void,
    ): Promise<void>;
    mergeItem(
      key: string,
      value: string,
      callback?: (error?: Error | null) => void,
    ): Promise<void>;
    clear(callback?: (error?: Error | null) => void): Promise<void>;
    getAllKeys(
      callback?: (
        error?: Error | null,
        keys?: readonly string[] | null,
      ) => void,
    ): Promise<readonly string[]>;
    multiGet(
      keys: readonly string[],
      callback?: (
        errors?: readonly (Error | null)[] | null,
        result?: readonly [string, string | null][] | null,
      ) => void,
    ): Promise<readonly [string, string | null][]>;
    multiSet(
      keyValuePairs: readonly [string, string][],
      callback?: (errors?: readonly (Error | null)[] | null) => void,
    ): Promise<void>;
    multiRemove(
      keys: readonly string[],
      callback?: (errors?: readonly (Error | null)[] | null) => void,
    ): Promise<void>;
    multiMerge(
      keyValuePairs: readonly [string, string][],
      callback?: (errors?: readonly (Error | null)[] | null) => void,
    ): Promise<void>;
  }

  const AsyncStorage: AsyncStorageStatic;
  export default AsyncStorage;
}
