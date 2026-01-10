// User & Auth types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  phone?: string;
  bio?: string;
  joinedAt: string;
  role: "user" | "volunteer" | "admin" | "moderator";
  preferences: UserPreferences;
  stats: UserStats;
}

export interface UserPreferences {
  notifications: boolean;
  emailUpdates: boolean;
  darkMode: boolean;
  language: string;
}

export interface UserStats {
  storiesLiked: number;
  commentsMade: number;
  totalDonated: number;
  storiesShared: number;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData extends LoginCredentials {
  name: string;
  phone?: string;
}

// Story types
export interface Story {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  author: string;
  authorImage?: string;
  publishedAt: string;
  updatedAt?: string;
  readTime: number;
  likes: number;
  comments: number;
  tags: string[];
  category: StoryCategory;
  featured: boolean;
  status: "draft" | "published" | "archived";
  isLiked?: boolean;
}

export type StoryCategory =
  | "recovery"
  | "education"
  | "employment"
  | "family"
  | "community"
  | "life-skills";

export interface StoryComment {
  id?: string;
  storyId?: string;
  author: string;
  authorImage?: string;
  content: string;
  createdAt: string;
  approved?: boolean;
}

// Donation types
export interface Donation {
  id: string;
  amount: number;
  currency: string;
  donorName?: string;
  donorEmail: string;
  recurring: boolean;
  paymentMethod: "card" | "ecocash" | "bank";
  status: "pending" | "completed" | "failed" | "refunded";
  purpose: string;
  createdAt: string;
}

export interface DonationRequest {
  amount: number;
  currency: string;
  paymentMethod: "card" | "ecocash" | "bank";
  purpose: string;
  donorName?: string;
  donorEmail: string;
  recurring?: boolean;
}

// Contact types
export interface ContactMessage {
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  type: ContactType;
}

export type ContactType =
  | "general"
  | "help"
  | "volunteer"
  | "partnership"
  | "donate"
  | "media";

// Emergency Contact
export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  description: string;
  available24h: boolean;
  icon: string;
}

// Program types
export interface Program {
  id: string;
  title: string;
  slug: string;
  description: string;
  longDescription: string;
  duration: string;
  capacity: string;
  features: string[];
  requirements: string[];
  image: string;
  color: string;
  status: "active" | "coming-soon" | "inactive";
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Navigation types
export type RootStackParamList = {
  "(tabs)": undefined;
  "story/[id]": { id: string };
  "donate/checkout": { amount: number; purpose: string };
  "auth/login": undefined;
  "auth/register": undefined;
  settings: undefined;
};

// UI Component types
export interface CardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  onPress?: () => void;
  style?: object;
}

export interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  icon?: string;
  style?: object;
}

// Quick Action for Profile
export interface QuickAction {
  id: string;
  icon: string;
  label: string;
  route?: string;
  action?: () => void;
  color?: string;
}

// Setting Item
export interface SettingItem {
  id: string;
  icon: string;
  label: string;
  value?: string | boolean;
  type: "toggle" | "link" | "info";
  onPress?: () => void;
  onChange?: (value: boolean) => void;
}
