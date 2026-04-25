import {
  authenticateBiometric,
  getBiometricLabel,
  getBiometricStatus,
} from "../../services/biometric";

describe("biometric helpers", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("reports available when hardware + enrolled", async () => {
    const status = await getBiometricStatus();
    expect(status.isAvailable).toBe(true);
    expect(status.isEnrolled).toBe(true);
    expect(status.biometricType).toBe("fingerprint");
  });

  it("authenticate returns success true when module succeeds", async () => {
    const result = await authenticateBiometric({
      promptMessage: "Test",
      cancelLabel: "Cancel",
      fallbackLabel: "Use passcode",
      disableDeviceFallback: false,
    });

    expect(result.success).toBe(true);
  });

  it("handles unenrolled devices", async () => {
    const mod = require("expo-local-authentication");
    mod.isEnrolledAsync.mockResolvedValueOnce(false);

    const status = await getBiometricStatus();
    expect(status.isAvailable).toBe(false);
    expect(status.isEnrolled).toBe(false);
    expect(status.biometricType).toBe("none");
  });

  it("provides human readable labels", () => {
    expect(getBiometricLabel("fingerprint")).toBe("Fingerprint");
    expect(getBiometricLabel("facial")).toBe("Face ID");
    expect(getBiometricLabel("iris")).toBe("Iris");
    expect(getBiometricLabel("none")).toBe("Biometrics");
  });
});
