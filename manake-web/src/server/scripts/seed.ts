import { Story } from "../models/Story";
import { User } from "../models/User";
import { Post } from "../models/Post";
import { connectDB } from "../config/db";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const users = [
  {
    name: "Farai Moyo",
    email: "farai@example.com",
    role: "user",
    avatar:
      "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=150&h=150&fit=crop",
    bio: "Recovering one day at a time. Harare.",
  },
  {
    name: "Rudo Ndlovu",
    email: "rudo@example.com",
    role: "user",
    avatar:
      "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop",
    bio: "Proud mother and community advocate in Bulawayo.",
  },
  {
    name: "Tinashe Chikara",
    email: "tinashe@example.com",
    role: "user",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
    bio: "Youth mentor @ Manake. Let's rebuild together.",
  },
  {
    name: "Gamuchirai Zviko",
    email: "gamu@example.com",
    role: "user",
    avatar:
      "https://images.unsplash.com/photo-1589156191108-c762ff4b96ab?w=150&h=150&fit=crop",
    bio: "Artist and dreamer. Finding color in life again.",
  },
];

const stories = [
  {
    title: "From Despair to Hope: Tendai's Journey",
    excerpt:
      "At 19, Tendai thought his life was over. Addicted to crystal meth since 15, he had dropped out of school, lost his family's trust, and was living on the streets of Harare. Today, he's a certified electrician running his own business.",
    content: "Full story content here...",
    author: {
      name: "Tendai M.",
      role: "Alumni",
      image: "https://images.unsplash.com/photo-1542300058-b94b8ab7411b?w=128",
    },
    image: "https://images.unsplash.com/photo-1542300058-b94b8ab7411b?w=800",
    category: "Recovery",
    tags: ["Recovery", "Employment", "Youth"],
    likes: 234,
  },
  {
    title: "Finding Purpose: Chipo's Story",
    excerpt:
      "After completing the 6-month recovery program, Chipo discovered a passion for cooking during life skills training. She now runs a catering business and mentors other young women.",
    content: "Full story content here...",
    author: {
      name: "Chipo N.",
      role: "Alumni",
      image:
        "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=128",
    },
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800",
    category: "Recovery",
    tags: ["Skills", "Women", "Business"],
    likes: 189,
  },
  {
    title: "Back to School at 20",
    excerpt:
      "Nyasha had to drop out of Form 4 due to drug addiction. After 8 months at Manake, she returned to school and just passed her O-Levels. She dreams of becoming a nurse.",
    content: "Full story content here...",
    author: {
      name: "Nyasha R.",
      role: "Student",
      image:
        "https://images.unsplash.com/photo-1589156191108-c762ff4b96ab?w=128",
    },
    image: "https://images.unsplash.com/photo-1589156191108-c762ff4b96ab?w=800",
    category: "Recovery",
    tags: ["Education", "Second Chance"],
    likes: 456,
  },
];

const seedDB = async () => {
  try {
    await connectDB();

    // Clear existing data
    await Story.deleteMany({});
    await User.deleteMany({ email: { $in: users.map((u) => u.email) } });
    await Post.deleteMany({});

    console.log("Cleared existing stories and posts");

    // Create Users
    const hashedPassword = await bcrypt.hash("password123", 10);
    const createdUsers = await User.insertMany(
      users.map((u) => ({
        ...u,
        passwordHash: hashedPassword,
        isActive: true,
        isEmailVerified: true,
      })),
    );
    console.log("Seeded users successfully");

    // Map users for posts
    const Farai = createdUsers.find((u) => u.name === "Farai Moyo");
    const Rudo = createdUsers.find((u) => u.name === "Rudo Ndlovu");
    const Tinashe = createdUsers.find((u) => u.name === "Tinashe Chikara");

    // Create Posts
    const posts = [
      {
        author: Farai?._id,
        content:
          "Just finished my first week at the Manake vocational training centre. Learning carpentry has given me something to focus on besides the cravings. Grateful for this second chance. #Recovery #Zimbabwe #Skills",
        media: [
          {
            url: "https://images.unsplash.com/photo-1581092921461-eab62e97a785?w=600&fit=crop",
            type: "image",
            alt: "Carpentry workshop",
          },
        ],
        scope: "public",
        likes: [],
        comments: [],
      },
      {
        author: Rudo?._id,
        content:
          "Attended the family support group in Bulawayo today. It's comforting to know I'm not alone in this journey of supporting a child through rehab. To all mothers out there, keep the faith! 🇿🇼❤️",
        media: [],
        scope: "public",
        likes: [],
        comments: [],
      },
      {
        author: Tinashe?._id,
        content:
          "Beautiful sunset over Harare today. Reminds me that after every dark night, there's a brighter day. 3 years clean and counting!",
        media: [
          {
            url: "https://images.unsplash.com/photo-1576487248805-cf45f6bcc67f?w=600&fit=crop",
            type: "image",
            alt: "Harare sunset",
          },
        ],
        scope: "public",
        likes: [],
        comments: [],
      },
      {
        author: Farai?._id,
        content:
          "Who is coming for the soccer match this Saturday? The 'Sober Strikers' are ready to win! ⚽",
        media: [],
        scope: "public",
        likes: [],
        comments: [],
      },
    ];

    if (Farai && Rudo && Tinashe) {
      await Post.insertMany(posts);
      console.log("Seeded posts successfully");
    }

    // Insert stories
    await Story.insertMany(stories);
    console.log("Seeded stories successfully");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDB();
