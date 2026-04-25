import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
  getMyMentorships,
  getMentorshipStats,
  acceptMentorship,
  declineMentorship,
  Mentorship,
  MentorshipStats,
} from "../../services/mentorship";

type TabType = "active" | "pending" | "completed";

export default function MyMentorshipScreen() {
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [stats, setStats] = useState<MentorshipStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);

      const [mentorshipsData, statsData] = await Promise.all([
        getMyMentorships(),
        getMentorshipStats(),
      ]);

      setMentorships(mentorshipsData.mentorships);
      setStats(statsData.stats);
    } catch (error) {
      console.error("Failed to fetch mentorships:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const handleAccept = async (id: string) => {
    try {
      setActionLoading(id);
      await acceptMentorship(id);
      await fetchData();
      Alert.alert("Success", "Mentorship request accepted!");
    } catch (error) {
      Alert.alert("Error", "Failed to accept request");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecline = async (id: string) => {
    Alert.alert(
      "Decline Request",
      "Are you sure you want to decline this mentorship request?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Decline",
          style: "destructive",
          onPress: async () => {
            try {
              setActionLoading(id);
              await declineMentorship(id);
              await fetchData();
            } catch (error) {
              Alert.alert("Error", "Failed to decline request");
            } finally {
              setActionLoading(null);
            }
          },
        },
      ]
    );
  };

  const filteredMentorships = mentorships.filter((m) => {
    if (activeTab === "active") return m.status === "active";
    if (activeTab === "pending") return m.status === "pending";
    return m.status === "completed";
  });

  const renderStatsCard = () => {
    if (!stats) return null;

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.activeMentorships}</Text>
          <Text style={styles.statLabel}>Active</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalMeetings}</Text>
          <Text style={styles.statLabel}>Meetings</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.completedMentorships}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>
            {stats.averageRating ? stats.averageRating.toFixed(1) : "-"}
          </Text>
          <Text style={styles.statLabel}>Rating</Text>
        </View>
      </View>
    );
  };

  const renderMentorshipCard = ({ item }: { item: Mentorship }) => {
    const otherPerson = item.mentor._id === item.mentee._id ? item.mentor : item.mentee;
    const isLoading = actionLoading === item._id;

    return (
      <View style={styles.mentorshipCard}>
        <View style={styles.cardHeader}>
          {otherPerson.avatar ? (
            <Image source={{ uri: otherPerson.avatar }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{otherPerson.name.charAt(0)}</Text>
            </View>
          )}
          <View style={styles.cardInfo}>
            <Text style={styles.personName}>{otherPerson.name}</Text>
            <Text style={styles.statusText}>
              {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              item.status === "active" && styles.statusActive,
              item.status === "pending" && styles.statusPending,
              item.status === "completed" && styles.statusCompleted,
            ]}
          >
            <Text style={styles.statusBadgeText}>
              {item.status === "active" ? "●" : item.status === "pending" ? "○" : "✓"}
            </Text>
          </View>
        </View>

        {item.goals && item.goals.length > 0 && (
          <View style={styles.goalsContainer}>
            <Text style={styles.goalsLabel}>Goals:</Text>
            {item.goals.slice(0, 2).map((goal, index) => (
              <View key={index} style={styles.goalItem}>
                <Ionicons name="checkmark-circle-outline" size={14} color="#7c3aed" />
                <Text style={styles.goalText}>{goal}</Text>
              </View>
            ))}
          </View>
        )}

        {item.status === "pending" && (
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={[styles.actionButton, styles.acceptButton]}
              onPress={() => handleAccept(item._id)}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.acceptButtonText}>Accept</Text>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.declineButton]}
              onPress={() => handleDecline(item._id)}
              disabled={isLoading}
            >
              <Text style={styles.declineButtonText}>Decline</Text>
            </TouchableOpacity>
          </View>
        )}

        {item.status === "active" && (
          <View style={styles.meetingInfo}>
            <Ionicons name="calendar-outline" size={14} color="#6b7280" />
            <Text style={styles.meetingText}>
              {item.meetings.length} meeting{item.meetings.length !== 1 ? "s" : ""} scheduled
            </Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>Loading mentorships...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderStatsCard()}

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {(["active", "pending", "completed"] as TabType[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text
              style={[styles.tabText, activeTab === tab && styles.tabTextActive]}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredMentorships}
        keyExtractor={(item) => item._id}
        renderItem={renderMentorshipCard}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchData(true)} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>No {activeTab} mentorships</Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    padding: 16,
    marginBottom: 1,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: "#7c3aed",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  tabsContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  tabActive: {
    borderBottomColor: "#7c3aed",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#6b7280",
  },
  tabTextActive: {
    color: "#7c3aed",
  },
  listContent: {
    padding: 16,
  },
  mentorshipCard: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#e0e7ff",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#7c3aed",
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  personName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  statusText: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  statusBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  statusActive: {
    backgroundColor: "#dcfce7",
  },
  statusPending: {
    backgroundColor: "#fef3c7",
  },
  statusCompleted: {
    backgroundColor: "#e0e7ff",
  },
  statusBadgeText: {
    fontSize: 12,
  },
  goalsContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  goalsLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 8,
  },
  goalItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  goalText: {
    fontSize: 14,
    color: "#374151",
    marginLeft: 6,
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  acceptButton: {
    backgroundColor: "#7c3aed",
  },
  acceptButtonText: {
    color: "white",
    fontWeight: "600",
  },
  declineButton: {
    backgroundColor: "#f3f4f6",
  },
  declineButtonText: {
    color: "#6b7280",
    fontWeight: "600",
  },
  meetingInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  meetingText: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 6,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
    marginTop: 12,
  },
});
