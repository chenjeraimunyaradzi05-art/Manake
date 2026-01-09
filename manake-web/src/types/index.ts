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
  status: 'draft' | 'published' | 'archived';
}

export type StoryCategory = 
  | 'recovery' 
  | 'education' 
  | 'employment' 
  | 'family' 
  | 'community' 
  | 'life-skills';

export interface StoryComment {
  id: string;
  storyId: string;
  author: string;
  email: string;
  content: string;
  createdAt: string;
  approved: boolean;
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
  price?: number;
  status: 'active' | 'coming-soon' | 'inactive';
}

// Donation types
export interface Donation {
  id: string;
  amount: number;
  currency: string;
  donorName?: string;
  donorEmail: string;
  recurring: boolean;
  paymentMethod: 'card' | 'ecocash' | 'bank';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  purpose: string;
  createdAt: string;
}

export interface DonationIntent {
  clientSecret: string;
  checkoutUrl: string;
  reference: string;
}

// Contact types
export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
  type: ContactType;
  status: 'new' | 'read' | 'replied' | 'archived';
  createdAt: string;
}

export type ContactType = 
  | 'general' 
  | 'help' 
  | 'volunteer' 
  | 'partnership' 
  | 'donate' 
  | 'media';

// Resource types
export interface Resource {
  id: string;
  title: string;
  description: string;
  type: ResourceType;
  url?: string;
  content?: string;
  image?: string;
  category: string;
  tags: string[];
  downloadable: boolean;
}

export type ResourceType = 
  | 'article' 
  | 'video' 
  | 'pdf' 
  | 'infographic' 
  | 'podcast' 
  | 'link';

// Stats types
export interface ImpactStats {
  youthHelped: number;
  successRate: number;
  totalDonors: number;
  staffMembers: number;
  programsOffered: number;
  yearsOperating: number;
}

// Team member types
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  email?: string;
  linkedin?: string;
  twitter?: string;
}

// Testimonial types
export interface Testimonial {
  id: string;
  quote: string;
  author: string;
  role: string;
  image?: string;
  rating: number;
  featured: boolean;
}

// Newsletter subscriber
export interface NewsletterSubscriber {
  email: string;
  name?: string;
  subscribedAt: string;
  status: 'active' | 'unsubscribed';
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Intake form (for those seeking help)
export interface IntakeForm {
  id: string;
  firstName: string;
  lastName?: string;
  age?: number;
  gender?: string;
  phone: string;
  email?: string;
  substanceType: string[];
  duration: string;
  previousTreatment: boolean;
  referralSource: string;
  message?: string;
  preferredContact: 'phone' | 'whatsapp' | 'email';
  urgency: 'low' | 'medium' | 'high' | 'crisis';
  createdAt: string;
  status: 'new' | 'contacted' | 'enrolled' | 'referred';
}
