import { useState, useEffect, useCallback } from 'react';
import NetInfo, { NetInfoState, NetInfoSubscription } from '@react-native-community/netinfo';

export interface ConnectivityState {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
  connectionType: string | null;
  isLoading: boolean;
}

/**
 * Hook to monitor network connectivity status
 * Returns current connection state and utilities for checking connectivity
 */
export function useConnectivity() {
  const [state, setState] = useState<ConnectivityState>({
    isConnected: null,
    isInternetReachable: null,
    connectionType: null,
    isLoading: true,
  });

  useEffect(() => {
    let subscription: NetInfoSubscription;

    const handleConnectivityChange = (netInfoState: NetInfoState) => {
      setState({
        isConnected: netInfoState.isConnected,
        isInternetReachable: netInfoState.isInternetReachable,
        connectionType: netInfoState.type,
        isLoading: false,
      });
    };

    // Get initial state
    NetInfo.fetch().then(handleConnectivityChange);

    // Subscribe to updates
    subscription = NetInfo.addEventListener(handleConnectivityChange);

    return () => {
      subscription?.();
    };
  }, []);

  /**
   * Manually refresh connectivity status
   */
  const refresh = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true }));
    const netInfoState = await NetInfo.fetch();
    setState({
      isConnected: netInfoState.isConnected,
      isInternetReachable: netInfoState.isInternetReachable,
      connectionType: netInfoState.type,
      isLoading: false,
    });
  }, []);

  /**
   * Check if we have a working internet connection
   */
  const hasInternet = state.isConnected === true && state.isInternetReachable !== false;

  return {
    ...state,
    hasInternet,
    refresh,
  };
}

export default useConnectivity;
