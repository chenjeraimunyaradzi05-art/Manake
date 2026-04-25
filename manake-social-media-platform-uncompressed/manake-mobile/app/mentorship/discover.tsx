import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Image,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
  getMentors,
  getFeaturedMentors,
  requestMentorship,
  Mentor,
  MentorFilters,
} from "../../services/mentorship";

const SPECIALIZATIONS = [
  "Trauma Recovery",
  "Self-Care",
  "Advocacy",
  "Legal Support",
  "Career Guidance",
  "Emotional Healing",
  "Family Reconciliation",
];

export default function MentorDiscoveryScreen() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [featuredMentors, setFeaturedMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSpecialization, setSelectedSpecialization] = useState<string | undefined>();
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchMentors = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        setPage(1);
      }

      const filters: MentorFilters = {
        page: isRefresh ? 1 : page,
        limit: 10,
        search: searchQuery || undefined,
        specialization: selectedSpecialization,
      };

      const [mentorsData, featuredData] = await Promise.all([
        getMentors(filters),
        isRefresh || page === 1 ? getFeaturedMentors() : Promise.resolve({ mentors: featuredMentors }),
      ]);

      if (isRefresh) {
        setMentors(mentorsData.mentors);
        setFeaturedMentors(featuredData.mentors);
      } else {
        setMentors((prev) => [...prev, ...mentorsData.mentors]);
      }

      setHasMore(mentorsData.mentors.length === 10);
    } catch (error) {
      console.error("Failed to fetch mentors:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [page, searchQuery, selectedSpecialization, featuredMentors]);

  useFocusEffect(
    useCallback(() => {
      fetchMentors(true);
    }, [])
  );

  const handleSearch = () => {
    setPage(1);
    setMentors([]);
    fetchMentors(true);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      setPage((prev) => prev + 1);
    }
  };

  const renderStars = (rating?: number) => {
    const stars = [];
    const roundedRating = Math.round(rating || 0);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= roundedRating ? "star" : "star-outline"}
          size={14}
          color={i <= roundedRating ? "#fbbf24" : "#d1d5db"}
        />
      );
    }
    return <View style={styles.starsContainer}>{stars}</View>;
  };

  const renderMentorCard = ({ item }: { item: Mentor }) => (
    <TouchableOpacity
      style={styles.mentorCard}
      onPress={() => {
        setSelectedMentor(item);
        setShowRequestModal(true);
      }}
    >
      <View style={styles.mentorHeader}>
        {item.avatar ? (
          <Image source={{ uri: item.avatar }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarPlaceholder}>
            <Text style={styles.avatarText}>{item.name.charAt(0)}</Text>
          </View>
        )}
        <View style={styles.mentorInfo}>
          <Text style={styles.mentorName}>{item.name}</Text>
          {item.profile?.headline && (
            <Text style={styles.mentorHeadline} numberOfLines={1}>
              {item.profile.headline}
            </Text>
          )}
          <View style={styles.ratingContainer}>
            {renderStars(item.mentorship?.averageRating)}
            {item.mentorship?.averageRating && (
              <Text style={styles.ratingText}>
                ({item.mentorship.averageRating.toFixed(1)})
              </Text>
            )}
          </View>
        </View>
      </View>

      <View style={styles.mentorDetails}>
        <View style={styles.detailRow}>
          <Ionicons name="time-outline" size={14} color="#6b7280" />
          <Text style={styles.detailText}>
            {item.mentorship?.yearsInRecovery || 0}+ years in recovery
          </Text>
        </View>
        <View style={styles.detailRow}>
          <Ionicons name="heart-outline" size={14} color="#6b7280" />
          <Text style={styles.detailText}>
            {item.mentorship?.mentorshipStyle || "Supportive"}
          </Text>
        </View>
      </View>

      {item.mentorship?.specializations && item.mentorship.specializations.length > 0 && (
        <View style={styles.specializationsContainer}>
          {item.mentorship.specializations.slice(0, 3).map((spec, index) => (
            <View key={index} style={styles.specializationTag}>
              <Text style={styles.specializationText}>{spec}</Text>
            </View>
          ))}
          {item.mentorship.specializations.length > 3 && (
            <Text style={styles.moreText}>
              +{item.mentorship.specializations.length - 3}
            </Text>
          )}
        </View>
      )}

      <TouchableOpacity
        style={styles.requestButton}
        onPress={() => {
          setSelectedMentor(item);
          setShowRequestModal(true);
        }}
      >
        <Text style={styles.requestButtonText}>Request Mentorship</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderFeaturedSection = () => {
    if (featuredMentors.length === 0) return null;

    return (
      <View style={styles.featuredSection}>
        <Text style={styles.sectionTitle}>Featured Mentors</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.featuredScroll}
        >
          {featuredMentors.map((mentor) => (
            <TouchableOpacity
              key={mentor._id}
              style={styles.featuredCard}
              onPress={() => {
                setSelectedMentor(mentor);
                setShowRequestModal(true);
              }}
            >
              {mentor.avatar ? (
                <Image source={{ uri: mentor.avatar }} style={styles.featuredAvatar} />
              ) : (
                <View style={[styles.avatarPlaceholder, styles.featuredAvatar]}>
                  <Text style={styles.avatarText}>{mentor.name.charAt(0)}</Text>
                </View>
              )}
              <Text style={styles.featuredName} numberOfLines={1}>
                {mentor.name}
              </Text>
              {renderStars(mentor.mentorship?.averageRating)}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  if (loading && mentors.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={styles.loadingText}>Finding mentors...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search mentors..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSubmitEditing={handleSearch}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Ionicons name="search" size={20} color="white" />
        </TouchableOpacity>
      </View>

      {/* Filters */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filtersScroll}
        contentContainerStyle={styles.filtersContainer}
      >
        <TouchableOpacity
          style={[
            styles.filterChip,
            !selectedSpecialization && styles.filterChipActive,
          ]}
          onPress={() => {
            setSelectedSpecialization(undefined);
            handleSearch();
          }}
        >
          <Text
            style={[
              styles.filterChipText,
              !selectedSpecialization && styles.filterChipTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        {SPECIALIZATIONS.map((spec) => (
          <TouchableOpacity
            key={spec}
            style={[
              styles.filterChip,
              selectedSpecialization === spec && styles.filterChipActive,
            ]}
            onPress={() => {
              setSelectedSpecialization(spec);
              handleSearch();
            }}
          >
            <Text
              style={[
                styles.filterChipText,
                selectedSpecialization === spec && styles.filterChipTextActive,
              ]}
            >
              {spec}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Mentors List */}
      <FlatList
        data={mentors}
        keyExtractor={(item) => item._id}
        renderItem={renderMentorCard}
        ListHeaderComponent={renderFeaturedSection}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => fetchMentors(true)} />
        }
        ListFooterComponent={
          loading ? (
            <ActivityIndicator size="small" color="#7c3aed" style={styles.footerLoader} />
          ) : null
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="people-outline" size={48} color="#9ca3af" />
            <Text style={styles.emptyText}>No mentors found</Text>
            <Text style={styles.emptySubtext}>Try adjusting your filters</Text>
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
    backgroundColor: "#f3f4f6",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: "#6b7280",
  },
  searchContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "white",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  searchInput: {
    flex: 1,
    height: 44,
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  searchButton: {
    width: 44,
    height: 44,
    backgroundColor: "#7c3aed",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 8,
  },
  filtersScroll: {
    backgroundColor: "white",
    maxHeight: 56,
  },
  filtersContainer: {
    padding: 12,
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#f3f4f6",
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: "#7c3aed",
  },
  filterChipText: {
    fontSize: 14,
    color: "#6b7280",
  },
  filterChipTextActive: {
    color: "white",
  },
  listContent: {
    padding: 16,
  },
  featuredSection: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  featuredScroll: {
    paddingRight: 16,
  },
  featuredCard: {
    width: 100,
    alignItems: "center",
    marginRight: 12,
  },
  featuredAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 8,
  },
  featuredName: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
    textAlign: "center",
    marginBottom: 4,
  },
  mentorCard: {
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
  mentorHeader: {
    flexDirection: "row",
    marginBottom: 12,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#e0e7ff",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#7c3aed",
  },
  mentorInfo: {
    flex: 1,
    marginLeft: 12,
  },
  mentorName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  mentorHeadline: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 2,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  starsContainer: {
    flexDirection: "row",
  },
  ratingText: {
    fontSize: 12,
    color: "#6b7280",
    marginLeft: 4,
  },
  mentorDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: "#6b7280",
    marginLeft: 6,
  },
  specializationsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  specializationTag: {
    backgroundColor: "#f3f4f6",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  specializationText: {
    fontSize: 12,
    color: "#4b5563",
  },
  moreText: {
    fontSize: 12,
    color: "#7c3aed",
    alignSelf: "center",
  },
  requestButton: {
    backgroundColor: "#7c3aed",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  requestButtonText: {
    color: "white",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 48,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#374151",
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  footerLoader: {
    paddingVertical: 16,
  },
});
