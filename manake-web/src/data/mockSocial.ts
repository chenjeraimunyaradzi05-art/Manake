export const MOCK_COMMUNITY_POSTS = [
  {
    _id: "post_0",
    author: {
      _id: "user_sibongile",
      name: "Sibongile Maonde Sokhani",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop",
      role: "admin",
    },
    content:
      "Welcome to Manake! This platform is built on love, hope, and the unwavering belief that recovery is possible. As the founder, I am inspired every day by the strength of our youth. Remember, you are never alone in this journey. #Manake #Hope #FounderMessage",
    mediaUrls: [
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&fit=crop",
    ],
    mediaType: "image",
    likes: ["u1", "u2", "u3", "u4", "u5", "u6", "u7", "u8"],
    commentsCount: 24,
    sharesCount: 15,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "post_1",
    author: {
      _id: "user_1",
      name: "Farai Moyo",
      avatar:
        "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=150&h=150&fit=crop",
      role: "member",
    },
    content:
      "Just finished my first week at the Manake vocational training centre. Learning carpentry has given me something to focus on besides the cravings. Grateful for this second chance. #Recovery #Zimbabwe #Skills",
    mediaUrls: [
      "https://images.unsplash.com/photo-1581092921461-eab62e97a785?w=600&fit=crop",
    ],
    mediaType: "image",
    likes: ["u2", "u3", "u4"],
    commentsCount: 5,
    sharesCount: 2,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "post_2",
    author: {
      _id: "user_2",
      name: "Rudo Ndlovu",
      avatar:
        "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop",
      role: "family",
    },
    content:
      "Attended the family support group in Bulawayo today. It's comforting to know I'm not alone in this journey of supporting a child through rehab. To all mothers out there, keep the faith! 🇿🇼❤️",
    mediaUrls: [],
    mediaType: "none",
    likes: ["u1", "u5"],
    commentsCount: 12,
    sharesCount: 8,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "post_3",
    author: {
      _id: "user_3",
      name: "Tinashe Chikara",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop",
      role: "mentor",
    },
    content:
      "Beautiful sunset over Harare today. Reminds me that after every dark night, there's a brighter day. 3 years clean and counting!",
    mediaUrls: [
      "https://images.unsplash.com/photo-1576487248805-cf45f6bcc67f?w=600&fit=crop",
    ],
    mediaType: "image",
    likes: ["u1", "u2", "u4", "u5", "u6"],
    commentsCount: 3,
    sharesCount: 1,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "post_4",
    author: {
      _id: "user_1",
      name: "Farai Moyo",
      avatar:
        "https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?w=150&h=150&fit=crop",
      role: "member",
    },
    content:
      "Who is coming for the soccer match this Saturday? The 'Sober Strikers' are ready to win! ⚽",
    mediaUrls: [],
    mediaType: "none",
    likes: ["u2", "u4"],
    commentsCount: 8,
    sharesCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
    updatedAt: new Date().toISOString(),
  },
  {
    _id: "post_5",
    author: {
      _id: "user_4",
      name: "Gamuchirai Zviko",
      avatar:
        "https://images.unsplash.com/photo-1589156191108-c762ff4b96ab?w=150&h=150&fit=crop",
      role: "member",
    },
    content:
      "Art therapy session was intense but healing. Expressing what I can't say in words. 🎨🖌️",
    mediaUrls: [
      "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&fit=crop",
    ],
    mediaType: "image",
    likes: ["u1", "u3"],
    commentsCount: 2,
    sharesCount: 0,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 50).toISOString(), // 2 days ago
    updatedAt: new Date().toISOString(),
  },
];
