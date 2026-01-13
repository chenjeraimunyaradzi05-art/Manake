import React, { useState, useCallback, useRef } from "react";
import { useMentors, useFeaturedMentors } from "../../hooks/useMentorship";
import { Mentor } from "../../services/mentorshipService";
import { MentorCard, MentorCardSkeleton } from "./MentorCard";
import { MentorDetailModal } from "./MentorDetailModal";

const SPECIALIZATIONS = [
  { value: "all", label: "All Specializations" },
  { value: "trauma-recovery", label: "Trauma Recovery" },
  { value: "emotional-healing", label: "Emotional Healing" },
  { value: "advocacy", label: "Advocacy" },
  { value: "legal-support", label: "Legal Support" },
  { value: "career-guidance", label: "Career Guidance" },
  { value: "relationships", label: "Relationships" },
  { value: "self-care", label: "Self-Care" },
];

const AVAILABILITY_OPTIONS = [
  { value: "", label: "Any Availability" },
  { value: "1", label: "1+ hours/week" },
  { value: "3", label: "3+ hours/week" },
  { value: "5", label: "5+ hours/week" },
];

const RATING_OPTIONS = [
  { value: "", label: "Any Rating" },
  { value: "3", label: "3+ stars" },
  { value: "4", label: "4+ stars" },
  { value: "4.5", label: "4.5+ stars" },
];

export const MentorDiscovery: React.FC = () => {
  const [filters, setFilters] = useState({
    specialization: "all",
    availability: "",
    minRating: "",
    search: "",
  });
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Convert string filter values to the types expected by useMentors
  const apiFilters = {
    specialization: filters.specialization === "all" ? undefined : filters.specialization,
    availability: filters.availability ? parseInt(filters.availability) : undefined,
    minRating: filters.minRating ? parseFloat(filters.minRating) : undefined,
    search: filters.search || undefined,
  };

  const {
    data,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMentors(apiFilters);

  const { data: featuredData, isLoading: featuredLoading } = useFeaturedMentors();

  const mentors = data?.pages.flatMap((page) => page.mentors) || [];

  // Infinite scroll
  const lastMentorRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isFetchingNextPage) return;
      if (observerRef.current) observerRef.current.disconnect();
      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasNextPage) {
          fetchNextPage();
        }
      });
      if (node) observerRef.current.observe(node);
    },
    [isFetchingNextPage, hasNextPage, fetchNextPage]
  );

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-8">
      {/* Featured Mentors */}
      {!filters.search && filters.specialization === "all" && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            ⭐ Featured Mentors
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredLoading
              ? Array.from({ length: 3 }).map((_, i) => <MentorCardSkeleton key={i} />)
              : featuredData?.mentors.map((mentor) => (
                  <MentorCard
                    key={mentor._id}
                    mentor={mentor}
                    onViewDetails={setSelectedMentor}
                  />
                ))}
          </div>
        </section>
      )}

      {/* Filters */}
      <section>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-wrap gap-4">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Search mentors..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>

            {/* Specialization */}
            <select
              value={filters.specialization}
              onChange={(e) => handleFilterChange("specialization", e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {SPECIALIZATIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Availability */}
            <select
              value={filters.availability}
              onChange={(e) => handleFilterChange("availability", e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {AVAILABILITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Rating */}
            <select
              value={filters.minRating}
              onChange={(e) => handleFilterChange("minRating", e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              {RATING_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Mentors Grid */}
      <section>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          All Mentors
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <MentorCardSkeleton key={i} />
            ))}
          </div>
        ) : mentors.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No mentors found matching your criteria.</p>
            <button
              onClick={() =>
                setFilters({
                  specialization: "all",
                  availability: "",
                  minRating: "",
                  search: "",
                })
              }
              className="mt-4 text-primary hover:underline"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {mentors.map((mentor, index) => (
              <div
                key={mentor._id}
                ref={index === mentors.length - 1 ? lastMentorRef : undefined}
              >
                <MentorCard mentor={mentor} onViewDetails={setSelectedMentor} />
              </div>
            ))}
            {isFetchingNextPage &&
              Array.from({ length: 4 }).map((_, i) => (
                <MentorCardSkeleton key={`loading-${i}`} />
              ))}
          </div>
        )}
      </section>

      {/* Mentor Detail Modal */}
      {selectedMentor && (
        <MentorDetailModal
          mentorId={selectedMentor._id}
          onClose={() => setSelectedMentor(null)}
        />
      )}
    </div>
  );
};
