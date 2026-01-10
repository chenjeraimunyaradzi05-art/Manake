import { Story } from "../models/Story";
import { connectDB } from "../config/db";
import dotenv from "dotenv";

dotenv.config();

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
    console.log("Cleared existing stories");

    // Insert new data
    await Story.insertMany(stories);
    console.log("Seeded stories successfully");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
};

seedDB();
