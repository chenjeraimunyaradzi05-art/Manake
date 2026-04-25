/**
 * useNotifications Hook
 * Manages push notification registration and listeners
 */

import { useEffect, useRef, useCallback, useState } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "./useAuth";
import notifications, {
  registerForPushNotifications,
  savePushTokenToServer,
  removePushTokenFromServer,
  addNotificationReceivedListener,
  addNotificationResponseListener,
  getLastNotificationResponse,
  Notification,
  NotificationResponse,
  Subscription,
} from "../services/notifications";

interface UseNotificationsOptions {
  onNotificationReceived?: (notification: Notification) => void;
  onNotificationTapped?: (response: NotificationResponse) => void;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(
    null,
  );
  const notificationListener = useRef<Subscription>();
  const responseListener = useRef<Subscription>();
  const lastTokenRef = useRef<string | null>(null);

  // Handle notification navigation
  const handleNotificationNavigation = useCallback(
    (data: Record<string, unknown>) => {
      // Navigate based on notification type
      if (data.type === "story" && data.storyId) {
        router.push(`/story/${data.storyId}`);
      } else if (data.type === "profile" && data.userId) {
        router.push(`/profile/${data.userId}`);
      } else if (data.type === "post" && data.postId) {
        router.push(`/social`);
      } else if (data.type === "message" && data.conversationId) {
        router.push("/messages");
      } else if (data.type === "emergency") {
        // Handle emergency notification
        router.push("/");
      } else if (data.route) {
        router.push(data.route as string);
      }
    },
    [router],
  );

  // Register for push notifications
  const register = useCallback(async () => {
    try {
      const result = await registerForPushNotifications();

      if (result) {
        setPushToken(result.token);
        setPermissionGranted(true);

        // Save to server if authenticated and token changed
        if (isAuthenticated && result.token !== lastTokenRef.current) {
          await savePushTokenToServer(result.token);
          lastTokenRef.current = result.token;
        }

        return result.token;
      } else {
        setPermissionGranted(false);
        return null;
      }
    } catch (error) {
      console.error("Failed to register for push notifications:", error);
      setPermissionGranted(false);
      return null;
    }
  }, [isAuthenticated]);

  // Unregister push notifications
  const unregister = useCallback(async () => {
    if (lastTokenRef.current) {
      await removePushTokenFromServer(lastTokenRef.current);
      lastTokenRef.current = null;
    }
    setPushToken(null);
  }, []);

  // Set up listeners on mount
  useEffect(() => {
    // Register for notifications when authenticated
    if (isAuthenticated) {
      register();
    }

    // Notification received while app is foregrounded
    notificationListener.current = addNotificationReceivedListener(
      (notification) => {
        console.log("Notification received:", notification);
        options.onNotificationReceived?.(notification);
      },
    );

    // Notification tapped / interacted with
    responseListener.current = addNotificationResponseListener((response) => {
      console.log("Notification tapped:", response);
      options.onNotificationTapped?.(response);

      // Handle navigation
      const data = response.notification.request.content.data;
      if (data) {
        handleNotificationNavigation(data);
      }
    });

    // Check for cold start notification
    getLastNotificationResponse().then((response) => {
      if (response) {
        const data = response.notification.request.content.data;
        if (data) {
          handleNotificationNavigation(data);
        }
      }
    });

    return () => {
      if (notificationListener.current) {
        notificationListener.current.remove();
      }
      if (responseListener.current) {
        responseListener.current.remove();
      }
    };
  }, [isAuthenticated, register, handleNotificationNavigation, options]);

  // Clean up on logout
  useEffect(() => {
    if (!isAuthenticated && lastTokenRef.current) {
      unregister();
    }
  }, [isAuthenticated, unregister]);

  return {
    pushToken,
    permissionGranted,
    register,
    unregister,
    scheduleLocal: notifications.scheduleLocalNotification,
    cancelNotification: notifications.cancelNotification,
    cancelAllNotifications: notifications.cancelAllNotifications,
    getBadgeCount: notifications.getBadgeCount,
    setBadgeCount: notifications.setBadgeCount,
    clearAllNotifications: notifications.clearAllNotifications,
  };
}

export default useNotifications;
