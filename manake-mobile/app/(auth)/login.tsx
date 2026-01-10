import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  TextInput,
} from "react-native";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import * as Haptics from "expo-haptics";
import { theme } from "../../constants";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../constants/messages";
import { Button, Input, SocialAuthButtons } from "../../components/ui";
import { useToast } from "../../components/ui/Toast";
import { useAuth } from "../../hooks";
import { useBiometric } from "../../hooks/useBiometric";
import { secureStorage, STORAGE_KEYS } from "../../services/storage";
import { setAuthToken } from "../../services/api";
import { useAuthStore } from "../../store/authStore";
import { startAppleAuth, startGoogleAuth } from "../../services/socialAuth";

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginScreen() {
  const { login, socialLogin, isLoading, error, clearError, setDemoMode } =
    useAuth();
  const { showToast } = useToast();
  const biometric = useBiometric({
    promptMessage: "Unlock Manake",
    cancelLabel: "Cancel",
    fallbackLabel: "Use passcode",
  });

  const [socialLoading, setSocialLoading] = useState<"google" | "apple" | null>(
    null,
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  );

  const passwordInputRef = useRef<TextInput>(null);

  const validateForm = (): boolean => {
    const newErrors: { email?: string; password?: string } = {};

    if (!email.trim()) {
      newErrors.email = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.email = ERROR_MESSAGES.INVALID_EMAIL;
    }

    if (!password) {
      newErrors.password = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (password.length < 8) {
      newErrors.password = ERROR_MESSAGES.PASSWORD_TOO_SHORT;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async () => {
    clearError();

    if (!validateForm()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    try {
      await login({ email: email.trim().toLowerCase(), password });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      showToast(SUCCESS_MESSAGES.LOGIN_SUCCESS, "success");
      router.replace("/(tabs)");
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(
        err instanceof Error ? err.message : ERROR_MESSAGES.LOGIN_FAILED,
        "error",
      );
    }
  };

  const handleDemoMode = () => {
    setDemoMode();
    showToast("Demo mode activated!", "info");
    router.replace("/(tabs)");
  };

  const handleSocialLogin = async (provider: "google" | "apple") => {
    clearError();
    setSocialLoading(provider);

    try {
      if (provider === "google") {
        const result = await startGoogleAuth();
        if (!result.ok) {
          showToast(result.error, "error");
          return;
        }

        await socialLogin("google", {
          idToken: result.idToken,
          redirectUri: result.redirectUri,
        });
      } else {
        const result = await startAppleAuth();
        if (!result.ok) {
          showToast(result.error, "error");
          return;
        }

        await socialLogin("apple", {
          code: result.code,
          codeVerifier: result.codeVerifier,
          redirectUri: result.redirectUri,
          clientId: result.clientId,
        });
      }

      showToast(SUCCESS_MESSAGES.LOGIN_SUCCESS, "success");
      router.replace("/(tabs)");
    } catch (e) {
      showToast(
        e instanceof Error ? e.message : "Social login failed",
        "error",
      );
    } finally {
      setSocialLoading(null);
    }
  };

  const handleBiometricUnlock = async () => {
    const result = await biometric.authenticate();
    if (!result.success) {
      showToast(result.error ?? "Biometric authentication failed", "error");
      return;
    }

    const token = await secureStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (!token) {
      showToast("No saved session found. Please sign in.", "warning");
      return;
    }

    try {
      setAuthToken(token);
      await useAuthStore.getState().loadUser();
      showToast(SUCCESS_MESSAGES.LOGIN_SUCCESS, "success");
      router.replace("/(tabs)");
    } catch {
      showToast(ERROR_MESSAGES.SESSION_EXPIRED, "error");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Logo and Header */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <FontAwesome
                name="heart"
                size={48}
                color={theme.colors.primary}
              />
            </View>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>Sign in to continue to Manake</Text>
          </View>

          {/* Error Banner */}
          {error && (
            <View style={styles.errorBanner}>
              <FontAwesome
                name="exclamation-circle"
                size={16}
                color={theme.colors.danger}
              />
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.form}>
            <Input
              label="Email"
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (errors.email) setErrors({ ...errors, email: undefined });
              }}
              error={errors.email}
              leftIcon="envelope"
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
              required
            />

            <Input
              ref={passwordInputRef}
              label="Password"
              placeholder="Enter your password"
              secureTextEntry
              autoComplete="password"
              textContentType="password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (errors.password)
                  setErrors({ ...errors, password: undefined });
              }}
              error={errors.password}
              leftIcon="lock"
              returnKeyType="done"
              onSubmitEditing={handleLogin}
              required
            />

            <Link href="/(auth)/forgot-password" asChild>
              <TouchableOpacity style={styles.forgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </Link>

            <Button
              title="Sign In"
              onPress={handleLogin}
              loading={isLoading}
              disabled={isLoading}
              fullWidth
              size="large"
            />
          </View>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <SocialAuthButtons
            onProviderPress={(p) => {
              if (p === "google" || p === "apple") {
                handleSocialLogin(p);
              } else {
                showToast("Provider not supported yet", "info");
              }
            }}
            disabled={isLoading || socialLoading !== null}
            loadingProvider={socialLoading}
            style={styles.socialButtons}
          />

          {/* Demo Mode */}
          <Button
            title="Try Demo Mode"
            onPress={handleDemoMode}
            variant="outline"
            fullWidth
            icon="play"
          />

          {/* Biometric Unlock */}
          {biometric.isAvailable && (
            <View style={styles.biometricContainer}>
              <Button
                title={`Unlock with ${biometric.biometricLabel}`}
                onPress={handleBiometricUnlock}
                variant="secondary"
                fullWidth
                icon="unlock"
              />
            </View>
          )}

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <Link href="/(auth)/signup" asChild>
              <TouchableOpacity>
                <Text style={styles.signupLink}>Sign Up</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// Import FontAwesome for logo placeholder
import { FontAwesome } from "@expo/vector-icons";

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.l,
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: theme.spacing.xl,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.m,
  },
  title: {
    fontSize: theme.fontSize["2xl"],
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: `${theme.colors.danger}15`,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.m,
    marginBottom: theme.spacing.m,
  },
  errorBannerText: {
    flex: 1,
    marginLeft: theme.spacing.s,
    fontSize: theme.fontSize.sm,
    color: theme.colors.danger,
  },
  form: {
    marginBottom: theme.spacing.l,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginBottom: theme.spacing.l,
    marginTop: -theme.spacing.s,
  },
  forgotPasswordText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: theme.spacing.l,
  },
  socialButtons: {
    marginBottom: theme.spacing.m,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    marginHorizontal: theme.spacing.m,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  signupContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: theme.spacing.xl,
  },
  signupText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  signupLink: {
    fontSize: theme.fontSize.md,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  biometricContainer: {
    marginTop: theme.spacing.m,
  },
});
