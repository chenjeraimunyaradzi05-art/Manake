import { useState, useEffect } from "react";
import { StoryCard } from "./StoryCard";
import { fetchStories } from "../services/stories";
import { Loader2, Filter, Search } from "lucide-react";
import type { Story } from "../types";

interface StoriesFeedProps {
  showFilters?: boolean;
  limit?: number;
  featured?: boolean;
  title?: string;
}

const categories = [
  { id: "all", label: "All Stories" },
  { id: "recovery", label: "Recovery" },
  { id: "education", label: "Education" },
  { id: "employment", label: "Employment" },
  { id: "family", label: "Family" },
  { id: "community", label: "Community" },
];

export const StoriesFeed = ({
  showFilters = true,
  limit,
  featured = false,
  title = "Success Stories",
}: StoriesFeedProps) => {
  const [stories, setStories] = useState<Story[]>([]);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStories = async () => {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchStories({
          category: filter === "all" ? undefined : filter,
          search: searchQuery,
          limit,
          featured,
        });
        setStories(data);
      } catch (err) {
        console.error("Failed to load stories:", err);
        setError("Failed to load stories. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    // Debounce search
    const timeoutId = setTimeout(loadStories, searchQuery ? 300 : 0);
    return () => clearTimeout(timeoutId);
  }, [filter, searchQuery, limit, featured]);

  const handleShare = (storyId: string, title: string) => {
    const url = `${window.location.origin}/story/${storyId}`;
    const text = `Check out this inspiring story: "${title}" - Manake Rehabilitation Center`;

    if (navigator.share) {
      navigator.share({
        title: "Manake Rehabilitation Center",
        text: text,
        url: url,
      });
    } else {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`;
      window.open(whatsappUrl, "_blank");
    }
  };

  return (
    <section className="py-16 bg-gray-50">
      <div className="container-custom">
        {/* Header */}
        <div className="mb-10">
          <h2 className="section-heading">{title}</h2>
          <p className="section-subheading">
            Real stories of transformation, hope, and new beginnings from our
            community.
          </p>
        </div>

        {showFilters && (
          <div className="mb-8 space-y-4">
            {/* Search */}
            <div className="relative max-w-md">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-12"
              />
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setFilter(cat.id)}
                  className={`px-4 py-2 rounded-full whitespace-nowrap transition-all text-sm font-medium ${
                    filter === cat.id
                      ? "bg-primary-600 text-white shadow-md"
                      : "bg-white text-gray-700 border border-gray-200 hover:border-primary-300 hover:text-primary-600"
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-10 h-10 text-primary-600 animate-spin mb-4" />
            <p className="text-gray-600">Loading stories...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="text-center py-16">
            <div className="bg-red-50 text-red-600 p-6 rounded-xl max-w-md mx-auto">
              <p className="font-medium mb-2">Oops! Something went wrong</p>
              <p className="text-sm">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 btn-primary bg-red-600 hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && stories.length === 0 && (
          <div className="text-center py-16">
            <Filter className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              No stories found
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery
                ? "Try adjusting your search terms"
                : "Check back soon for new stories!"}
            </p>
            {(searchQuery || filter !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilter("all");
                }}
                className="btn-secondary"
              >
                Clear Filters
              </button>
            )}
          </div>
        )}

        {/* Stories Grid */}
        {!loading && !error && stories.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {stories.map((story, index) => (
              <div
                key={story.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <StoryCard
                  story={story}
                  variant={index === 0 && featured ? "featured" : "default"}
                  onShare={() => handleShare(story.id, story.title)}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
