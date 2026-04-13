import { prisma } from "../config/prisma";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

dotenv.config();

const seedUsers = [
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

const seedStories = [
  {
    title: "From Despair to Hope: Tendai's Journey",
    excerpt:
      "At 19, Tendai thought his life was over. Addicted to crystal meth since 15, he had dropped out of school, lost his family's trust, and was living on the streets of Harare. Today, he's a certified electrician running his own business.",
    content: "Full story content here...",
    authorName: "Tendai M.",
    authorRole: "Community Member",
    image: "https://images.unsplash.com/photo-1542300058-b94b8ab7411b?w=800",
    category: "Recovery",
    tags: ["Recovery", "Employment", "Youth"],
    status: "published",
  },
  {
    title: "Finding Purpose: Chipo's Story",
    excerpt:
      "After completing the 6-month recovery program, Chipo discovered a passion for cooking during life skills training. She now runs a catering business and mentors other young women.",
    content: "Full story content here...",
    authorName: "Chipo N.",
    authorRole: "Community Member",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=800",
    category: "Recovery",
    tags: ["Skills", "Women", "Business"],
    status: "published",
  },
  {
    title: "Back to School at 20",
    excerpt:
      "Nyasha had to drop out of Form 4 due to drug addiction. After 8 months at Manake, she returned to school and just passed her O-Levels. She dreams of becoming a nurse.",
    content: "Full story content here...",
    authorName: "Nyasha R.",
    authorRole: "Community Member",
    image: "https://images.unsplash.com/photo-1589156191108-c762ff4b96ab?w=800",
    category: "Recovery",
    tags: ["Education", "Second Chance"],
    status: "published",
  },
];

const seedDB = async () => {
  try {
    console.log("Clearing existing seed data...");

    await prisma.post.deleteMany({});
    await prisma.story.deleteMany({});
    await prisma.user.deleteMany({
      where: { email: { in: seedUsers.map((u) => u.email) } },
    });

    console.log("Cleared existing stories and posts");

    const hashedPassword = await bcrypt.hash("password123", 10);

    const createdUsers = await Promise.all(
      seedUsers.map((u) =>
        prisma.user.create({
          data: {
            ...u,
            passwordHash: hashedPassword,
            isActive: true,
            isEmailVerified: true,
          },
        }),
      ),
    );
    console.log("Seeded users successfully");

    const Farai = createdUsers.find((u) => u.name === "Farai Moyo");
    const Rudo = createdUsers.find((u) => u.name === "Rudo Ndlovu");
    const Tinashe = createdUsers.find((u) => u.name === "Tinashe Chikara");

    if (Farai && Rudo && Tinashe) {
      await prisma.post.createMany({
        data: [
          {
            authorId: Farai.id,
            content:
              "Just finished my first week at the Manake vocational training centre. Learning carpentry has given me something to focus on besides the cravings. Grateful for this second chance. #Recovery #Zimbabwe #Skills",
            scope: "public",
          },
          {
            authorId: Rudo.id,
            content:
              "Attended the family support group in Bulawayo today. It's comforting to know I'm not alone in this journey of supporting a child through rehab. To all mothers out there, keep the faith! 🇿🇼❤️",
            scope: "public",
          },
          {
            authorId: Tinashe.id,
            content:
              "Beautiful sunset over Harare today. Reminds me that after every dark night, there's a brighter day. 3 years clean and counting!",
            scope: "public",
          },
          {
            authorId: Farai.id,
            content:
              "Who is coming for the soccer match this Saturday? The 'Sober Strikers' are ready to win! ⚽",
            scope: "public",
          },
        ],
      });
      console.log("Seeded posts successfully");
    }

    await prisma.story.createMany({ data: seedStories });
    console.log("Seeded stories successfully");

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
};

seedDB();
