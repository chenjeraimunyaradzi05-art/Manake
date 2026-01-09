/**
 * Admin Dashboard Screen
 * Requires admin or moderator role
 */

import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import {
  getDashboardStats,
  getPendingStories,
  approveStory,
  rejectStory,
  DashboardStats,
  AdminStory,
} from '../../services/admin';

export default function AdminDashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingStories, setPendingStories] = useState<AdminStory[]>([]);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin' || user?.role === 'moderator';

  const loadData = useCallback(async () => {
    try {
      const [statsData, storiesData] = await Promise.all([
        getDashboardStats(),
        getPendingStories(1, 5),
      ]);
      setStats(statsData);
      setPendingStories(storiesData.data);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      Alert.alert('Access Denied', 'You do not have permission to view this page.');
      router.back();
      return;
    }
    loadData();
  }, [isAdmin, loadData, router]);

  const handleApprove = async (storyId: string) => {
    setActionLoading(storyId);
    try {
      await approveStory(storyId);
      setPendingStories((prev) => prev.filter((s) => s._id !== storyId));
      if (stats) {
        setStats({
          ...stats,
          stories: { ...stats.stories, pending: stats.stories.pending - 1 },
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to approve story');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (storyId: string) => {
    Alert.prompt(
      'Reject Story',
      'Enter rejection reason (optional):',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async (reason?: string) => {
            setActionLoading(storyId);
            try {
              await rejectStory(storyId, reason);
              setPendingStories((prev) => prev.filter((s) => s._id !== storyId));
              if (stats) {
                setStats({
                  ...stats,
                  stories: { ...stats.stories, pending: stats.stories.pending - 1 },
                });
              }
            } catch (error) {
              Alert.alert('Error', 'Failed to reject story');
            } finally {
              setActionLoading(null);
            }
          },
        },
      ],
      'plain-text'
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Admin Dashboard' }} />
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#8B5CF6" />
        }
      >
        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <StatCard
            icon="people"
            label="Total Users"
            value={stats?.users.total ?? 0}
            subtext={`+${stats?.users.newThisMonth ?? 0} this month`}
            color="#10B981"
          />
          <StatCard
            icon="book"
            label="Stories"
            value={stats?.stories.total ?? 0}
            subtext={`${stats?.stories.pending ?? 0} pending`}
            color="#8B5CF6"
          />
          <StatCard
            icon="heart"
            label="Donations"
            value={`$${(stats?.donations.totalAmount ?? 0).toLocaleString()}`}
            subtext={`${stats?.donations.totalCount ?? 0} total`}
            color="#F59E0B"
          />
          <StatCard
            icon="chatbubbles"
            label="Messages"
            value={stats?.messages.total ?? 0}
            subtext={`${stats?.messages.unread ?? 0} unread`}
            color="#3B82F6"
          />
        </View>

        {/* Pending Stories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Pending Stories</Text>
            {(stats?.stories.pending ?? 0) > 5 && (
              <TouchableOpacity onPress={() => router.push('/admin/stories')}>
                <Text style={styles.viewAll}>View All ({stats?.stories.pending})</Text>
              </TouchableOpacity>
            )}
          </View>

          {pendingStories.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="checkmark-circle" size={48} color="#10B981" />
              <Text style={styles.emptyText}>No pending stories</Text>
            </View>
          ) : (
            pendingStories.map((story) => (
              <View key={story._id} style={styles.storyCard}>
                <View style={styles.storyInfo}>
                  <Text style={styles.storyTitle} numberOfLines={1}>
                    {story.title}
                  </Text>
                  <Text style={styles.storyMeta}>
                    by {story.author.name} • {story.category}
                  </Text>
                </View>
                <View style={styles.storyActions}>
                  {actionLoading === story._id ? (
                    <ActivityIndicator size="small" color="#8B5CF6" />
                  ) : (
                    <>
                      <TouchableOpacity
                        style={styles.approveBtn}
                        onPress={() => handleApprove(story._id)}
                      >
                        <Ionicons name="checkmark" size={20} color="#fff" />
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.rejectBtn}
                        onPress={() => handleReject(story._id)}
                      >
                        <Ionicons name="close" size={20} color="#fff" />
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <ActionButton
              icon="people"
              label="Manage Users"
              onPress={() => router.push('/admin/users')}
            />
            <ActionButton
              icon="book"
              label="All Stories"
              onPress={() => router.push('/admin/stories')}
            />
            <ActionButton
              icon="stats-chart"
              label="Analytics"
              onPress={() => router.push('/admin/analytics')}
            />
            <ActionButton
              icon="settings"
              label="Settings"
              onPress={() => router.push('/admin/settings')}
            />
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </>
  );
}

// Stat Card Component
function StatCard({
  icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string | number;
  subtext: string;
  color: string;
}) {
  return (
    <View style={[styles.statCard, { borderLeftColor: color }]}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statSubtext}>{subtext}</Text>
    </View>
  );
}

// Action Button Component
function ActionButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.actionButton} onPress={onPress}>
      <Ionicons name={icon} size={28} color="#8B5CF6" />
      <Text style={styles.actionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6B7280',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  statSubtext: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  section: {
    padding: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  viewAll: {
    fontSize: 14,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 8,
  },
  storyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  storyInfo: {
    flex: 1,
  },
  storyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  storyMeta: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  storyActions: {
    flexDirection: 'row',
    gap: 8,
  },
  approveBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EF4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: '47%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  actionLabel: {
    fontSize: 14,
    color: '#374151',
    marginTop: 8,
    fontWeight: '500',
  },
});
