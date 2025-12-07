# Complete Setup: GitHub + Netlify Automatic Deployment

This guide will help you set up automatic deployment from GitHub to Netlify.

## Prerequisites Checklist

- [ ] GitHub account created
- [ ] Netlify account created
- [ ] Git installed on your computer
- [ ] Your code is ready

---

## Part 1: Set Up GitHub Repository

### Step 1: Create GitHub Repository

1. Go to [github.com](https://github.com) and sign in
2. Click the **"+"** icon (top right) → **"New repository"**
3. Repository name: `Zuno-Tools` (or `zuno-tools`)
4. Description: "All-in-One Professional Tools Collection"
5. Choose **Public** (required for free Netlify hosting)
6. **DO NOT** check "Initialize with README" (you already have files)
7. Click **"Create repository"**

### Step 2: Connect Your Local Code to GitHub

**Option A: If you haven't initialized Git yet:**

```bash
# Initialize Git
git init

# Add all files
git add .

# Create first commit
git commit -m "Initial commit: Zuno Tools"

# Add GitHub as remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/Zuno-Tools.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

**Option B: If Git is already initialized:**

```bash
# Check current remote
git remote -v

# If no remote exists, add it:
git remote add origin https://github.com/YOUR_USERNAME/Zuno-Tools.git

# If remote exists but wrong URL, update it:
git remote set-url origin https://github.com/YOUR_USERNAME/Zuno-Tools.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Note:** If asked for credentials:
- Use a **Personal Access Token** (not password)
- Create token: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
- Give it `repo` permissions
- Use the token as your password

---

## Part 2: Connect GitHub to Netlify

### Step 1: Sign Up / Login to Netlify

1. Go to [netlify.com](https://netlify.com)
2. Click **"Sign up"** or **"Log in"**
3. Choose **"Sign up with GitHub"** (recommended - enables automatic deployment)

### Step 2: Import Your Repository

1. Once logged in, click **"Add new site"** → **"Import an existing project"**
2. Click **"Deploy with GitHub"**
3. Authorize Netlify to access your GitHub repositories
4. Select your **Zuno-Tools** repository from the list

### Step 3: Configure Build Settings

Netlify should auto-detect Next.js, but verify:

- **Build command:** `npm install && npm run build`
- **Publish directory:** Leave empty (handled by Next.js plugin)
- **Base directory:** Leave empty

**Important:** Your `netlify.toml` file already has the correct settings, so Netlify will use those automatically.

### Step 4: Deploy!

1. Click **"Deploy site"**
2. Wait 2-5 minutes
3. Your site will be live! 🎉

---

## Part 3: Verify Automatic Deployment

### Test Automatic Deployment:

1. Make a small change to any file (e.g., update README.md)
2. Run these commands:
   ```bash
   git add .
   git commit -m "Test: Verify automatic deployment"
   git push
   ```
3. Go to your Netlify dashboard
4. You should see a new deployment starting automatically
5. Wait 2-5 minutes for it to complete

**Success!** If the deployment completes, automatic deployment is working! ✅

---

## Part 4: Quick Deployment Commands

### Using the Deployment Script (Windows):

```bash
# Run the deployment script
deploy.bat
```

### Manual Deployment:

```bash
# Add all changes
git add .

# Commit
git commit -m "Your commit message"

# Push to GitHub (triggers Netlify auto-deploy)
git push
```

---

## Troubleshooting

### Issue: "Repository not found" when pushing

**Solution:**
- Verify the repository name matches exactly
- Check you have push access to the repository
- Use Personal Access Token instead of password

### Issue: Netlify can't find the repository

**Solution:**
1. Go to Netlify dashboard
2. Site settings → Build & deploy → Continuous Deployment
3. Click "Link to a different repository"
4. Re-authorize and select your repository

### Issue: Build still failing

**Solution:**
1. Check build logs in Netlify dashboard
2. Look for specific error messages
3. Test build locally first: `npm run build`
4. Fix any errors before pushing

### Issue: Changes not deploying automatically

**Solution:**
1. Verify Netlify is connected to GitHub:
   - Site settings → Build & deploy → Continuous Deployment
   - Should show your GitHub repository
2. Check GitHub webhook:
   - GitHub repository → Settings → Webhooks
   - Should show Netlify webhook
3. Try manual deploy:
   - Netlify dashboard → Deploys → Trigger deploy

---

## Quick Reference

### Your Site URLs:
- **Netlify Dashboard:** https://app.netlify.com/projects/zunootools
- **Live Site:** Check your Netlify dashboard for the URL (e.g., `https://zunootools.netlify.app`)

### Important Files:
- `netlify.toml` - Netlify build configuration
- `.gitignore` - Files to exclude from Git
- `package.json` - Dependencies and scripts

### Common Commands:
```bash
# Check Git status
git status

# Add all changes
git add .

# Commit changes
git commit -m "Your message"

# Push to GitHub (triggers Netlify deploy)
git push

# Check remote repository
git remote -v
```

---

## Next Steps After Setup

1. ✅ **Customize Site Name:**
   - Netlify dashboard → Site settings → General → Change site name

2. ✅ **Add Custom Domain (Optional):**
   - Site settings → Domain management → Add custom domain

3. ✅ **Set Up Environment Variables (If Needed):**
   - Site settings → Environment variables

4. ✅ **Monitor Deployments:**
   - Check Netlify dashboard for deployment status
   - Each push to GitHub triggers a new deployment

---

## Summary

✅ **GitHub Setup:** Repository created and code pushed  
✅ **Netlify Setup:** Site connected to GitHub repository  
✅ **Automatic Deployment:** Every `git push` triggers Netlify build  
✅ **Live Site:** Your site is now accessible on the internet!

**Your workflow:**
1. Make changes to your code
2. Run `git add . && git commit -m "message" && git push`
3. Netlify automatically builds and deploys
4. Site updates in 2-5 minutes! 🚀

---

## Need Help?

- **Netlify Docs:** https://docs.netlify.com
- **GitHub Docs:** https://docs.github.com
- **Next.js Deployment:** https://nextjs.org/docs/deployment

