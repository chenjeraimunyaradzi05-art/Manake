import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '../../constants';
import { Button, Input, Card } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { useAuthStore } from '../../store/authStore';
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../../constants/messages';

export default function EditProfileScreen() {
  const { user, isAuthenticated, isLoading, updateProfile } = useAuthStore();
  const { showToast } = useToast();

  const initial = useMemo(
    () => ({
      name: user?.name ?? '',
      phone: user?.phone ?? '',
      bio: user?.bio ?? '',
    }),
    [user]
  );

  const [name, setName] = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone);
  const [bio, setBio] = useState(initial.bio);
  const [errors, setErrors] = useState<{ name?: string }>({});

  const canEdit = isAuthenticated && !!user;

  const validate = () => {
    const nextErrors: { name?: string } = {};
    if (!name.trim()) nextErrors.name = ERROR_MESSAGES.REQUIRED_FIELD;
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async () => {
    if (!canEdit) {
      showToast('Please sign in to edit your profile.', 'warning');
      router.replace('/(auth)/login');
      return;
    }

    if (!validate()) return;

    try {
      await updateProfile({
        name: name.trim(),
        phone: phone.trim() || undefined,
        bio: bio.trim() || undefined,
      });
      showToast(SUCCESS_MESSAGES.PROFILE_UPDATED ?? 'Profile updated', 'success');
      router.back();
    } catch (e) {
      showToast(
        e instanceof Error ? e.message : ERROR_MESSAGES.PROFILE_UPDATE_FAILED,
        'error'
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Edit Profile</Text>
        <Text style={styles.subtitle}>Update your personal information.</Text>

        {!canEdit ? (
          <Card variant="outlined" style={styles.card}>
            <Text style={styles.infoText}>You need to be signed in to edit your profile.</Text>
            <Button title="Go to Login" onPress={() => router.replace('/(auth)/login')} fullWidth />
          </Card>
        ) : (
          <Card variant="elevated" style={styles.card}>
            <Input
              label="Full Name"
              placeholder="Enter your name"
              value={name}
              onChangeText={(t) => {
                setName(t);
                if (errors.name) setErrors({ ...errors, name: undefined });
              }}
              error={errors.name}
              leftIcon="user"
              required
              returnKeyType="next"
            />

            <Input
              label="Phone"
              placeholder="Optional"
              value={phone}
              onChangeText={setPhone}
              leftIcon="phone"
              keyboardType="phone-pad"
              returnKeyType="next"
            />

            <Input
              label="Bio"
              placeholder="Optional"
              value={bio}
              onChangeText={setBio}
              leftIcon="info-circle"
              returnKeyType="done"
              multiline
            />

            <View style={styles.actions}>
              <Button
                title="Cancel"
                onPress={() => router.back()}
                variant="outline"
                disabled={isLoading}
                style={styles.action}
              />
              <Button
                title="Save"
                onPress={handleSave}
                loading={isLoading}
                disabled={isLoading}
                style={styles.action}
              />
            </View>
          </Card>
        )}
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
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.m,
    marginTop: theme.spacing.m,
  },
  action: {
    flex: 1,
  },
});
