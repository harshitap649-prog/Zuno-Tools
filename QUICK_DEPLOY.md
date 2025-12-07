# Quick Deploy Checklist

Follow these steps to get your site live on Netlify:

## ✅ Pre-Deployment Checklist

- [ ] Code is working locally (`npm run dev`)
- [ ] All files are saved
- [ ] No console errors

## 🚀 Deployment Steps

### 1. GitHub Setup (5 minutes)

```bash
# If git is not initialized
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Add GitHub remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/zuno-tools.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**Create GitHub repo first at:** https://github.com/new

### 2. Netlify Setup (3 minutes)

1. Go to [netlify.com](https://netlify.com)
2. Sign up/Login with GitHub
3. Click **"Add new site"** → **"Import an existing project"**
4. Select your repository
5. Click **"Deploy site"**
6. Wait 2-5 minutes
7. **Done!** Your site is live 🎉

### 3. Customize (Optional)

- Change site name in Netlify settings
- Add custom domain
- Set up environment variables (if needed)

## 📝 After Deployment

- [ ] Test your live site
- [ ] Check all tools work correctly
- [ ] Test on mobile
- [ ] Share your site URL!

## 🔄 Future Updates

Just push to GitHub:
```bash
git add .
git commit -m "Update description"
git push
```
Netlify auto-deploys! ✨

---

**Need detailed instructions?** See [NETLIFY_DEPLOYMENT.md](./NETLIFY_DEPLOYMENT.md)

