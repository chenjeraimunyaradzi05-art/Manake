import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Heart,
  Share2,
  MessageCircle,
  Calendar,
  Clock,
  User,
  Facebook,
  Twitter,
  Loader2,
} from "lucide-react";
import { fetchStoryById, likeStory as likeStoryApi } from "../services/stories";
import type { Story } from "../types";

export const StoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [story, setStory] = useState<Story | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(0);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    const loadStory = async () => {
      if (!id) return;

      setLoading(true);
      try {
        const data = await fetchStoryById(id);
        setStory(data);
        if (data) setLikes(data.likes);

        // Check if user already liked this story (stored in localStorage)
        const likedStories = JSON.parse(
          localStorage.getItem("likedStories") || "[]",
        );
        setLiked(likedStories.includes(id));
      } catch (error) {
        console.error("Failed to load story:", error);
      } finally {
        setLoading(false);
      }
    };

    loadStory();
  }, [id]);

  const handleLike = async () => {
    if (!id || liking) return;

    // Optimistic UI update
    const newLiked = !liked;
    setLiked(newLiked);
    setLikes((prev) => (newLiked ? prev + 1 : prev - 1));

    // Persist to localStorage
    const likedStories = JSON.parse(
      localStorage.getItem("likedStories") || "[]",
    );
    if (newLiked) {
      likedStories.push(id);
    } else {
      const index = likedStories.indexOf(id);
      if (index > -1) likedStories.splice(index, 1);
    }
    localStorage.setItem("likedStories", JSON.stringify(likedStories));

    // Only call API when liking (not unliking) to avoid complexity
    if (newLiked) {
      setLiking(true);
      try {
        const result = await likeStoryApi(id);
        setLikes(result.likes);
      } catch (error) {
        console.error("Failed to like story:", error);
        // Don't revert UI - the local like is still meaningful
      } finally {
        setLiking(false);
      }
    }
  };

  const handleShare = (
    platform: "whatsapp" | "facebook" | "twitter" | "copy",
  ) => {
    const url = window.location.href;
    const text = story
      ? `Check out "${story.title}" - Manake Rehabilitation Center`
      : "";

    switch (platform) {
      case "whatsapp":
        window.open(
          `https://wa.me/?text=${encodeURIComponent(text + " " + url)}`,
          "_blank",
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          "_blank",
        );
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          "_blank",
        );
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        alert("Link copied to clipboard!");
        break;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-primary-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading story...</p>
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Story Not Found
          </h1>
          <p className="text-gray-600 mb-6">
            The story you're looking for doesn't exist.
          </p>
          <Link to="/stories" className="btn-primary">
            Browse All Stories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Hero Header */}
      <section className="relative bg-gray-900 text-white">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={story.image}
            alt={story.title}
            className="w-full h-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/70 to-gray-900/40" />
        </div>

        <div className="container-custom relative z-10 py-20">
          <Link
            to="/stories"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white mb-8 transition-colors"
          >
            <ArrowLeft size={18} />
            Back to Stories
          </Link>

          {/* Tags */}
          <div className="flex gap-2 mb-4">
            {story.tags.map((tag) => (
              <span
                key={tag}
                className="bg-primary-600 text-white text-sm px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-xl md:text-2xl font-bold mb-6 max-w-3xl">
            {story.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap gap-6 text-gray-300">
            <div className="flex items-center gap-2">
              <User size={18} />
              <span>{story.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={18} />
              <span>
                {new Date(story.publishedAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={18} />
              <span>{story.readTime} min read</span>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-gray-50">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <article className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12">
                {/* Lead paragraph */}
                <p className="text-xl text-gray-700 leading-relaxed mb-8 font-medium">
                  {story.excerpt}
                </p>

                {/* Story content - would be rich text in production */}
                <div className="prose prose-lg max-w-none">
                  <p>
                    {story.content ||
                      `
                      When ${story.author.split(" ")[0]} first walked through the doors of Manake Rehabilitation Center, 
                      they carried years of struggle, pain, and broken dreams. Like many of our youth, 
                      addiction had taken everything - family relationships, education, self-worth, and hope for the future.

                      But within those same walls, something remarkable began to happen. With the support of our 
                      dedicated counselors, life skills trainers, and a community that refused to give up, 
                      ${story.author.split(" ")[0]} started to rebuild.

                      "The first few weeks were the hardest," ${story.author.split(" ")[0]} recalls. "I wanted to leave every day. 
                      But the staff and other residents became like family. They understood what I was going through 
                      because many of them had been there themselves."

                      The 6-month residential program at Manake isn't just about getting clean - it's about 
                      rediscovering who you are and who you can become. Through vocational training, 
                      ${story.author.split(" ")[0]} discovered hidden talents and developed marketable skills.

                      Today, ${story.author.split(" ")[0]}'s story stands as a beacon of hope for others still in the darkness of addiction. 
                      Their journey proves what we believe with all our hearts: recovery is possible, and 
                      every young person deserves a second chance.
                    `}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-4 mt-12 pt-8 border-t">
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl transition-all ${
                      liked
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    <Heart size={20} fill={liked ? "currentColor" : "none"} />
                    <span>{likes} Likes</span>
                  </button>

                  <button
                    onClick={() => handleShare("whatsapp")}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-100 text-green-700 hover:bg-green-200 transition-all"
                  >
                    <Share2 size={20} />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    onClick={() => handleShare("facebook")}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all"
                  >
                    <Facebook size={20} />
                    <span>Facebook</span>
                  </button>

                  <button
                    onClick={() => handleShare("twitter")}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-100 text-sky-700 hover:bg-sky-200 transition-all"
                  >
                    <Twitter size={20} />
                    <span>Twitter</span>
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              <div className="bg-white rounded-2xl shadow-lg p-8 mt-8">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <MessageCircle size={24} />
                  Comments ({story.comments})
                </h3>

                {/* Comment Form */}
                <form className="mb-8 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="Your name"
                      className="input-field"
                    />
                    <input
                      type="email"
                      placeholder="Your email"
                      className="input-field"
                    />
                  </div>
                  <textarea
                    placeholder="Share your thoughts or words of encouragement..."
                    rows={4}
                    className="input-field resize-none"
                  />
                  <button type="submit" className="btn-primary">
                    Post Comment
                  </button>
                </form>

                {/* Sample comments */}
                <div className="space-y-6">
                  {[
                    {
                      author: "Sarah M.",
                      comment:
                        "Such an inspiring story! Gives me hope for my brother who is struggling.",
                      time: "2 days ago",
                    },
                    {
                      author: "John K.",
                      comment: "Manake truly does amazing work. Keep it up!",
                      time: "1 week ago",
                    },
                  ].map((comment, index) => (
                    <div key={index} className="border-b pb-4 last:border-0">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 font-bold">
                            {comment.author[0]}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {comment.author}
                          </p>
                          <p className="text-sm text-gray-500">
                            {comment.time}
                          </p>
                        </div>
                      </div>
                      <p className="text-gray-700 ml-13">{comment.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="space-y-8">
              {/* Donate CTA */}
              <div className="bg-gradient-to-br from-primary-600 to-primary-800 text-white rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-3">
                  Support Stories Like This
                </h3>
                <p className="text-primary-100 mb-4">
                  Your donation helps more youth write their own recovery story.
                </p>
                <Link
                  to="/donate"
                  className="btn-primary bg-white text-primary-700 hover:bg-primary-50 w-full"
                >
                  <Heart size={18} />
                  Donate Now
                </Link>
              </div>

              {/* Share Card */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="font-bold text-lg mb-4">Share This Story</h3>
                <p className="text-gray-600 text-sm mb-4">
                  Help spread hope by sharing this story with your network.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleShare("whatsapp")}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-all"
                  >
                    WhatsApp
                  </button>
                  <button
                    onClick={() => handleShare("facebook")}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition-all"
                  >
                    Facebook
                  </button>
                  <button
                    onClick={() => handleShare("twitter")}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-sky-500 text-white hover:bg-sky-600 transition-all"
                  >
                    Twitter
                  </button>
                  <button
                    onClick={() => handleShare("copy")}
                    className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gray-200 text-gray-700 hover:bg-gray-300 transition-all"
                  >
                    Copy Link
                  </button>
                </div>
              </div>

              {/* Get Help CTA */}
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <h3 className="font-bold text-lg text-red-800 mb-3">
                  Need Help?
                </h3>
                <p className="text-red-700 text-sm mb-4">
                  If you or someone you know is struggling with addiction, we're
                  here to help.
                </p>
                <Link to="/get-help" className="btn-emergency w-full">
                  Get Help Now
                </Link>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
};
