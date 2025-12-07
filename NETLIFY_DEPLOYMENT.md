# Complete Guide: Deploy Zuno Tools to Netlify via GitHub

This guide will walk you through deploying your Zuno Tools application to Netlify using GitHub.

## Prerequisites

- A GitHub account
- A Netlify account (free tier works perfectly)
- Git installed on your computer
- Your project code ready

---

## Step 1: Prepare Your Code for GitHub

### 1.1 Initialize Git (if not already done)

Open your terminal in the project directory and run:

```bash
# Check if git is already initialized
git status

# If not initialized, run:
git init
```

### 1.2 Create a GitHub Repository

1. Go to [GitHub.com](https://github.com) and sign in
2. Click the **"+"** icon in the top right → **"New repository"**
3. Repository name: `zuno-tools` (or any name you prefer)
4. Description: "All-in-One Professional Tools Collection"
5. Choose **Public** or **Private** (Public is recommended for free hosting)
6. **DO NOT** initialize with README, .gitignore, or license (you already have these)
7. Click **"Create repository"**

### 1.3 Push Your Code to GitHub

In your terminal, run these commands (replace `YOUR_USERNAME` with your GitHub username):

```bash
# Add all files to git
git add .

# Create your first commit
git commit -m "Initial commit: Zuno Tools application"

# Add GitHub as remote (replace YOUR_USERNAME with your actual GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/zuno-tools.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**Note:** If you're asked for credentials:
- Use a **Personal Access Token** (not your password)
- Create one at: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
- Give it `repo` permissions

---

## Step 2: Deploy to Netlify

### 2.1 Sign Up / Login to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Click **"Sign up"** or **"Log in"**
3. Choose **"Sign up with GitHub"** (recommended - easier integration)

### 2.2 Import Your Repository

1. Once logged in, click **"Add new site"** → **"Import an existing project"**
2. Click **"Deploy with GitHub"**
3. Authorize Netlify to access your GitHub repositories
4. Select your **zuno-tools** repository from the list

### 2.3 Configure Build Settings

Netlify should automatically detect Next.js, but verify these settings:

- **Build command:** `npm install && npm run build`
- **Publish directory:** Leave empty (handled by Next.js plugin)
- **Base directory:** Leave empty (unless your project is in a subfolder)

**Important:** The `netlify.toml` file in your project already has the correct configuration, so Netlify will use those settings automatically.

### 2.4 Deploy!

1. Click **"Deploy site"**
2. Wait 2-5 minutes for the build to complete
3. You'll see a success message with your live URL!

Your site will be live at: `https://random-name-12345.netlify.app` (Netlify generates a random name)

---

## Step 3: Customize Your Site (Optional)

### 3.1 Change Site Name

1. Go to **Site settings** → **General** → **Site details**
2. Click **"Change site name"**
3. Enter your preferred name (e.g., `zuno-tools`)
4. Your new URL will be: `https://zuno-tools.netlify.app`

### 3.2 Add Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain name
4. Follow Netlify's instructions to configure DNS

### 3.3 Environment Variables (If Needed)

If you add API keys or environment variables later:

1. Go to **Site settings** → **Environment variables**
2. Click **"Add variable"**
3. Add your key-value pairs
4. Redeploy your site

---

## Step 4: Continuous Deployment

The best part: **Automatic deployments!**

- Every time you push code to GitHub, Netlify will automatically rebuild and deploy
- You can see deployment status in the Netlify dashboard
- Each deployment gets a unique preview URL for testing

### How to Update Your Site:

```bash
# Make your changes
# ... edit files ...

# Commit changes
git add .
git commit -m "Update: description of changes"

# Push to GitHub
git push

# Netlify automatically deploys! 🚀
```

---

## Troubleshooting

### Build Fails

1. **Check build logs** in Netlify dashboard
2. **Common issues:**
   - Missing dependencies → Check `package.json`
   - Node version mismatch → Already set to Node 18 in `netlify.toml`
   - Build errors → Check console for specific errors

### Site Not Loading

1. Check if deployment succeeded (green checkmark)
2. Clear browser cache
3. Check Netlify status page: [status.netlify.com](https://status.netlify.com)

### Images Not Loading

- The `next.config.js` already has `images.unoptimized: true` which should work on Netlify
- If issues persist, check image paths and domains

### API/External Services Not Working

- Some services may block requests from Netlify domains
- Check CORS settings
- Consider using environment variables for API keys

---

## Quick Reference Commands

```bash
# Check git status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Your commit message"

# Push to GitHub (triggers Netlify auto-deploy)
git push

# Check remote repository
git remote -v
```

---

## Next Steps

✅ Your site is now live on Netlify!
✅ Every GitHub push automatically deploys
✅ You can share your site URL with anyone

### Optional Enhancements:

- [ ] Set up a custom domain
- [ ] Add analytics (Netlify Analytics or Google Analytics)
- [ ] Configure form handling (if you add contact forms)
- [ ] Set up branch previews for testing
- [ ] Add environment variables if needed

---

## Support Resources

- **Netlify Docs:** [docs.netlify.com](https://docs.netlify.com)
- **Next.js Deployment:** [nextjs.org/docs/deployment](https://nextjs.org/docs/deployment)
- **GitHub Docs:** [docs.github.com](https://docs.github.com)

---

## Summary

1. ✅ Push code to GitHub
2. ✅ Connect GitHub to Netlify
3. ✅ Deploy automatically
4. ✅ Site is live!

**Your site URL:** Check your Netlify dashboard for the live URL.

Happy deploying! 🚀

