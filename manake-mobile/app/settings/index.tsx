import React, { useMemo } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../constants';
import { Card, SettingItem, Button } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { useAuthStore } from '../../store/authStore';

export default function SettingsScreen() {
  const { user, isAuthenticated, isLoading, updateProfile } = useAuthStore();
  const { showToast } = useToast();

  const preferences = useMemo(() => {
    return (
      user?.preferences ?? {
        notifications: true,
        emailUpdates: true,
        darkMode: false,
        language: 'en',
      }
    );
  }, [user]);

  const canEdit = isAuthenticated && !!user;

  const setPreference = async (key: keyof typeof preferences, value: boolean) => {
    if (!canEdit) {
      showToast('Please sign in to change settings.', 'warning');
      router.replace('/(auth)/login');
      return;
    }

    try {
      await updateProfile({
        preferences: {
          ...preferences,
          [key]: value,
        },
      } as any);
    } catch (e) {
      showToast(e instanceof Error ? e.message : 'Failed to update settings', 'error');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Manage notifications and preferences.</Text>

        {!canEdit ? (
          <Card variant="outlined" style={styles.card}>
            <Text style={styles.infoText}>You need to be signed in to change settings.</Text>
            <Button title="Go to Login" onPress={() => router.replace('/(auth)/login')} fullWidth />
          </Card>
        ) : (
          <Card variant="elevated" padding="none" style={styles.card}>
            <SettingItem
              icon="bell"
              label="Notifications"
              type="toggle"
              value={preferences.notifications}
              onChange={(val) => setPreference('notifications', val)}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="envelope"
              label="Email Updates"
              type="toggle"
              value={preferences.emailUpdates}
              onChange={(val) => setPreference('emailUpdates', val)}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="moon-o"
              label="Dark Mode"
              type="toggle"
              value={preferences.darkMode}
              onChange={(val) => setPreference('darkMode', val)}
            />
            <View style={styles.divider} />
            <SettingItem
              icon="globe"
              label="Language"
              type="info"
              value={preferences.language === 'en' ? 'English' : preferences.language}
            />
          </Card>
        )}

        <View style={styles.footer}>
          <Button
            title="Back"
            onPress={() => router.back()}
            variant="outline"
            disabled={isLoading}
            fullWidth
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    padding: theme.spacing.l,
    paddingBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize['2xl'],
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.fontSize.md,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.l,
  },
  card: {
    marginTop: theme.spacing.s,
  },
  infoText: {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.m,
  },
  divider: {
    height: 1,
    backgroundColor: theme.colors.border,
  },
  footer: {
    marginTop: theme.spacing.l,
  },
});
