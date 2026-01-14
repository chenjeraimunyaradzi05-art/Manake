# Netlify Deployment Guide

Your project is configured for full-stack deployment on Netlify (React Frontend + Express Backend via Serverless Functions).

## 1. Connect Repository
1. Log in to [Netlify Dashboard](https://app.netlify.com).
2. Click **"Add new site"** -> **"Import from Git"**.
3. Choose **GitHub**.
4. Select repository: `chenjeraimunyaradzi05-art/Manake`.

## 2. Verify Build Settings
Netlify will auto-read `netlify.toml`, so these should be pre-filled:
- **Build Command:** `npm run build`
- **Publish Directory:** `dist`

## 3. Environment Variables
You MUST set these in **Site Settings > Environment Variables** for the app to work.

| Key | Value | Note |
|-----|-------|------|
| `NODE_ENV` | `production` | |
| `VITE_API_URL` | `/api` | Relies on `netlify.toml` redirects |
| `MONGODB_URI` | *(Your Mongo Atlas URI)* | Copy from local `.env` |
| `JWT_SECRET` | *(Create a long random string)* | Secure logic |
| `JWT_ACCESS_EXPIRATION`| `15m` | |
| `JWT_REFRESH_EXPIRATION` | `7d` | |
| `FRONTEND_URL` | *(Your Netlify Site URL)* | e.g. `https://manake.netlify.app` |

**Note on FRONTEND_URL:** Since you don't know your URL until you create the site, you can set it to `http://localhost:5173` temporarily, or just create the site, grab the URL, and then update this variable.

## 4. Troubleshooting
- **Build Fails?** Check the "Deploy Log".
- **API Errors?** Check the "Functions" tab > "api" logs.
