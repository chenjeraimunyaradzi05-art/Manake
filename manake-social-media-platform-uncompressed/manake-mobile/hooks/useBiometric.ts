import { useCallback, useEffect, useMemo, useState } from "react";
import {
  authenticateBiometric,
  getBiometricLabel,
  getBiometricStatus,
  type AuthenticateBiometricOptions,
  type BiometricResult,
  type BiometricType,
} from "../services/biometric";

export interface UseBiometricOptions {
  promptMessage?: string;
  cancelLabel?: string;
  fallbackLabel?: string;
  disableDeviceFallback?: boolean;
}

export function useBiometric(options: UseBiometricOptions = {}) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [biometricType, setBiometricType] = useState<BiometricType>("none");
  const [error, setError] = useState<string | null>(null);

  const promptMessage = options.promptMessage ?? "Authenticate to continue";
  const cancelLabel = options.cancelLabel ?? "Cancel";
  const fallbackLabel = options.fallbackLabel ?? "Use passcode";
  const disableDeviceFallback = options.disableDeviceFallback ?? false;

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const status = await getBiometricStatus();
      setIsAvailable(status.isAvailable);
      setIsEnrolled(status.isEnrolled);
      setBiometricType(status.biometricType);
      setError(status.error ?? null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to check biometrics");
      setIsAvailable(false);
      setIsEnrolled(false);
      setBiometricType("none");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const authenticate = useCallback(async (): Promise<BiometricResult> => {
    setError(null);

    try {
      const result = await authenticateBiometric({
        promptMessage,
        cancelLabel,
        fallbackLabel,
        disableDeviceFallback,
      } satisfies AuthenticateBiometricOptions);

      if (!result.success) {
        setError(result.error ?? null);
      }

      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Authentication failed";
      setError(msg);
      return { success: false, error: msg };
    }
  }, [promptMessage, cancelLabel, fallbackLabel, disableDeviceFallback]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const label = useMemo(() => {
    return getBiometricLabel(biometricType);
  }, [biometricType]);

  return {
    isLoading,
    isAvailable,
    isEnrolled,
    biometricType,
    biometricLabel: label,
    error,
    refresh,
    authenticate,
  };
}
