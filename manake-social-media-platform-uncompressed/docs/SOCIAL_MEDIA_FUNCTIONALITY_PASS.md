# Social media functionality enhancement pass

Date: 2026-04-25

## What changed

### 1. Social Media Kit

Added a new public route:

```text
/social-media-kit
```

This page gives Manake stakeholders:

- copy-ready captions for youth/families, donors, partners, and programme awareness
- safe-sharing guardrails
- hashtag bank and CTA ideas
- share buttons for WhatsApp, Facebook, X, LinkedIn, email, native device share, and copy link
- a downloadable sample generated Manake image

### 2. Social Amplifier panel

The `/social` page now includes a futuristic social-command panel above the community feed. It includes:

- pre-approved captions
- one-click social share actions
- weekly content rhythm
- privacy-led safe sharing rules
- a direct link into the full media kit

### 3. Community post sharing

Every community post now has a share tray with:

- native device share where supported
- copy link
- WhatsApp
- Facebook
- X
- LinkedIn
- email
- visible share count

The share tracking endpoint is public and intentionally does not block actual social sharing if analytics fails.

### 4. Backend social/community debugging

Fixed a data-shape mismatch where the community feed backend returned Prisma `id` fields while the frontend expected `_id`. The backend now normalises posts into the frontend-compatible shape:

```ts
{
  _id,
  author: { _id, name, avatar },
  content,
  mediaUrls,
  mediaType,
  likes,
  commentsCount,
  sharesCount,
  createdAt,
  updatedAt
}
```

Added input hardening for community posts:

- trims post content
- rejects empty posts
- caps post content at 1,200 characters
- filters media URLs to HTTP/HTTPS URLs
- caps media URLs at 4 items
- restricts media type to `image`, `video`, or `none`

### 5. SEO/social previews

Updated `index.html` social preview metadata for Netlify deployment:

- canonical URL now points to `https://manake.netlify.app/`
- Open Graph image uses a generated Manake image
- X/Twitter card tags use `summary_large_image`
- theme colour now aligns with the futuristic Manake blue palette

### 6. AI Guide update

The floating AI Guide now understands social media/media-kit questions and links stakeholders to the new media kit.

## New/modified files

```text
manake-web/src/components/social/SocialShareTray.tsx
manake-web/src/components/social/SocialAmplifierPanel.tsx
manake-web/src/pages/SocialMediaKitPage.tsx
manake-web/src/utils/socialShare.ts
manake-web/src/pages/SocialPage.tsx
manake-web/src/components/social/CommunityPostCard.tsx
manake-web/src/services/postService.ts
manake-web/src/server/controllers/internalSocialController.ts
manake-web/src/server/routes/v1/internalSocial.ts
manake-web/src/components/StakeholderAIButton.tsx
manake-web/src/App.tsx
manake-web/src/components/Navigation.tsx
manake-web/src/components/Footer.tsx
manake-web/src/styles/globals.css
manake-web/index.html
```

## Validation completed

Focused parser/syntax checks passed with esbuild on the new and modified TypeScript/TSX files.

Full `tsc` and full production build were attempted through the available dependency symlink, but the checks did not finish within the container timeout. Run locally or in CI:

```bash
cd manake-web
npm install --legacy-peer-deps
npm run build
npm audit --omit=dev
```

## Deployment notes

After deploying this pass, rebuild Netlify so the new route and metadata are included. If social sign-in is still failing, use `/platform-status` and confirm:

```text
VITE_API_URL=https://<railway-service>.up.railway.app/api
FRONTEND_URL=https://manake.netlify.app
ALLOWED_ORIGINS=https://manake.netlify.app
JWT_SECRET=...
JWT_REFRESH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...
```
