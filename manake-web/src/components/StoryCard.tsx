import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Share2, BookmarkPlus } from "lucide-react";
import type { Story } from "../types";

interface StoryCardProps {
  story: Story;
  onShare?: () => void;
  variant?: "default" | "featured" | "compact";
}

export const StoryCard = ({
  story,
  onShare,
  variant = "default",
}: StoryCardProps) => {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(story.likes);
  const [saved, setSaved] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (liked) {
      setLikes(likes - 1);
    } else {
      setLikes(likes + 1);
    }
    setLiked(!liked);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const url = `${window.location.origin}/story/${story.id}`;
    const text = `Check out this inspiring story: "${story.title}" - Manake Rehabilitation Center`;

    // Use native share if available (especially on mobile)
    if (navigator.share) {
      navigator.share({
        title: "Manake Rehabilitation Center",
        text: text,
        url: url,
      });
    } else {
      // Fallback: WhatsApp Web (critical for Zimbabwe)
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`;
      window.open(whatsappUrl, "_blank");
    }

    onShare?.();
  };

  const handleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSaved(!saved);
  };

  if (variant === "featured") {
    return (
      <Link
        to={`/story/${story.id}`}
        className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300"
      >
        <div className="grid md:grid-cols-2 gap-0">
          {/* Image */}
          <div className="relative aspect-square md:aspect-auto overflow-hidden">
            <img
              src={story.image}
              alt={story.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
            {/* Featured Badge */}
            <div className="absolute top-4 left-4">
              <span className="bg-accent-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                Featured
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-8 flex flex-col justify-center">
            {/* Tags */}
            <div className="flex gap-2 mb-4">
              {story.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="bg-primary-100 text-primary-700 text-xs px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-primary-600 transition-colors">
              {story.title}
            </h3>

            <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
              {story.excerpt}
            </p>

            <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
              <span>{story.author}</span>
              <span>•</span>
              <span>{story.readTime} min read</span>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleLike}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  liked
                    ? "bg-red-50 text-red-500"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <Heart size={18} fill={liked ? "currentColor" : "none"} />
                <span>{likes}</span>
              </button>
              <button
                onClick={handleShare}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600 transition-all"
              >
                <Share2 size={18} />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // Default card variant
  return (
    <Link to={`/story/${story.id}`} className="group card-hover flex flex-col">
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-200">
        <img
          src={story.image}
          alt={story.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {/* Tags Overlay */}
        <div className="absolute top-3 left-3 flex gap-2 flex-wrap">
          {story.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="bg-primary-600 text-white text-xs px-2 py-1 rounded-full shadow-sm"
            >
              {tag}
            </span>
          ))}
        </div>
        {/* Save Button */}
        <button
          onClick={handleSave}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            saved
              ? "bg-primary-600 text-white"
              : "bg-white/80 text-gray-600 hover:bg-white"
          }`}
        >
          <BookmarkPlus size={16} fill={saved ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex-grow flex flex-col">
        <h3 className="font-bold text-lg mb-2 text-gray-900 group-hover:text-primary-600 transition-colors line-clamp-2">
          {story.title}
        </h3>

        <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
          {story.excerpt}
        </p>

        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
          <span className="font-medium">{story.author}</span>
          <span>{story.readTime} min read</span>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3 border-t border-gray-100">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 flex-1 py-2 rounded-lg justify-center transition-all text-sm ${
              liked
                ? "bg-red-50 text-red-500"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Heart size={16} fill={liked ? "currentColor" : "none"} />
            <span>{likes}</span>
          </button>
          <button className="flex items-center gap-1.5 flex-1 py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all justify-center text-sm">
            <MessageCircle size={16} />
            <span>{story.comments}</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 flex-1 py-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-green-50 hover:text-green-600 transition-all justify-center text-sm"
          >
            <Share2 size={16} />
            <span>Share</span>
          </button>
        </div>
      </div>
    </Link>
  );
};
