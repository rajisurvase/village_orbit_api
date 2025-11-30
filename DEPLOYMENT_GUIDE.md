# Automatic Update Notification System - Deployment Guide

## Overview
This system automatically detects when you deploy new changes and notifies users to refresh their browser.

## How It Works

1. **Service Worker Detection**: Uses PWA service worker to detect new app versions
2. **Update Check Interval**: Checks for updates every 60 seconds
3. **User Notification**: Shows a toast notification when updates are detected
4. **One-Click Refresh**: Users can click "Refresh Now" to get the latest version

## What Triggers Notifications

The system detects updates when you:
- Update images or media files
- Add/edit news or announcements
- Modify scroller cards
- Change any text content
- Update styling or layouts
- Make any code changes

## Deployment Steps for Vercel

### Initial Setup (One-Time)

1. **Ensure your project is connected to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Import your project if not already connected

2. **Configure Build Settings** (usually auto-detected)
   - Build Command: `npm run build` or `bun run build`
   - Output Directory: `dist`
   - Install Command: `npm install` or `bun install`

### Every Time You Make Changes

1. **Commit your changes**
   ```bash
   git add .
   git commit -m "Update: [describe your changes]"
   git push origin main
   ```

2. **Automatic Deployment**
   - Vercel automatically deploys when you push to your main branch
   - Wait for deployment to complete (usually 1-2 minutes)

3. **Users Get Notified**
   - Active users will see the update notification within 60 seconds
   - They can click "Refresh Now" to see your changes immediately

## How Users See Updates

When you deploy:
1. Users browsing the site will see a toast notification
2. Message: "New update available — Content has been updated!"
3. Description: "Refresh to see the latest changes including images, news, and updates."
4. Action button: "Refresh Now" with a refresh icon
5. Clicking the button reloads the page with the latest version

## Manual Deployment (Alternative)

If you prefer manual deployment:

1. **Via Vercel Dashboard**
   - Go to your project in Vercel
   - Click "Deployments" tab
   - Click "Redeploy" on the latest deployment

2. **Via Vercel CLI**
   ```bash
   vercel --prod
   ```

## Testing the System

1. **Local Testing**
   - Build the project: `npm run build` or `bun run build`
   - Preview build: `npm run preview` or `bun run preview`
   - Open multiple browser tabs to test update detection

2. **Production Testing**
   - Deploy a small change
   - Keep a browser tab open on your site
   - Wait 60 seconds after deployment
   - You should see the update notification

## Troubleshooting

### Users Not Seeing Notifications

1. **Clear Browser Cache**
   - Have users do a hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

2. **Check Service Worker Registration**
   - Open browser DevTools → Application → Service Workers
   - Ensure service worker is registered and active

3. **Verify Deployment**
   - Check Vercel dashboard to ensure deployment succeeded
   - Look for build errors

### Notification Appears Too Often

- The system checks every 60 seconds
- Only shows notification when actual updates are detected
- Not based on time but on service worker version changes

## Technical Details

- **Technology**: PWA Service Worker with vite-plugin-pwa
- **Update Strategy**: Prompt-based (users choose when to update)
- **Check Interval**: 60 seconds
- **Notification UI**: Sonner toast component
- **Mobile & Desktop**: Works on all devices

## Configuration

To modify the update check interval, edit `src/hooks/useServiceWorkerUpdate.tsx`:

```typescript
setInterval(() => {
  registration.update();
}, 60000); // Change 60000 to desired milliseconds
```

## Support

- Update notifications work automatically after deployment
- No additional configuration needed for Vercel
- Compatible with all modern browsers that support Service Workers
