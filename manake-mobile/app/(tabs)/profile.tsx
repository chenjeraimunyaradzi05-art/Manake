import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity,
  Alert,
  RefreshControl,
} from 'react-native';
import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { theme } from '../../constants';
import { Avatar, Button, StatCard, SettingItem, Card } from '../../components';
import { useAuthStore } from '../../store';
import { mockData } from '../../services/api';

export default function ProfileScreen() {
  const { user, isAuthenticated, isLoading, setDemoMode, logout, updateProfile } = useAuthStore();
  const [refreshing, setRefreshing] = React.useState(false);

  // For demo purposes, automatically load demo user
  useEffect(() => {
    if (!isAuthenticated && !isLoading) {
      setDemoMode();
    }
  }, [isAuthenticated, isLoading]);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setRefreshing(false);
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: () => logout(),
        },
      ]
    );
  };

  const handleEditProfile = () => {
    router.push('/profile/edit');
  };

  const handleOpenSettings = () => {
    router.push('/settings');
  };

  const handleShareApp = () => {
    Alert.alert('Share', 'Share functionality coming soon!');
  };

  // Guest view
  if (!isAuthenticated || !user) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.guestContent}>
        <View style={styles.guestCard}>
          <Avatar size="xlarge" name="?" />
          <Text style={styles.guestTitle}>Welcome to Manake</Text>
          <Text style={styles.guestSubtitle}>
            Sign in to access your profile, track your impact, and connect with the community.
          </Text>
          <View style={styles.guestButtons}>
            <Button 
              title="Sign In" 
              onPress={() => setDemoMode()}
              variant="primary"
              fullWidth
              icon="sign-in"
            />
            <Button 
              title="Create Account" 
              onPress={() => setDemoMode()}
              variant="outline"
              fullWidth
              icon="user-plus"
            />
          </View>
        </View>
        
        <Card variant="outlined" style={styles.infoCard}>
          <View style={styles.infoRow}>
            <FontAwesome name="heart" size={20} color={theme.colors.primary} />
            <View style={styles.infoText}>
              <Text style={styles.infoTitle}>Why Join?</Text>
              <Text style={styles.infoDescription}>
                Track your donations, save inspiring stories, and be part of the recovery community.
              </Text>
            </View>
          </View>
        </Card>
      </ScrollView>
    );
  }

  const stats = user.stats || mockData.user.stats;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.headerBackground} />
        <View style={styles.profileSection}>
          <Avatar 
            uri={user.avatar} 
            name={user.name} 
            size="xlarge" 
            showBadge 
            badgeColor="#10b981"
          />
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          {user.bio && <Text style={styles.userBio}>{user.bio}</Text>}
          
          <View style={styles.roleBadge}>
            <FontAwesome 
              name={user.role === 'volunteer' ? 'heart' : user.role === 'admin' ? 'shield' : 'user'} 
              size={12} 
              color={theme.colors.primary} 
            />
            <Text style={styles.roleText}>
              {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
            </Text>
          </View>

          <Button 
            title="Edit Profile" 
            onPress={handleEditProfile}
            variant="outline"
            size="small"
            icon="edit"
            style={styles.editButton}
          />
        </View>
      </View>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Your Impact</Text>
        <View style={styles.statsGrid}>
          <StatCard 
            icon="heart" 
            value={stats.storiesLiked} 
            label="Stories Liked" 
            color={theme.colors.danger}
          />
          <StatCard 
            icon="comment" 
            value={stats.commentsMade} 
            label="Comments" 
            color={theme.colors.primary}
          />
          <StatCard 
            icon="dollar" 
            value={`$${stats.totalDonated}`} 
            label="Donated" 
            color="#10b981"
          />
          <StatCard 
            icon="share" 
            value={stats.storiesShared} 
            label="Shared" 
            color="#8b5cf6"
          />
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/donate')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#10b98115' }]}>
              <FontAwesome name="gift" size={22} color="#10b981" />
            </View>
            <Text style={styles.actionLabel}>Donate</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => router.push('/(tabs)/stories')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#3b82f615' }]}>
              <FontAwesome name="book" size={22} color="#3b82f6" />
            </View>
            <Text style={styles.actionLabel}>Stories</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleShareApp}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#8b5cf615' }]}>
              <FontAwesome name="share-alt" size={22} color="#8b5cf6" />
            </View>
            <Text style={styles.actionLabel}>Share App</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => Alert.alert('Help', 'Help section coming soon!')}
          >
            <View style={[styles.actionIcon, { backgroundColor: '#f59e0b15' }]}>
              <FontAwesome name="question-circle" size={22} color="#f59e0b" />
            </View>
            <Text style={styles.actionLabel}>Get Help</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Settings</Text>
        <Card variant="elevated" padding="none" style={styles.settingsCard}>
          <SettingItem 
            icon="bell"
            label="Notifications"
            type="toggle"
            value={user.preferences?.notifications ?? true}
            onChange={(val) =>
              updateProfile({
                preferences: {
                  ...user.preferences,
                  notifications: val,
                },
              })
            }
          />
          <View style={styles.divider} />
          <SettingItem 
            icon="envelope"
            label="Email Updates"
            type="toggle"
            value={user.preferences?.emailUpdates ?? true}
            onChange={(val) =>
              updateProfile({
                preferences: {
                  ...user.preferences,
                  emailUpdates: val,
                },
              })
            }
          />
          <View style={styles.divider} />
          <SettingItem 
            icon="moon-o"
            label="Dark Mode"
            type="toggle"
            value={user.preferences?.darkMode ?? false}
            onChange={(val) =>
              updateProfile({
                preferences: {
                  ...user.preferences,
                  darkMode: val,
                },
              })
            }
          />
          <View style={styles.divider} />
          <SettingItem 
            icon="globe"
            label="Language"
            type="link"
            value="English"
            onPress={handleOpenSettings}
          />
        </Card>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        <Card variant="elevated" padding="none" style={styles.settingsCard}>
          <SettingItem 
            icon="history"
            label="Donation History"
            type="link"
            onPress={() => Alert.alert('History', 'Donation history coming soon!')}
          />
          <View style={styles.divider} />
          <SettingItem 
            icon="lock"
            label="Privacy & Security"
            type="link"
            onPress={() => Alert.alert('Privacy', 'Privacy settings coming soon!')}
          />
          <View style={styles.divider} />
          <SettingItem 
            icon="life-ring"
            label="Help & Support"
            type="link"
            onPress={() => Alert.alert('Support', 'Help section coming soon!')}
          />
          <View style={styles.divider} />
          <SettingItem 
            icon="info-circle"
            label="About Manake"
            type="link"
            onPress={() => Alert.alert('About', 'Manake Rehabilitation Center\nVersion 1.0.0')}
          />
        </Card>
      </View>

      {/* Logout */}
      <View style={styles.section}>
        <Card variant="elevated" padding="none" style={styles.settingsCard}>
          <SettingItem 
            icon="sign-out"
            label="Logout"
            type="link"
            danger
            onPress={handleLogout}
          />
        </Card>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Manake Rehabilitation Center</Text>
        <Text style={styles.versionText}>Version 1.0.0</Text>
        <Text style={styles.memberSince}>
          Member since {new Date(user.joinedAt).toLocaleDateString('en-US', { 
            month: 'long', 
            year: 'numeric' 
          })}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  // Guest Styles
  guestContent: {
    padding: 20,
    alignItems: 'center',
  },
  guestCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: 20,
    marginBottom: 8,
  },
  guestSubtitle: {
    fontSize: 15,
    color: theme.colors.textLight,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  guestButtons: {
    width: '100%',
    gap: 12,
  },
  infoCard: {
    marginTop: 20,
    width: '100%',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 4,
  },
  infoDescription: {
    fontSize: 14,
    color: theme.colors.textLight,
    lineHeight: 20,
  },
  // Header Styles
  header: {
    position: 'relative',
    paddingBottom: 20,
  },
  headerBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: theme.colors.primary,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileSection: {
    alignItems: 'center',
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: 16,
  },
  userEmail: {
    fontSize: 14,
    color: theme.colors.textLight,
    marginTop: 4,
  },
  userBio: {
    fontSize: 14,
    color: theme.colors.textLight,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
    lineHeight: 20,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${theme.colors.primary}15`,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 12,
    gap: 6,
  },
  roleText: {
    fontSize: 13,
    fontWeight: '600',
    color: theme.colors.primary,
  },
  editButton: {
    marginTop: 16,
  },
  // Stats Section
  statsSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    justifyContent: 'space-between',
  },
  // Quick Actions
  section: {
    paddingHorizontal: 20,
    marginTop: 28,
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    alignItems: 'center',
    flex: 1,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    color: theme.colors.text,
    fontWeight: '500',
  },
  // Settings
  settingsCard: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  divider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginLeft: 64,
  },
  // Footer
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  versionText: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: 4,
  },
  memberSince: {
    fontSize: 12,
    color: theme.colors.textLight,
    marginTop: 8,
  },
});
