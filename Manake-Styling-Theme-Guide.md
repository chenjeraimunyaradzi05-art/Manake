# Manake Platform - Styling Theme & Social Networking Implementation Guide

**Version:** 2.1  
**Date:** January 2026  
**Status:** Ready for Theme Development & Social Features  
**Platform:** Web (React 18 + Tailwind CSS) | Mobile (React Native/Expo) | Backend (Express + MongoDB)

---

## 📑 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Platform Overview](#current-platform-overview)
3. [Styling Theme Architecture](#styling-theme-architecture)
4. [Color Palette & Design System](#color-palette--design-system)
5. [Tailwind CSS Configuration](#tailwind-css-configuration)
6. [Social Networking Implementation](#social-networking-implementation)
7. [Feature Gap Analysis](#feature-gap-analysis)
8. [Phase-by-Phase Implementation](#phase-by-phase-implementation)
9. [Component Library Standards](#component-library-standards)
10. [Mobile Styling Consistency](#mobile-styling-consistency)
11. [Accessibility & Theming](#accessibility--theming)

---

## Executive Summary

Manake Rehabilitation Center Platform has successfully implemented **core functionality** across web and mobile:

✅ **Operational Features:**
- User authentication (JWT + OAuth)
- Story management with moderation workflow
- Donation processing (Stripe integration)
- Messaging system (WhatsApp/Instagram/Facebook ready)
- Social media feed aggregation
- Push notification infrastructure
- Admin dashboard with analytics

⚠️ **Features Needing Enhancement:**
- **Social Feed** - Currently static with hardcoded demo data
- **Community Page** - Visual mockup without functional features
- **My Network** - Missing (404 error)
- **User Profile** - Missing public profile pages
- **Social Networking** - No connection/mentorship matching system

🎨 **Styling Status:**
- Using **Tailwind CSS** with PostCSS
- Basic component library in place
- Needs: Comprehensive theme system, dark mode support, consistent spacing/typography

---

## Current Platform Overview

### What Manake Currently Does

#### For Public Users
| Feature | Status | Details |
|---------|--------|---------|
| Browse Recovery Stories | ✅ Live | Categorized by Recovery, Family, Community, Staff |
| Make Donations | ✅ Live | One-time & recurring via Stripe |
| View Social Feed | 🟡 Static | Demo data from Instagram/Facebook |
| Access Crisis Help | ✅ Live | Hotlines, WhatsApp support links |
| Submit Contact Form | ✅ Live | Inquiries, volunteering, partnerships |

#### For Authenticated Users
| Feature | Status | Details |
|---------|--------|---------|
| Submit Recovery Stories | ✅ Live | Moderated before publishing |
| Send Messages | ✅ Live | WhatsApp/Instagram/Facebook ready |
| Push Notifications | ✅ Live | Story updates, donation receipts |
| Manage Profile | ✅ Live | Personal info, preferences, settings |
| Biometric Login | ✅ Live | Face ID / Touch ID on mobile |

#### For Admins/Moderators
| Feature | Status | Details |
|---------|--------|---------|
| Dashboard Analytics | ✅ Live | Users, stories, donations, messages |
| Story Moderation | ✅ Live | Approve/reject pending stories |
| User Management | ✅ Live | Roles, activation, deletion |
| Activity Feed | ✅ Live | Recent platform actions |
| Featured Stories | ✅ Live | Highlight key recovery stories |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                           │
├─────────────────────────────────────────────────────────────┤
│  Web (React 18)  │  iOS (React Native)  │  Android (Expo)   │
└────────┬──────────────────┬─────────────────────┬────────────┘
         │                  │                     │
         └──────────────────┼─────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│        API GATEWAY (Express Middleware Layer)                │
│   Rate Limiting • JWT • CORS • Validation • Logging         │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│            BACKEND SERVICES (Node.js/Express)              │
├─────────────────────────────────────────────────────────────┤
│  Stories │ Donations │ Messaging │ Social │ Admin │ Auth     │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│          INTEGRATIONS (Third-party APIs)                     │
├─────────────────────────────────────────────────────────────┤
│  Stripe │ Whapi │ Meta Graph API │ Firebase │ SendGrid      │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│              DATA LAYER                                      │
├─────────────────────────────────────────────────────────────┤
│  MongoDB (Primary) │ Redis (Cache) │ Cloudinary (Media)     │
└─────────────────────────────────────────────────────────────┘
```

---

## Styling Theme Architecture

### Design Philosophy

Manake's styling should reflect:
- **Healing & Warmth** - Welcoming colors for recovery journey
- **Trust & Clarity** - Clear typography and hierarchy
- **Accessibility** - High contrast, readable, inclusive
- **Responsiveness** - Beautiful on all devices
- **Consistency** - Unified design language across web/mobile

### Theme Structure

```
Manake Styling System
├── Color Palette
│   ├── Primary Colors (Brand identity)
│   ├── Secondary Colors (Accents)
│   ├── Status Colors (Success, warning, error)
│   ├── Neutral Colors (Text, backgrounds)
│   └── Semantic Colors (Light/Dark modes)
├── Typography
│   ├── Font families (Headings, Body, Mono)
│   ├── Font sizes (Responsive scales)
│   ├── Line heights (Readability)
│   └── Font weights (Hierarchy)
├── Spacing
│   ├── Margin utilities
│   ├── Padding utilities
│   └── Gap utilities (Flexbox/Grid)
├── Components
│   ├── Buttons (Primary, Secondary, Danger)
│   ├── Cards (Story, Donation, Profile)
│   ├── Forms (Input, Textarea, Select)
│   ├── Navigation (Tabs, Sidebar, Mobile)
│   ├── Modals (Story detail, Confirmation)
│   └── Notifications (Toast, Banner)
├── Layouts
│   ├── Hero section
│   ├── Container widths
│   ├── Grid systems
│   └── Responsive breakpoints
└── Interactions
    ├── Hover states
    ├── Active states
    ├── Disabled states
    ├── Loading states
    └── Transitions
```

---

## Color Palette & Design System

### Primary Color Palette

```css
/* Healing & Hope */
--color-primary-hope: #10b981;      /* Emerald Green - Growth, renewal */
--color-primary-warmth: #f59e0b;    /* Amber - Energy, optimism */
--color-primary-calm: #3b82f6;      /* Blue - Trust, stability */

/* Supporting Colors */
--color-secondary-compassion: #ec4899;  /* Rose - Empathy, connection */
--color-secondary-unity: #8b5cf6;       /* Purple - Community, wisdom */

/* Text & Background */
--color-neutral-dark: #1f2937;      /* Charcoal - Primary text */
--color-neutral-light: #f9fafb;     /* Off-white - Primary bg */
--color-neutral-gray: #6b7280;      /* Medium gray - Secondary text */

/* Status Colors */
--color-success: #10b981;           /* Green - Completion, approval */
--color-warning: #f59e0b;           /* Amber - Caution, pending */
--color-error: #ef4444;             /* Red - Errors, rejections */
--color-info: #3b82f6;              /* Blue - Information, help */
```

### Tailwind CSS Color Tokens

```javascript
module.exports = {
  theme: {
    colors: {
      // Brand Colors
      manake: {
        50: '#f0fdf4',   // Lightest
        100: '#dcfce7',
        200: '#bbf7d0',
        300: '#86efac',
        400: '#4ade80',
        500: '#22c55e',
        600: '#16a34a',   // Primary
        700: '#15803d',
        800: '#166534',
        900: '#145231',
        950: '#0d2818',
      },
      
      // Accent Colors
      hope: {
        primary: '#10b981',
        hover: '#059669',
        light: '#d1fae5',
      },
      warmth: {
        primary: '#f59e0b',
        hover: '#d97706',
        light: '#fef3c7',
      },
      calm: {
        primary: '#3b82f6',
        hover: '#2563eb',
        light: '#eff6ff',
      },
      
      // Semantic
      neutral: {
        50: '#f9fafb',    // Bg
        100: '#f3f4f6',   // Borders
        200: '#e5e7eb',   // Disabled
        400: '#9ca3af',   // Secondary text
        600: '#4b5563',   // Primary text
        900: '#111827',   // Darkest text
      },
    },
  },
};
```

### Dark Mode Support

```css
/* Light Mode (Default) */
.light {
  --bg-primary: #ffffff;
  --bg-secondary: #f9fafb;
  --text-primary: #1f2937;
  --text-secondary: #6b7280;
  --border-color: #e5e7eb;
}

/* Dark Mode */
.dark {
  --bg-primary: #111827;
  --bg-secondary: #1f2937;
  --text-primary: #f9fafb;
  --text-secondary: #d1d5db;
  --border-color: #374151;
}

/* High Contrast Mode (Accessibility) */
.high-contrast {
  --text-primary: #000000;
  --bg-primary: #ffffff;
  --border-color: #000000;
  --border-width: 2px;
}
```

---

## Tailwind CSS Configuration

### Extended Configuration

```javascript
// tailwind.config.js
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './pages/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  
  theme: {
    extend: {
      // Custom Spacing Scale
      spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
      },
      
      // Custom Font Family
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        heading: ['Poppins', 'system-ui', 'sans-serif'],
        mono: ['Fira Code', 'monospace'],
      },
      
      // Custom Font Sizes
      fontSize: {
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '24px' }],
        lg: ['18px', { lineHeight: '28px' }],
        xl: ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
      },
      
      // Custom Border Radius
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        full: '9999px',
      },
      
      // Custom Shadows
      boxShadow: {
        xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        elevation: '0 20px 25px -5px rgba(0, 0, 0, 0.15)',
      },
      
      // Custom Animations
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in',
        'slide-up': 'slideUp 0.4s ease-out',
        'bounce-gentle': 'bounceGentle 1s infinite',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        bounceGentle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
  ],
};
```

### PostCSS Configuration

```javascript
// postcss.config.js
module.exports = {
  plugins: {
    'postcss-import': {},
    'tailwindcss/nesting': {},
    tailwindcss: {},
    autoprefixer: {},
    'postcss-preset-env': {
      stage: 3,
      features: {
        'custom-properties': false,
      },
    },
  },
};
```

---

## Social Networking Implementation

### Feature Requirements Analysis

#### 1. My Network Hub (/network)

**Priority:** HIGH (Fixes broken link)

**Features to Build:**

```
My Network Page Structure
├── Connection Requests
│   ├── Pending requests (Accept/Ignore)
│   ├── Request notification badge
│   └── Request history
├── My Connections
│   ├── Searchable friend list
│   ├── Filter by role (Mentor, Peer, Professional)
│   ├── Quick actions (Message, Remove)
│   └── Connection strength indicator
└── Suggestions
    ├── People you may know
    ├── Based on: skills, location, interests
    ├── Mutual connections indicator
    └── Quick connect button
```

**Database Schema Changes:**

```javascript
// Connection Model
const ConnectionSchema = {
  _id: ObjectId,
  userId: ObjectId,              // Initiator
  connectedUserId: ObjectId,     // Target
  status: 'pending' | 'accepted' | 'rejected',
  connectionType: 'mentor' | 'peer' | 'professional',
  initiatedAt: Date,
  acceptedAt: Date,
  removedAt: Date,
  strength: 0-100,               // Based on interactions
};

// ConnectionRequest Model
const ConnectionRequestSchema = {
  _id: ObjectId,
  from: ObjectId,
  to: ObjectId,
  message: String,
  status: 'pending' | 'accepted' | 'rejected',
  createdAt: Date,
  respondedAt: Date,
  expiresAt: Date,               // Auto-delete after 30 days
};
```

**API Endpoints:**

```
GET    /api/v1/network/connections              # List connections
GET    /api/v1/network/requests                 # Pending requests
POST   /api/v1/network/requests/:userId         # Send connection request
PATCH  /api/v1/network/requests/:requestId      # Accept/reject
DELETE /api/v1/network/connections/:connId     # Remove connection
GET    /api/v1/network/suggestions              # People you may know
```

---

#### 2. Public User Profile (/profile/[id])

**Priority:** CRITICAL (Identity)

**Profile Structure:**

```
User Profile Page
├── Header Section
│   ├── Banner image (editable for own profile)
│   ├── Profile photo (circular avatar)
│   ├── User name & headline
│   ├── Location badge
│   ├── Recovery milestone (e.g., "180 days sober")
│   └── Action buttons (Connect, Message, Share)
├── About Section
│   ├── Bio/Story summary (max 500 chars)
│   ├── Interests/Tags (Recovery, Mentorship, etc.)
│   ├── Contact preferences (What they want to hear)
│   └── Availability status
├── Activity Section
│   ├── Recent stories shared (3 latest)
│   ├── Recent comments
│   ├── Connection anniversaries
│   └── Milestone badges
├── Experience Section (for Mentors)
│   ├── Mentorship style
│   ├── Years in recovery
│   ├── Specializations
│   ├── Availability hours
│   └── Mentee reviews/ratings
└── Sidebar
    ├── Mutual connections
    ├── Quick stats
    ├── Similar profiles
    └── Report user option
```

**Database Schema Changes:**

```javascript
// Extended User Model
const UserSchema = {
  // ... existing fields ...
  profile: {
    bio: String,                   // 500 char limit
    headline: String,              // "Mentor" / "In Recovery" / etc
    bannerImage: String,           // URL
    location: String,
    interests: [String],           // Tags
    skills: [String],
  },
  mentorship: {
    isMentor: Boolean,
    mentorshipStyle: String,       // e.g., "Supportive, Direct"
    yearsInRecovery: Number,
    specializations: [String],
    availability: {
      hoursPerWeek: Number,
      preferredTimes: [String],
    },
    menteeCount: Number,
    averageRating: Number,
  },
  milestones: {
    recoveryDaysCount: Number,
    lastMilestoneReached: Date,
    milestones: [{
      date: Date,
      days: Number,
      title: String,
    }],
  },
  stats: {
    storiesCount: Number,
    commentsCount: Number,
    connectionsCount: Number,
    menteesCount: Number,
  },
};
```

**API Endpoints:**

```
GET    /api/v1/profile/:userId                  # Get public profile
PATCH  /api/v1/profile                          # Update own profile
GET    /api/v1/profile/:userId/activity         # User's activity feed
GET    /api/v1/profile/:userId/mentees          # Mentor's mentees (if mentor)
POST   /api/v1/profile/:userId/report           # Report user
```

---

#### 3. Activate Social Feed (/social)

**Priority:** MEDIUM (Engagement)

**Current Issue:** Static hardcoded data (Sarah Chen post example)

**Solution:**

```
Dynamic Social Feed Features
├── Create Post
│   ├── Text input with placeholder
│   ├── Image/media upload
│   ├── Emotion/mood selector
│   ├── Share scope (Public, Connections, Just mentors)
│   └── Post button with validation
├── Feed View
│   ├── Algorithm: Recent + Popular + From connections
│   ├── Story cards with:
│   │   ├── Author avatar & name
│   │   ├── Post content & media
│   │   ├── Timestamp
│   │   ├── Like/comment/share buttons
│   │   ├── Like count, comment preview
│   │   └── Comment input field
│   └── Infinite scroll / Pagination
└── Interactions
    ├── Like/unlike (real-time count update)
    ├── Add comment (with @mentions)
    ├── Share post (with social platforms)
    └── React with emoji
```

**API Endpoints:**

```
GET    /api/v1/social/feed                      # Get feed (algo ordered)
POST   /api/v1/social/posts                     # Create post
GET    /api/v1/social/posts/:postId             # Get single post
DELETE /api/v1/social/posts/:postId             # Delete post
POST   /api/v1/social/posts/:postId/like        # Like post
DELETE /api/v1/social/posts/:postId/like        # Unlike post
POST   /api/v1/social/posts/:postId/comments    # Add comment
DELETE /api/v1/social/comments/:commentId       # Delete comment
POST   /api/v1/social/posts/:postId/share       # Share externally
```

**Database Schema:**

```javascript
// Post Model
const PostSchema = {
  _id: ObjectId,
  author: ObjectId,              # User who posted
  content: String,
  media: [{
    url: String,
    type: 'image' | 'video',
    alt: String,
  }],
  scope: 'public' | 'connections' | 'mentors',
  mood: String,                  # "Hopeful", "Grateful", etc
  likes: [ObjectId],
  comments: [{
    _id: ObjectId,
    author: ObjectId,
    content: String,
    createdAt: Date,
    likes: [ObjectId],
  }],
  shares: [{
    platform: 'facebook' | 'instagram' | 'whatsapp',
    sharedAt: Date,
  }],
  createdAt: Date,
  updatedAt: Date,
};
```

---

#### 4. Deepen Community Groups (/community/groups/[id])

**Priority:** LOW (Growth)

**Group Features:**

```
Group Details Page
├── Group Header
│   ├── Group banner & logo
│   ├── Group name & description
│   ├── Member count
│   ├── Join/Leave button
│   └── Moderator badge (if mod)
├── Group Feed
│   ├── Posts specific to group
│   ├── Share scope enforced (Group members only)
│   └── Group rules pinned at top
├── Events
│   ├── Group calendar
│   ├── Upcoming events
│   ├── Event RSVPs
│   └── Recurring events
└── Members List
    ├── Searchable list
    ├── Role badges (Admin, Moderator, Member)
    ├── Quick message button
    └── Invite button
```

**Group Types:**

- Women in Recovery
- LGBTQ+ Support Circle
- Family Healing
- Young Adults (18-25)
- Spiritual Growth
- Career Transition
- Location-based groups

---

## Feature Gap Analysis

### Current Issues

| Feature | Status | Issue | Severity | Fix Complexity |
|---------|--------|-------|----------|-----------------|
| Social Feed | 🟡 Partial | Hardcoded demo data | Medium | Low |
| Community | 🟡 Partial | Visual mockup only | Medium | Low |
| My Network | 🔴 Missing | 404 error | High | Medium |
| User Profile | 🔴 Missing | No public profiles | High | Medium |
| Mentorship | 🟢 Planned | Backend ready | Low | High |
| Connections | 🟡 Partial | Backend only | Medium | Medium |
| Analytics | 🟡 Partial | Basic charts only | Low | Low |

### Implementation Priority Matrix

```
IMPACT
  ^
  │ HIGH    │  My Network  │  User Profile
  │         │  (High)      │  (Critical)
  │ MEDIUM  │  Community   │  Social Feed
  │         │  Groups      │  (Medium)
  │ LOW     │  Mentorship  │  Analytics
  │         │  Matching    │  Charts
  └────────────────────────────────────────> EFFORT
            LOW          HIGH
```

---

## Phase-by-Phase Implementation

### Phase 1: Quick Wins (Weeks 1-2)

#### 1.1 Activate Social Feed

**Files to Create/Modify:**

```
Frontend Changes:
├── src/pages/social/index.tsx          (Convert static to dynamic)
├── src/pages/social/create-post.tsx    (New post creation)
├── src/components/SocialFeed.tsx       (Feed component)
├── src/components/PostCard.tsx         (Individual post)
├── src/services/socialService.ts       (API calls)
└── src/styles/social.css               (Styling)

Backend Changes:
├── src/server/models/Post.ts           (Create Post schema)
├── src/server/controllers/socialController.ts
├── src/server/routes/v1/social.ts      (Update routes)
└── src/server/services/socialService.ts
```

**Implementation Steps:**

```bash
# Backend
1. Create Post model with validation
2. Implement POST /api/v1/social/posts endpoint
3. Add GET /api/v1/social/feed with algorithm
4. Add like/comment endpoints
5. Test with Postman

# Frontend
1. Replace static data with API calls
2. Add post creation form
3. Implement real-time updates
4. Add optimistic UI updates
5. Handle errors gracefully
```

#### 1.2 Fix Community Page

**Changes:**

```
├── Community page now shows real group data
├── Group cards are clickable → /community/groups/[id]
├── Join Group button actually joins (backend)
├── Member count updates dynamically
└── Group listing shows only available groups
```

**Database Schema Addition:**

```javascript
// Group Model
const GroupSchema = {
  _id: ObjectId,
  name: String,
  description: String,
  icon: String,                 // URL
  memberCount: Number,
  members: [ObjectId],          # Array of user IDs
  admins: [ObjectId],
  moderators: [ObjectId],
  category: String,             # "Women", "LGBTQ+", "YoA", etc
  createdAt: Date,
};
```

---

### Phase 2: Social Networking Foundations (Weeks 3-4)

#### 2.1 Implement My Network Hub

**Component Structure:**

```javascript
// src/pages/network/index.tsx
export const NetworkHub = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* Connection Requests */}
      <ConnectionRequests />
      
      {/* My Connections */}
      <MyConnections />
      
      {/* Suggestions */}
      <Suggestions />
    </div>
  );
};
```

**Sub-components:**

```
src/components/network/
├── ConnectionRequests.tsx      # Pending requests
├── MyConnections.tsx           # Current connections
├── ConnectionCard.tsx          # Individual connection card
├── Suggestions.tsx             # People you may know
└── SuggestionCard.tsx          # Individual suggestion
```

**Key Features:**

- Search connections by name
- Filter by connection type
- Quick actions (Message, Remove)
- Notification badge for requests
- Connection strength score

---

#### 2.2 Build User Profile Pages

**Route Structure:**

```
/profile                        # Current user's profile (redirect to /profile/me)
/profile/me                     # Edit own profile
/profile/[userId]               # View other users' profiles
/profile/[userId]/activity      # User's activity feed
```

**Components:**

```
src/pages/profile/
├── [id].tsx                    # View profile
├── edit.tsx                    # Edit profile (own)
└── activity.tsx                # User activity feed

src/components/profile/
├── ProfileHeader.tsx           # Banner, avatar, basic info
├── ProfileAbout.tsx            # Bio, interests, skills
├── ProfileActivity.tsx         # Recent posts, comments
├── ProfileExperience.tsx       # For mentors
├── MutualConnections.tsx       # Shared connections
└── ProfileActions.tsx          # Connect, Message buttons
```

**Styling Considerations:**

```css
/* Profile Header */
.profile-header {
  position: relative;
  margin-bottom: -40px;
}

.profile-banner {
  height: 200px;
  background: linear-gradient(135deg, #10b981, #3b82f6);
  border-radius: 0;
}

.profile-avatar {
  position: absolute;
  bottom: -20px;
  left: 24px;
  width: 120px;
  height: 120px;
  border: 4px solid white;
  border-radius: 50%;
  box-shadow: 0 10px 25px rgba(0,0,0,0.1);
}

/* Profile Info Card */
.profile-info {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-top: 20px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.profile-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.profile-stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #10b981;
}

.profile-stat-label {
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
```

---

### Phase 3: Enhanced Social Features (Weeks 5-6)

#### 3.1 Mentorship Matching System

**Mentorship Model:**

```javascript
const MentorshipSchema = {
  _id: ObjectId,
  mentor: ObjectId,
  mentee: ObjectId,
  status: 'pending' | 'active' | 'completed',
  goals: [String],              # Mentee's goals
  startDate: Date,
  endDate: Date,
  meetings: [{
    date: Date,
    duration: Number,           # minutes
    notes: String,
    rating: 1-5,
  }],
  rating: Number,
  review: String,
};

const MentorshipRequestSchema = {
  _id: ObjectId,
  mentee: ObjectId,
  mentor: ObjectId,
  message: String,
  goals: [String],
  status: 'pending' | 'accepted' | 'rejected',
  createdAt: Date,
  respondedAt: Date,
};
```

**Features:**

```
Mentor Discovery
├── Browse mentor profiles
├── Filter by specialization
├── View availability
├── Read reviews
└── Send mentorship request

Mentor Dashboard
├── Active mentees
├── Pending requests
├── Schedule meetings
├── Track progress
└── Provide feedback

Mentee Dashboard
├── My mentor
├── Meeting history
├── Progress tracking
├── Request resources
└── Rate mentor
```

---

#### 3.2 Advanced Connectivity Features

**Real-time Notifications:**

```javascript
// Socket.io integration for real-time updates
import io from 'socket.io-client';

const socket = io(process.env.REACT_APP_API_URL);

// Connection accepted
socket.on('connection-accepted', (data) => {
  showNotification(`${data.userName} accepted your connection request!`);
  refreshConnections();
});

// New message
socket.on('new-message', (data) => {
  showNotification(`New message from ${data.senderName}`);
});

// Profile viewed
socket.on('profile-viewed', (data) => {
  showNotification(`${data.userName} viewed your profile`);
});
```

**Privacy Controls:**

```javascript
// User privacy settings
const PrivacySettingsSchema = {
  _id: ObjectId,
  userId: ObjectId,
  visibility: 'public' | 'connections-only' | 'private',
  allowMessages: 'anyone' | 'connections' | 'none',
  allowMentorRequests: boolean,
  showConnectionList: boolean,
  showActivityFeed: boolean,
  blockList: [ObjectId],
};
```

---

## Component Library Standards

### Button Component

```javascript
// src/components/Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  state?: 'idle' | 'loading' | 'disabled';
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  state = 'idle',
  icon,
  children,
  ...props
}) => {
  const baseClasses = 'font-medium rounded-lg transition-colors';
  
  const variantClasses = {
    primary: 'bg-manake-600 text-white hover:bg-manake-700 active:bg-manake-800',
    secondary: 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200 active:bg-neutral-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    ghost: 'text-neutral-600 hover:bg-neutral-100 active:bg-neutral-200',
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]}`}
      disabled={state !== 'idle'}
      {...props}
    >
      {state === 'loading' && <Spinner />}
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};
```

### Card Component

```javascript
// src/components/Card.tsx
interface CardProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  hoverable?: boolean;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = 'elevated',
  hoverable = false,
  children,
}) => {
  const baseClasses = 'rounded-lg p-6';
  
  const variantClasses = {
    elevated: 'bg-white shadow-md',
    outlined: 'bg-white border border-neutral-200',
    filled: 'bg-neutral-50',
  };
  
  const hoverClasses = hoverable
    ? 'transition-all cursor-pointer hover:shadow-lg hover:-translate-y-1'
    : '';
  
  return (
    <div className={`${baseClasses} ${variantClasses[variant]} ${hoverClasses}`}>
      {children}
    </div>
  );
};
```

### Form Input Component

```javascript
// src/components/Input.tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  ...props
}) => {
  return (
    <div className="flex flex-col gap-2">
      {label && <label className="text-sm font-medium text-neutral-900">{label}</label>}
      
      <div className="relative">
        {icon && <span className="absolute left-3 top-2.5 text-neutral-400">{icon}</span>}
        <input
          className={`
            w-full px-4 py-2 rounded-lg border transition-colors
            ${icon ? 'pl-10' : ''}
            ${error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-100'
              : 'border-neutral-200 focus:border-manake-600 focus:ring-1 focus:ring-manake-100'
            }
            focus:outline-none
          `}
          {...props}
        />
      </div>
      
      {error && <p className="text-sm text-red-600">{error}</p>}
      {helperText && <p className="text-sm text-neutral-500">{helperText}</p>}
    </div>
  );
};
```

---

## Mobile Styling Consistency

### React Native Adaptation

```javascript
// src/styles/theme.native.ts
export const theme = {
  colors: {
    primary: '#10b981',
    secondary: '#f59e0b',
    background: '#ffffff',
    surface: '#f9fafb',
    text: '#1f2937',
    textSecondary: '#6b7280',
    error: '#ef4444',
    success: '#10b981',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
  },
  typography: {
    h1: {
      fontSize: 30,
      fontWeight: '600',
      lineHeight: 36,
    },
    h2: {
      fontSize: 24,
      fontWeight: '600',
      lineHeight: 32,
    },
    body: {
      fontSize: 16,
      fontWeight: '400',
      lineHeight: 24,
    },
    bodySmall: {
      fontSize: 14,
      fontWeight: '400',
      lineHeight: 20,
    },
  },
  borderRadius: {
    sm: 6,
    md: 8,
    lg: 12,
    full: 9999,
  },
};

// src/components.native/Button.native.tsx
import { StyleSheet, TouchableOpacity, Text } from 'react-native';
import { theme } from '../styles/theme.native';

export const Button = ({ variant = 'primary', children, onPress }) => {
  const styles = StyleSheet.create({
    primary: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
    },
    secondary: {
      backgroundColor: theme.colors.surface,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
      borderWidth: 1,
      borderColor: theme.colors.primary,
    },
    text: {
      color: variant === 'primary' ? '#ffffff' : theme.colors.primary,
      fontWeight: '600',
      fontSize: 16,
    },
  });

  return (
    <TouchableOpacity style={styles[variant]} onPress={onPress}>
      <Text style={styles.text}>{children}</Text>
    </TouchableOpacity>
  );
};
```

---

## Accessibility & Theming

### WCAG 2.1 Compliance

```css
/* Color Contrast Ratios */
.text-primary {
  color: #1f2937;        /* 12.6:1 contrast with white bg */
}

.text-secondary {
  color: #6b7280;        /* 7.3:1 contrast with white bg */
}

.btn-primary {
  background: #10b981;   /* 3.2:1 contrast with white text */
  color: #ffffff;
}

/* Focus States for Keyboard Navigation */
button:focus-visible {
  outline: 3px solid #3b82f6;
  outline-offset: 2px;
}

input:focus-visible {
  border-color: #3b82f6;
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* High Contrast Mode */
@media (prefers-contrast: more) {
  .text-primary {
    color: #000000;
  }
  
  .text-secondary {
    color: #000000;
  }
  
  button {
    border: 2px solid currentColor;
  }
}
```

### Dark Mode Implementation

```javascript
// src/hooks/useDarkMode.ts
import { useState, useEffect } from 'react';

export const useDarkMode = () => {
  const [isDark, setIsDark] = useState(() => {
    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [isDark]);

  return [isDark, setIsDark] as const;
};

// src/components/ThemeToggle.tsx
export const ThemeToggle = () => {
  const [isDark, setIsDark] = useDarkMode();
  
  return (
    <button
      onClick={() => setIsDark(!isDark)}
      aria-label="Toggle dark mode"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  );
};
```

### Screen Reader Optimization

```javascript
// Example: Accessible Story Card
<article
  className="story-card"
  aria-label={`Story: ${story.title} by ${story.author.name}`}
>
  <img
    src={story.image}
    alt={`Story illustration: ${story.title}`}
    className="w-full h-48 object-cover rounded-t-lg"
  />
  
  <div className="p-6">
    <h2 className="text-2xl font-bold mb-2">
      {story.title}
    </h2>
    
    <p className="text-neutral-600 mb-4">
      By <strong>{story.author.name}</strong>
    </p>
    
    <p className="text-neutral-700 mb-6">
      {story.excerpt}
    </p>
    
    <div className="flex gap-4 items-center">
      <button
        aria-label={`Like story: ${story.title} (${story.likes} likes)`}
        onClick={handleLike}
      >
        ❤️ {story.likes}
      </button>
      
      <button
        aria-label={`Read full story: ${story.title}`}
        className="btn btn-primary"
      >
        Read More
      </button>
    </div>
  </div>
</article>
```

---

## Quick Implementation Checklist

### Week 1: Setup & Social Feed

- [ ] Update Tailwind configuration with brand colors
- [ ] Create Button, Card, Input components
- [ ] Implement Post model in MongoDB
- [ ] Create POST /api/v1/social/posts endpoint
- [ ] Build social feed page with real data
- [ ] Add post creation form
- [ ] Test API endpoints

### Week 2: Community & Groups

- [ ] Create Group model
- [ ] Implement group management endpoints
- [ ] Build group detail pages
- [ ] Add group feed specific to members
- [ ] Implement join/leave functionality

### Week 3-4: My Network

- [ ] Create Connection and ConnectionRequest models
- [ ] Implement network API endpoints
- [ ] Build connection requests UI
- [ ] Build my connections UI
- [ ] Add people suggestions algorithm

### Week 5-6: User Profiles

- [ ] Extend User model with profile fields
- [ ] Create user profile endpoints
- [ ] Build public profile page
- [ ] Add profile edit functionality
- [ ] Implement profile activity feed

### Week 7+: Advanced Features

- [ ] Mentorship matching
- [ ] Real-time notifications
- [ ] Privacy controls
- [ ] Analytics dashboard
- [ ] Performance optimization

---

## Deployment Considerations

### Environment Variables

```bash
# .env.example
REACT_APP_API_URL=http://localhost:5000
REACT_APP_ENV=development

# Styling
TAILWIND_MODE=watch

# Features
REACT_APP_SOCIAL_ENABLED=true
REACT_APP_MENTORSHIP_ENABLED=true
REACT_APP_DARK_MODE_ENABLED=true
```

### Build Optimization

```javascript
// vite.config.ts - Image optimization
import imagemin from 'vite-plugin-imagemin';

export default {
  plugins: [
    imagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
      pngquant: {
        quality: [0.8, 0.9],
        speed: 4,
      },
    }),
  ],
};
```

---

## Success Metrics

### User Engagement
- Daily Active Users (DAU) growth
- Time spent on social features
- Connection requests sent/accepted
- Post creation rate

### Feature Adoption
- % of users with profile photo
- % of users with bio/headline
- % of users with connections
- % of users creating posts

### Technical
- Page load time < 2s
- API response time < 200ms
- 99.9% uptime
- Lighthouse score > 90

---

## Additional Resources

### Documentation
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Best Practices](https://react.dev/learn)
- [MongoDB Schema Design](https://www.mongodb.com/docs/manual/core/data-model-design/)
- [Accessibility WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)

### Recommended Tools
- **Design System:** Storybook
- **Component Testing:** Chromatic
- **A/B Testing:** LaunchDarkly
- **Analytics:** Mixpanel or Amplitude
- **Monitoring:** Sentry

### Team Resources
- Design handoff: Figma
- Code reviews: GitHub PR template
- Monitoring: Datadog/New Relic dashboard
- Alerts: Slack integration

---

## Conclusion

The Manake platform is positioned for social networking expansion. By following this roadmap, you can:

✅ Fix broken links (/network, /profile)
✅ Activate static content with dynamic data
✅ Build genuine social networking capabilities
✅ Establish consistent design system
✅ Create accessible, scalable UI patterns
✅ Support the healing journey through connection

**Next Step:** Start Phase 1 (Quick Wins) and activate the social feed. This will immediately improve user engagement and provide foundation for deeper networking features.

---

**Document Version:** 2.1  
**Created:** January 2026  
**Status:** Ready for Development  
**Questions?** Refer to the Manake Roadmap.md for detailed 200-step implementation guide