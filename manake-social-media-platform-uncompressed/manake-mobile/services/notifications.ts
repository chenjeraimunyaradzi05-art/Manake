/**
 * Push Notification Service
 * Uses Expo Notifications for cross-platform push notifications
 */

// Note: These imports require installing the packages:
// npx expo install expo-notifications expo-device
// For now, we'll create a mock version that can be enabled when packages are installed

import Constants from "expo-constants";
import { Platform } from "react-native";
import api from "./api";

// Type definitions for when expo-notifications is installed
export interface PushNotificationToken {
  token: string;
  platform: "ios" | "android" | "web";
}

export interface NotificationPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

export interface NotificationTriggerInput {
  seconds?: number;
  repeats?: boolean;
}

export interface Subscription {
  remove: () => void;
}

export interface Notification {
  request: {
    content: {
      title: string | null;
      body: string | null;
      data: Record<string, unknown>;
    };
  };
}

export interface NotificationResponse {
  notification: Notification;
  actionIdentifier: string;
}

// Mock implementations - replace with actual expo-notifications when installed
let notificationsModule: any = null;
let deviceModule: any = null;

async function loadModules() {
  try {
    notificationsModule = await import("expo-notifications");
    deviceModule = await import("expo-device");
  } catch {
    console.log("expo-notifications not installed, using mock");
  }
}

// Initialize modules
loadModules();

/**
 * Register for push notifications and get the device token
 */
export async function registerForPushNotifications(): Promise<PushNotificationToken | null> {
  if (!notificationsModule || !deviceModule) {
    console.log("Push notifications require expo-notifications package");
    return null;
  }

  if (!deviceModule.isDevice) {
    console.log("Push notifications require a physical device");
    return null;
  }

  // Check existing permissions
  const { status: existingStatus } =
    await notificationsModule.getPermissionsAsync();
  let finalStatus = existingStatus;

  // Request permissions if not granted
  if (existingStatus !== "granted") {
    const { status } = await notificationsModule.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== "granted") {
    console.log("Push notification permission denied");
    return null;
  }

  // Get the Expo push token
  const projectId = Constants.expoConfig?.extra?.eas?.projectId;
  const tokenData = await notificationsModule.getExpoPushTokenAsync({
    projectId,
  });

  // Configure Android channel
  if (Platform.OS === "android") {
    await notificationsModule.setNotificationChannelAsync("default", {
      name: "Default",
      importance: 4, // MAX
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF6B35",
    });
  }

  return {
    token: tokenData.data,
    platform: Platform.OS as "ios" | "android",
  };
}

/**
 * Save push token to the server for the current user
 */
export async function savePushTokenToServer(token: string): Promise<void> {
  try {
    const { getAuthToken } = await import("./api");
    const authToken = getAuthToken();

    const API_BASE_URL = __DEV__
      ? Platform.select({
          ios: "http://localhost:3001/api",
          android: "http://10.0.2.2:3001/api",
          default: "http://localhost:3001/api",
        })
      : "https://manake.netlify.app/api";

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

    await fetch(`${API_BASE_URL}/v1/push-tokens/register`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        token,
        platform: Platform.OS as "ios" | "android",
      }),
    });
  } catch (error) {
    console.error("Failed to save push token:", error);
    throw error;
  }
}

/**
 * Remove push token from server (logout)
 */
export async function removePushTokenFromServer(token: string): Promise<void> {
  try {
    const API_BASE_URL = __DEV__
      ? Platform.select({
          ios: "http://localhost:3001/api",
          android: "http://10.0.2.2:3001/api",
          default: "http://localhost:3001/api",
        })
      : "https://manake.netlify.app/api";

    await fetch(`${API_BASE_URL}/v1/push-tokens/remove`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
  } catch (error) {
    console.error("Failed to remove push token:", error);
  }
}

/**
 * Schedule a local notification
 */
export async function scheduleLocalNotification(
  notification: NotificationPayload,
  trigger?: NotificationTriggerInput,
): Promise<string> {
  if (!notificationsModule) {
    console.log("Notifications not available");
    return "mock-id";
  }

  return notificationsModule.scheduleNotificationAsync({
    content: {
      title: notification.title,
      body: notification.body,
      data: notification.data,
      sound: true,
    },
    trigger: trigger ?? null,
  });
}

/**
 * Cancel a scheduled notification
 */
export async function cancelNotification(
  notificationId: string,
): Promise<void> {
  if (notificationsModule) {
    await notificationsModule.cancelScheduledNotificationAsync(notificationId);
  }
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  if (notificationsModule) {
    await notificationsModule.cancelAllScheduledNotificationsAsync();
  }
}

/**
 * Get the current badge count
 */
export async function getBadgeCount(): Promise<number> {
  if (notificationsModule) {
    return notificationsModule.getBadgeCountAsync();
  }
  return 0;
}

/**
 * Set the badge count
 */
export async function setBadgeCount(count: number): Promise<void> {
  if (notificationsModule) {
    await notificationsModule.setBadgeCountAsync(count);
  }
}

/**
 * Clear all delivered notifications
 */
export async function clearAllNotifications(): Promise<void> {
  if (notificationsModule) {
    await notificationsModule.dismissAllNotificationsAsync();
  }
}

/**
 * Add notification received listener
 */
export function addNotificationReceivedListener(
  callback: (notification: Notification) => void,
): Subscription {
  if (notificationsModule) {
    return notificationsModule.addNotificationReceivedListener(callback);
  }
  return { remove: () => {} };
}

/**
 * Add notification response listener (when user taps notification)
 */
export function addNotificationResponseListener(
  callback: (response: NotificationResponse) => void,
): Subscription {
  if (notificationsModule) {
    return notificationsModule.addNotificationResponseReceivedListener(
      callback,
    );
  }
  return { remove: () => {} };
}

/**
 * Get last notification response (for cold start handling)
 */
export async function getLastNotificationResponse(): Promise<NotificationResponse | null> {
  if (notificationsModule) {
    return notificationsModule.getLastNotificationResponseAsync();
  }
  return null;
}

export default {
  registerForPushNotifications,
  savePushTokenToServer,
  removePushTokenFromServer,
  scheduleLocalNotification,
  cancelNotification,
  cancelAllNotifications,
  getBadgeCount,
  setBadgeCount,
  clearAllNotifications,
  addNotificationReceivedListener,
  addNotificationResponseListener,
  getLastNotificationResponse,
};
