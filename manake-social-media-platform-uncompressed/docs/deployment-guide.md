# Manake Platform - Deployment Guide

**Version:** 1.0.0  
**Date:** January 2026

---

## 📋 Overview

This guide covers deployment procedures for the Manake platform to staging and production environments.

### Environments

| Environment | Branch | URL | Purpose |
|-------------|--------|-----|---------|
| Development | feature/* | localhost | Local development |
| Staging | develop | staging.manake.org.zw | Testing & QA |
| Production | main | manake.org.zw | Live platform |

---

## 🔧 Prerequisites

### Required Accounts & Access
- GitHub repository access
- Netlify account with deployment permissions
- MongoDB Atlas access
- Sentry project access
- Expo account (for mobile builds)

### Environment Variables

Configure these secrets in GitHub repository settings:

```
# Web
VITE_API_URL=https://api.manake.org.zw
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_SENTRY_DSN=https://...@sentry.io/...

# Netlify
NETLIFY_AUTH_TOKEN=...
NETLIFY_STAGING_SITE_ID=...
NETLIFY_PRODUCTION_SITE_ID=...

# Mobile
EXPO_PUBLIC_API_URL=https://api.manake.org.zw
EXPO_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
```

---

## 🚀 Deployment Workflows

### Automatic Deployment (CI/CD)

The GitHub Actions pipeline automatically deploys:

1. **Staging** - Triggered when pushing to `develop` branch
2. **Production** - Triggered when pushing to `main` branch

```bash
# Deploy to staging
git checkout develop
git merge feature/my-feature
git push origin develop
# → Automatically deploys to staging.manake.org.zw

# Deploy to production
git checkout main
git merge develop
git push origin main
# → Automatically deploys to manake.org.zw
```

### Manual Deployment

#### Web (Netlify)

```bash
# Build locally
cd manake-web
npm ci
npm run build

# Deploy using Netlify CLI
npx netlify deploy --prod --dir=dist
```

#### Mobile (Expo/EAS)

```bash
# Build for iOS
cd manake-mobile
eas build --platform ios --profile production

# Build for Android
eas build --platform android --profile production

# Submit to stores
eas submit --platform ios
eas submit --platform android
```

---

## 📦 Pre-Deployment Checklist

### Before Staging Deployment
- [ ] All tests passing locally
- [ ] Feature branch merged to develop
- [ ] No console errors in browser
- [ ] Responsive design verified
- [ ] API endpoints working

### Before Production Deployment
- [ ] Staging tested and approved
- [ ] Security audit clean (`npm audit`)
- [ ] Performance metrics acceptable
- [ ] Stakeholder sign-off received
- [ ] Rollback plan prepared

---

## 🔄 Rollback Procedures

### Web (Netlify)

1. Go to Netlify dashboard → Site → Deploys
2. Find the last working deploy
3. Click "Publish deploy"

Or via CLI:
```bash
netlify rollback
```

### Mobile (App Stores)

For critical issues:
1. iOS: Use TestFlight to distribute a fix
2. Android: Use staged rollout and halt if issues

For non-critical issues:
- Submit a new version with the fix
- Expedite review if possible

---

## 📊 Post-Deployment Verification

### Smoke Tests

Run these checks after every deployment:

1. **Authentication**
   - [ ] Login works
   - [ ] Signup works
   - [ ] Social login works (Google, Apple)
   - [ ] Logout works

2. **Core Features**
   - [ ] Home page loads
   - [ ] Stories list loads
   - [ ] Social feed loads
   - [ ] Profile page loads
   - [ ] Messages work

3. **Performance**
   - [ ] Page load < 3s
   - [ ] No JavaScript errors in console
   - [ ] Images loading correctly

### Monitoring

After deployment, monitor:

1. **Sentry** - Error rates and new issues
2. **Netlify Analytics** - Traffic and performance
3. **MongoDB Atlas** - Database performance

---

## 🔒 Security Considerations

### Secrets Management
- Never commit secrets to the repository
- Use GitHub Secrets for CI/CD
- Rotate API keys periodically
- Use different keys for staging vs production

### Access Control
- Limit production access to authorized personnel
- Use GitHub environment protection rules
- Require approvals for production deploys

---

## 📱 Mobile Release Process

### iOS (App Store)

1. **Build**
   ```bash
   eas build --platform ios --profile production
   ```

2. **Test via TestFlight**
   - Upload build to App Store Connect
   - Distribute to internal testers
   - Fix any issues found

3. **Submit for Review**
   - Prepare screenshots and description
   - Fill out App Review Information
   - Submit for review

### Android (Play Store)

1. **Build**
   ```bash
   eas build --platform android --profile production
   ```

2. **Internal Testing**
   - Upload AAB to Play Console
   - Distribute to internal testers
   - Fix any issues found

3. **Release**
   - Create a production release
   - Use staged rollout (10% → 50% → 100%)
   - Monitor crash reports

---

## 🛠️ Troubleshooting

### Common Issues

**Build fails in CI**
- Check Node.js version matches locally
- Verify all dependencies installed
- Check environment variables set

**Deploy fails to Netlify**
- Verify NETLIFY_AUTH_TOKEN is valid
- Check site ID is correct
- Review Netlify build logs

**Mobile build fails**
- Check Expo credentials
- Verify provisioning profiles (iOS)
- Check keystore configuration (Android)

### Getting Help

1. Check GitHub Actions logs
2. Review Netlify deploy logs
3. Check Sentry for errors
4. Escalate to DevOps team

---

## 📞 Contacts

| Role | Name | Contact |
|------|------|---------|
| DevOps Lead | TBD | devops@manake.org.zw |
| Backend Lead | TBD | backend@manake.org.zw |
| Frontend Lead | TBD | frontend@manake.org.zw |

---

**Last Updated:** January 2026
