# Deployment Guide for Zuno Tools

This guide will help you deploy your Zuno Tools application to make it live on the internet.

## Option 1: Deploy to Vercel (Recommended - Easiest)

Vercel is made by the creators of Next.js and offers the best experience for Next.js apps.

### Steps:

1. **Push your code to GitHub:**
   ```bash
   # Create a new repository on GitHub (github.com/new)
   # Then run these commands:
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git branch -M main
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Sign up/Login with your GitHub account
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will automatically detect Next.js
   - Click "Deploy"
   - Your site will be live in 2-3 minutes!

3. **Custom Domain (Optional):**
   - In your Vercel project settings, go to "Domains"
   - Add your custom domain

## Option 2: Deploy to Netlify

### Steps:

1. **Push to GitHub** (same as above)

2. **Deploy to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Sign up/Login with GitHub
   - Click "Add new site" → "Import an existing project"
   - Select your repository
   - Build settings:
     - Build command: `npm run build`
     - Publish directory: `.next`
   - Click "Deploy site"

## Option 3: Deploy to GitHub Pages (Static Export)

For GitHub Pages, you need to export your Next.js app as static files.

### Steps:

1. **Update next.config.js:**
   ```javascript
   /** @type {import('next').NextConfig} */
   const nextConfig = {
     output: 'export',
     reactStrictMode: true,
     images: {
       unoptimized: true,
     },
     // ... rest of config
   }
   ```

2. **Build and deploy:**
   ```bash
   npm run build
   # This creates an 'out' folder
   ```

3. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for GitHub Pages"
   git push
   ```

4. **Enable GitHub Pages:**
   - Go to your repository on GitHub
   - Settings → Pages
   - Source: Deploy from a branch
   - Branch: main, folder: /out
   - Save

## Option 4: Deploy to Other Platforms

### Railway:
- Push to GitHub
- Connect repository on [railway.app](https://railway.app)
- Auto-detects Next.js

### Render:
- Push to GitHub
- Create new Web Service on [render.com](https://render.com)
- Connect repository
- Build command: `npm install && npm run build`
- Start command: `npm start`

## Environment Variables

If you add any API keys or environment variables later:
- **Vercel**: Project Settings → Environment Variables
- **Netlify**: Site Settings → Environment Variables
- **GitHub Pages**: Not recommended for env vars (use static config)

## Post-Deployment Checklist

- [ ] Test all major features
- [ ] Check mobile responsiveness
- [ ] Verify images load correctly
- [ ] Test file uploads/downloads
- [ ] Check console for errors
- [ ] Set up custom domain (optional)
- [ ] Enable HTTPS (automatic on most platforms)

## Troubleshooting

### Build Errors:
- Make sure all dependencies are in `package.json`
- Check Node.js version (should be 18+)
- Review build logs for specific errors

### Image Issues:
- Some platforms require `images.unoptimized: true` in next.config.js
- Check image domains in next.config.js

### API Issues:
- Ensure external APIs allow your domain
- Check CORS settings if needed

## Need Help?

- Vercel Docs: https://vercel.com/docs
- Netlify Docs: https://docs.netlify.com
- Next.js Deployment: https://nextjs.org/docs/deployment

