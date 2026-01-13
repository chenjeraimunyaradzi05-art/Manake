import { useState, useEffect } from "react";

type ConnectionType = "slow-2g" | "2g" | "3g" | "4g" | "unknown";
type EffectiveType = "slow-2g" | "2g" | "3g" | "4g";

interface NetworkInfo {
  isOnline: boolean;
  connectionType: ConnectionType;
  isSlowConnection: boolean;
  saveData: boolean;
  downlink?: number;
  rtt?: number;
}

interface NavigatorConnection {
  effectiveType?: EffectiveType;
  saveData?: boolean;
  downlink?: number;
  rtt?: number;
  addEventListener: (type: string, listener: () => void) => void;
  removeEventListener: (type: string, listener: () => void) => void;
}

declare global {
  interface Navigator {
    connection?: NavigatorConnection;
    mozConnection?: NavigatorConnection;
    webkitConnection?: NavigatorConnection;
  }
}

/**
 * Hook for connection-aware loading
 * Returns network information for adaptive loading strategies
 */
export function useConnection(): NetworkInfo {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>(() => ({
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
    connectionType: "unknown",
    isSlowConnection: false,
    saveData: false,
  }));

  useEffect(() => {
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;

    const updateNetworkInfo = () => {
      const effectiveType = connection?.effectiveType || "unknown";
      const isSlowConnection = 
        effectiveType === "slow-2g" || effectiveType === "2g";

      setNetworkInfo({
        isOnline: navigator.onLine,
        connectionType: effectiveType as ConnectionType,
        isSlowConnection,
        saveData: connection?.saveData ?? false,
        downlink: connection?.downlink,
        rtt: connection?.rtt,
      });
    };

    // Initial update
    updateNetworkInfo();

    // Listen for online/offline events
    window.addEventListener("online", updateNetworkInfo);
    window.addEventListener("offline", updateNetworkInfo);

    // Listen for connection changes
    if (connection) {
      connection.addEventListener("change", updateNetworkInfo);
    }

    return () => {
      window.removeEventListener("online", updateNetworkInfo);
      window.removeEventListener("offline", updateNetworkInfo);
      if (connection) {
        connection.removeEventListener("change", updateNetworkInfo);
      }
    };
  }, []);

  return networkInfo;
}

/**
 * Hook for adaptive loading based on connection quality
 * Returns loading configuration based on network conditions
 */
export function useAdaptiveLoading() {
  const { isSlowConnection, saveData, isOnline } = useConnection();

  return {
    // Should we load images at full quality?
    loadHighQualityImages: !isSlowConnection && !saveData,
    
    // Should we autoplay videos?
    autoplayVideos: !isSlowConnection && !saveData,
    
    // Should we prefetch next pages?
    prefetchEnabled: !isSlowConnection && !saveData && isOnline,
    
    // Image quality setting
    imageQuality: isSlowConnection || saveData ? "low" : "high",
    
    // Number of items to preload
    preloadCount: isSlowConnection ? 3 : 10,
    
    // Should we use skeleton loaders (slower connections benefit more)
    useSkeletons: true,
    
    // Animation settings
    enableAnimations: !saveData,
  };
}
