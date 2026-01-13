import { useState, useEffect, createContext, useContext, ReactNode } from "react";

type ConnectionType = "4g" | "3g" | "2g" | "slow-2g" | "offline" | "unknown";

interface NetworkState {
  isOnline: boolean;
  connectionType: ConnectionType;
  effectiveType: ConnectionType;
  downlink: number;
  rtt: number;
  saveData: boolean;
}

interface NetworkContextValue extends NetworkState {
  isSlowConnection: boolean;
  shouldReduceData: boolean;
}

const NetworkContext = createContext<NetworkContextValue | null>(null);

/**
 * Get network information from navigator
 */
function getNetworkInfo(): NetworkState {
  const connection = (navigator as any).connection || 
    (navigator as any).mozConnection || 
    (navigator as any).webkitConnection;

  if (!connection) {
    return {
      isOnline: navigator.onLine,
      connectionType: "unknown",
      effectiveType: "unknown",
      downlink: 10,
      rtt: 0,
      saveData: false,
    };
  }

  return {
    isOnline: navigator.onLine,
    connectionType: connection.type || "unknown",
    effectiveType: connection.effectiveType || "4g",
    downlink: connection.downlink || 10,
    rtt: connection.rtt || 0,
    saveData: connection.saveData || false,
  };
}

/**
 * Network provider for connection-aware loading
 */
export function NetworkProvider({ children }: { children: ReactNode }) {
  const [networkState, setNetworkState] = useState<NetworkState>(getNetworkInfo);

  useEffect(() => {
    const updateNetwork = () => setNetworkState(getNetworkInfo());

    window.addEventListener("online", updateNetwork);
    window.addEventListener("offline", updateNetwork);

    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener("change", updateNetwork);
    }

    return () => {
      window.removeEventListener("online", updateNetwork);
      window.removeEventListener("offline", updateNetwork);
      if (connection) {
        connection.removeEventListener("change", updateNetwork);
      }
    };
  }, []);

  const isSlowConnection = 
    networkState.effectiveType === "2g" || 
    networkState.effectiveType === "slow-2g" ||
    networkState.rtt > 500;

  const shouldReduceData = 
    networkState.saveData || 
    isSlowConnection ||
    !networkState.isOnline;

  return (
    <NetworkContext.Provider 
      value={{ 
        ...networkState, 
        isSlowConnection, 
        shouldReduceData 
      }}
    >
      {children}
    </NetworkContext.Provider>
  );
}

/**
 * Hook to access network state
 */
export function useNetwork(): NetworkContextValue {
  const context = useContext(NetworkContext);
  if (!context) {
    // Return defaults if used outside provider
    return {
      isOnline: true,
      connectionType: "unknown",
      effectiveType: "4g",
      downlink: 10,
      rtt: 0,
      saveData: false,
      isSlowConnection: false,
      shouldReduceData: false,
    };
  }
  return context;
}

/**
 * Hook for connection-aware image quality
 */
export function useImageQuality(): "high" | "medium" | "low" {
  const { effectiveType, saveData } = useNetwork();

  if (saveData) return "low";
  
  switch (effectiveType) {
    case "slow-2g":
    case "2g":
      return "low";
    case "3g":
      return "medium";
    default:
      return "high";
  }
}

/**
 * Hook to prefetch data only on fast connections
 */
export function useShouldPrefetch(): boolean {
  const { isSlowConnection, saveData, isOnline } = useNetwork();
  return isOnline && !isSlowConnection && !saveData;
}

/**
 * Offline banner component
 */
export function OfflineBanner() {
  const { isOnline } = useNetwork();

  if (isOnline) return null;

  return (
    <div 
      role="alert"
      aria-live="assertive"
      className="fixed bottom-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-900 px-4 py-2 text-center text-sm font-medium"
    >
      You're offline. Some features may be unavailable.
    </div>
  );
}

/**
 * Slow connection indicator
 */
export function SlowConnectionIndicator() {
  const { isSlowConnection, isOnline } = useNetwork();

  if (!isOnline || !isSlowConnection) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-orange-100 text-orange-800 px-4 py-1 text-center text-xs">
      Slow connection detected. Loading reduced content.
    </div>
  );
}

export default NetworkProvider;
