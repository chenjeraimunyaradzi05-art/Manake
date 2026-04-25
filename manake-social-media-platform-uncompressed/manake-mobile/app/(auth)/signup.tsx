import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { Link, router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { theme } from "../../constants";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../../constants/messages";
import { Button, Input, SocialAuthButtons } from "../../components/ui";
import { useToast } from "../../components/ui/Toast";
import { useAuth } from "../../hooks";
import { startAppleAuth, startGoogleAuth } from "../../services/socialAuth";

// Validation patterns
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]*$/;

interface FormErrors {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
}

export default function SignupScreen() {
  const { register, socialLogin, isLoading, error, clearError } = useAuth();
  const { showToast } = useToast();

  const [socialLoading, setSocialLoading] = useState<"google" | "apple" | null>(
    null,
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  // Refs for input navigation
  const emailInputRef = useRef<TextInput>(null);
  const phoneInputRef = useRef<TextInput>(null);
  const passwordInputRef = useRef<TextInput>(null);
  const confirmPasswordInputRef = useRef<TextInput>(null);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Name validation
    if (!name.trim()) {
      newErrors.name = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    }

    // Email validation
    if (!email.trim()) {
      newErrors.email = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (!EMAIL_REGEX.test(email)) {
      newErrors.email = ERROR_MESSAGES.INVALID_EMAIL;
    }

    // Phone validation (optional but if provided must be valid)
    if (phone && !PHONE_REGEX.test(phone)) {
      newErrors.phone = "Please enter a valid phone number";
    }

    // Password validation
    if (!password) {
      newErrors.password = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (password.length < 8) {
      newErrors.password = ERROR_MESSAGES.PASSWORD_TOO_SHORT;
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password =
        "Password must contain at least one uppercase letter";
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = "Password must contain at least one number";
    }

    // Confirm password validation
    if (!confirmPassword) {
      newErrors.confirmPassword = ERROR_MESSAGES.REQUIRED_FIELD;
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = ERROR_MESSAGES.PASSWORDS_DO_NOT_MATCH;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignup = async () => {
    clearError();

    if (!validateForm()) {
      if (Platform.OS !== "web") {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      return;
    }

    if (!acceptedTerms) {
      if (Platform.OS !== "web") {
        void Haptics.notificationAsync(
          Haptics.NotificationFeedbackType.Warning,
        );
      }
      showToast("Please accept the Terms of Service", "warning");
      return;
    }

    try {
      await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        phone: phone.trim() || undefined,
      });
      if (Platform.OS !== "web") {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }
      showToast(SUCCESS_MESSAGES.REGISTER_SUCCESS, "success");
      router.replace("/(tabs)");
    } catch (err) {
      if (Platform.OS !== "web") {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
      showToast(
        err instanceof Error ? err.message : ERROR_MESSAGES.REGISTER_FAILED,
        "error",
      );
    }
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

  const clearFieldError = (field: keyof FormErrors) => {
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
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
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <FontAwesome
                name="chevron-left"
                size={20}
                color={theme.colors.text}
              />
            </TouchableOpacity>

            <View style={styles.logoContainer}>
              <FontAwesome
                name="heart"
                size={40}
                color={theme.colors.primary}
              />
            </View>
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>
              Join our community and make a difference
            </Text>
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
              label="Full Name"
              placeholder="Enter your full name"
              autoCapitalize="words"
              autoComplete="name"
              textContentType="name"
              value={name}
              onChangeText={(text) => {
                setName(text);
                clearFieldError("name");
              }}
              error={errors.name}
              leftIcon="user"
              returnKeyType="next"
              onSubmitEditing={() => emailInputRef.current?.focus()}
              required
            />

            <Input
              ref={emailInputRef}
              label="Email"
              placeholder="Enter your email"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                clearFieldError("email");
              }}
              error={errors.email}
              leftIcon="envelope"
              returnKeyType="next"
              onSubmitEditing={() => phoneInputRef.current?.focus()}
              required
            />

            <Input
              ref={phoneInputRef}
              label="Phone Number"
              placeholder="Enter your phone number (optional)"
              keyboardType="phone-pad"
              autoComplete="tel"
              textContentType="telephoneNumber"
              value={phone}
              onChangeText={(text) => {
                setPhone(text);
                clearFieldError("phone");
              }}
              error={errors.phone}
              leftIcon="phone"
              returnKeyType="next"
              onSubmitEditing={() => passwordInputRef.current?.focus()}
              hint="We'll use this for important updates"
            />

            <Input
              ref={passwordInputRef}
              label="Password"
              placeholder="Create a strong password"
              secureTextEntry
              autoComplete="password-new"
              textContentType="newPassword"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                clearFieldError("password");
              }}
              error={errors.password}
              leftIcon="lock"
              returnKeyType="next"
              onSubmitEditing={() => confirmPasswordInputRef.current?.focus()}
              hint="At least 8 characters, 1 uppercase, 1 number"
              required
            />

            <Input
              ref={confirmPasswordInputRef}
              label="Confirm Password"
              placeholder="Confirm your password"
              secureTextEntry
              autoComplete="password-new"
              textContentType="newPassword"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                clearFieldError("confirmPassword");
              }}
              error={errors.confirmPassword}
              leftIcon="lock"
              returnKeyType="done"
              onSubmitEditing={handleSignup}
              required
            />

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

            {/* Terms Checkbox */}
            <TouchableOpacity
              style={styles.termsContainer}
              onPress={() => setAcceptedTerms(!acceptedTerms)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  acceptedTerms && styles.checkboxChecked,
                ]}
              >
                {acceptedTerms && (
                  <FontAwesome name="check" size={12} color="#fff" />
                )}
              </View>
              <Text style={styles.termsText}>
                I agree to the{" "}
                <Text style={styles.termsLink}>Terms of Service</Text> and{" "}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </TouchableOpacity>

            <Button
              title="Create Account"
              onPress={handleSignup}
              loading={isLoading}
              disabled={isLoading}
              fullWidth
              size="large"
            />
          </View>

          {/* Sign In Link */}
          <View style={styles.signinContainer}>
            <Text style={styles.signinText}>Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.signinLink}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

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
    paddingTop: theme.spacing.m,
    paddingBottom: theme.spacing.xl,
  },
  header: {
    alignItems: "center",
    marginBottom: theme.spacing.l,
  },
  backButton: {
    position: "absolute",
    left: 0,
    top: 0,
    padding: theme.spacing.s,
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
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
    textAlign: "center",
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
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: theme.spacing.l,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    marginHorizontal: theme.spacing.m,
    fontSize: theme.fontSize.sm,
    fontWeight: "600",
    color: theme.colors.textSecondary,
  },
  socialButtons: {
    marginBottom: theme.spacing.m,
  },
  termsContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: theme.spacing.l,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: theme.borderRadius.sm,
    borderWidth: 2,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.s,
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  termsText: {
    flex: 1,
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
  termsLink: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
  signinContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: theme.spacing.l,
  },
  signinText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  signinLink: {
    fontSize: theme.fontSize.md,
    color: theme.colors.primary,
    fontWeight: "600",
  },
});
