import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { router } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { FontAwesome } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { theme } from "../../constants";
import { ERROR_MESSAGES } from "../../constants/messages";
import { Button, Input } from "../../components/ui";
import { useToast } from "../../components/ui/Toast";
import { authApi } from "../../services/api";

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ScreenState = "input" | "loading" | "success";

export default function ForgotPasswordScreen() {
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>();
  const [screenState, setScreenState] = useState<ScreenState>("input");

  const validateEmail = (): boolean => {
    if (!email.trim()) {
      setError(ERROR_MESSAGES.REQUIRED_FIELD);
      return false;
    }
    if (!EMAIL_REGEX.test(email)) {
      setError(ERROR_MESSAGES.INVALID_EMAIL);
      return false;
    }
    setError(undefined);
    return true;
  };

  const handleSubmit = async () => {
    if (!validateEmail()) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setScreenState("loading");

    try {
      await authApi.forgotPassword(email.trim().toLowerCase());
      setScreenState("success");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      setScreenState("input");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      showToast(
        err instanceof Error
          ? err.message
          : ERROR_MESSAGES.SOMETHING_WENT_WRONG,
        "error",
      );
    }
  };

  const handleBackToLogin = () => {
    router.replace("/(auth)/login");
  };

  const renderInputState = () => (
    <>
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

        <View style={styles.iconContainer}>
          <FontAwesome name="lock" size={40} color={theme.colors.primary} />
        </View>
        <Text style={styles.title}>Forgot Password?</Text>
        <Text style={styles.subtitle}>
          No worries! Enter your email address and we'll send you instructions
          to reset your password.
        </Text>
      </View>

      {/* Form */}
      <View style={styles.form}>
        <Input
          label="Email Address"
          placeholder="Enter your email"
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          textContentType="emailAddress"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            if (error) setError(undefined);
          }}
          error={error}
          leftIcon="envelope"
          returnKeyType="done"
          onSubmitEditing={handleSubmit}
          required
        />

        <Button
          title="Send Reset Link"
          onPress={handleSubmit}
          loading={screenState === "loading"}
          disabled={screenState === "loading"}
          fullWidth
          size="large"
        />
      </View>

      {/* Back to Login */}
      <TouchableOpacity style={styles.backToLogin} onPress={handleBackToLogin}>
        <FontAwesome name="arrow-left" size={14} color={theme.colors.primary} />
        <Text style={styles.backToLoginText}>Back to Sign In</Text>
      </TouchableOpacity>
    </>
  );

  const renderSuccessState = () => (
    <View style={styles.successContainer}>
      <View style={styles.successIconContainer}>
        <FontAwesome
          name="check-circle"
          size={64}
          color={theme.colors.success}
        />
      </View>

      <Text style={styles.successTitle}>Check Your Email</Text>
      <Text style={styles.successSubtitle}>
        We've sent a password reset link to{"\n"}
        <Text style={styles.emailHighlight}>{email}</Text>
      </Text>

      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionsTitle}>What's next?</Text>

        <View style={styles.instructionItem}>
          <View style={styles.instructionNumber}>
            <Text style={styles.instructionNumberText}>1</Text>
          </View>
          <Text style={styles.instructionText}>
            Check your email inbox (and spam folder)
          </Text>
        </View>

        <View style={styles.instructionItem}>
          <View style={styles.instructionNumber}>
            <Text style={styles.instructionNumberText}>2</Text>
          </View>
          <Text style={styles.instructionText}>
            Click the password reset link
          </Text>
        </View>

        <View style={styles.instructionItem}>
          <View style={styles.instructionNumber}>
            <Text style={styles.instructionNumberText}>3</Text>
          </View>
          <Text style={styles.instructionText}>
            Create a new strong password
          </Text>
        </View>
      </View>

      <Button
        title="Back to Sign In"
        onPress={handleBackToLogin}
        fullWidth
        size="large"
      />

      <TouchableOpacity
        style={styles.resendLink}
        onPress={() => {
          setScreenState("input");
          handleSubmit();
        }}
      >
        <Text style={styles.resendLinkText}>
          Didn't receive the email?{" "}
          <Text style={styles.resendLinkBold}>Resend</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );

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
          {screenState === "success"
            ? renderSuccessState()
            : renderInputState()}
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
    marginBottom: theme.spacing.xl,
  },
  backButton: {
    position: "absolute",
    left: 0,
    top: 0,
    padding: theme.spacing.s,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: `${theme.colors.primary}15`,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: theme.spacing.m,
    marginTop: theme.spacing.l,
  },
  title: {
    fontSize: theme.fontSize["2xl"],
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    paddingHorizontal: theme.spacing.m,
  },
  form: {
    marginBottom: theme.spacing.l,
  },
  backToLogin: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: theme.spacing.l,
  },
  backToLoginText: {
    marginLeft: theme.spacing.s,
    fontSize: theme.fontSize.md,
    color: theme.colors.primary,
    fontWeight: "600",
  },
  // Success state styles
  successContainer: {
    flex: 1,
    alignItems: "center",
    paddingTop: theme.spacing.xl,
  },
  successIconContainer: {
    marginBottom: theme.spacing.l,
  },
  successTitle: {
    fontSize: theme.fontSize["2xl"],
    fontWeight: "700",
    color: theme.colors.text,
    marginBottom: theme.spacing.s,
  },
  successSubtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: "center",
    lineHeight: 24,
    marginBottom: theme.spacing.xl,
  },
  emailHighlight: {
    color: theme.colors.text,
    fontWeight: "600",
  },
  instructionsContainer: {
    width: "100%",
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.l,
    marginBottom: theme.spacing.xl,
  },
  instructionsTitle: {
    fontSize: theme.fontSize.lg,
    fontWeight: "600",
    color: theme.colors.text,
    marginBottom: theme.spacing.m,
  },
  instructionItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: theme.spacing.m,
  },
  instructionNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.primary,
    justifyContent: "center",
    alignItems: "center",
    marginRight: theme.spacing.m,
  },
  instructionNumberText: {
    fontSize: theme.fontSize.sm,
    fontWeight: "700",
    color: "#fff",
  },
  instructionText: {
    flex: 1,
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  resendLink: {
    marginTop: theme.spacing.l,
  },
  resendLinkText: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
  },
  resendLinkBold: {
    color: theme.colors.primary,
    fontWeight: "600",
  },
});
