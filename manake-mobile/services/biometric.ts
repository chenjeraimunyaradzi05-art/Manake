export type BiometricType = 'fingerprint' | 'facial' | 'iris' | 'none';

export interface BiometricResult {
  success: boolean;
  error?: string;
  warning?: string;
}

export interface BiometricStatus {
  isAvailable: boolean;
  isEnrolled: boolean;
  biometricType: BiometricType;
  error?: string;
}

export interface AuthenticateBiometricOptions {
  promptMessage: string;
  cancelLabel: string;
  fallbackLabel: string;
  disableDeviceFallback: boolean;
}

let LocalAuthentication: any = null;

declare const require: any;

async function loadBiometricModule() {
  if (LocalAuthentication) return LocalAuthentication;
  try {
    const imported = require('expo-local-authentication');
    LocalAuthentication = imported?.default ?? imported;
  } catch {
    LocalAuthentication = null;
  }
  return LocalAuthentication;
}

function mapAuthTypeToBiometricType(module: any, type: number): BiometricType {
  if (!module?.AuthenticationType) return 'none';
  if (type === module.AuthenticationType.FINGERPRINT) return 'fingerprint';
  if (type === module.AuthenticationType.FACIAL_RECOGNITION) return 'facial';
  if (type === module.AuthenticationType.IRIS) return 'iris';
  return 'none';
}

export function getBiometricLabel(biometricType: BiometricType): string {
  if (biometricType === 'facial') return 'Face ID';
  if (biometricType === 'fingerprint') return 'Fingerprint';
  if (biometricType === 'iris') return 'Iris';
  return 'Biometrics';
}

export async function getBiometricStatus(): Promise<BiometricStatus> {
  try {
    const mod = await loadBiometricModule();
    if (!mod) {
      return { isAvailable: false, isEnrolled: false, biometricType: 'none' };
    }

    const hasHardware = await mod.hasHardwareAsync();
    if (!hasHardware) {
      return { isAvailable: false, isEnrolled: false, biometricType: 'none' };
    }

    const enrolled = await mod.isEnrolledAsync();
    if (!enrolled) {
      return { isAvailable: false, isEnrolled: false, biometricType: 'none' };
    }

    const supportedTypes: number[] = await mod.supportedAuthenticationTypesAsync();
    const mapped = supportedTypes
      .map((t) => mapAuthTypeToBiometricType(mod, t))
      .find((t) => t !== 'none');

    return {
      isAvailable: true,
      isEnrolled: true,
      biometricType: mapped ?? 'none',
    };
  } catch (e) {
    return {
      isAvailable: false,
      isEnrolled: false,
      biometricType: 'none',
      error: e instanceof Error ? e.message : 'Failed to check biometrics',
    };
  }
}

export async function authenticateBiometric(
  options: AuthenticateBiometricOptions
): Promise<BiometricResult> {
  try {
    const mod = await loadBiometricModule();
    if (!mod) {
      return { success: false, error: 'Biometrics not available' };
    }

    const result = await mod.authenticateAsync({
      promptMessage: options.promptMessage,
      cancelLabel: options.cancelLabel,
      fallbackLabel: options.fallbackLabel,
      disableDeviceFallback: options.disableDeviceFallback,
    });

    if (result?.success) return { success: true };

    return {
      success: false,
      error: result?.error ?? 'Authentication cancelled',
    };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : 'Authentication failed',
    };
  }
}
