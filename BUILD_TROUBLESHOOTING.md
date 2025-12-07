# Build Troubleshooting Guide

If your Netlify build is failing, follow these steps:

## Common Issues and Solutions

### 1. Build Fails with Exit Code 2

**Symptoms:** "Build script returned non-zero exit code: 2"

**Solutions:**

#### Check Build Logs
1. Go to your Netlify dashboard
2. Click on the failed deployment
3. Click "View build log"
4. Look for the specific error message

#### Common Causes:

**A. Missing Dependencies**
```bash
# Make sure all dependencies are in package.json
npm install
```

**B. TypeScript Errors**
```bash
# Check for TypeScript errors locally
npm run build
```

**C. Memory Issues**
- The `netlify.toml` now includes `NODE_OPTIONS = "--max-old-space-size=4096"` to increase memory
- If still failing, try reducing the build complexity

**D. Plugin Installation Issues**
- The `@netlify/plugin-nextjs` is now in `package.json` to ensure it installs correctly

### 2. Build Timeout

**Solution:**
- Netlify free tier has a 15-minute build limit
- Optimize your build by:
  - Removing unused dependencies
  - Using dynamic imports for heavy libraries
  - Splitting large components

### 3. Module Not Found Errors

**Solution:**
```bash
# Make sure all imports are correct
# Check that all dependencies are in package.json
npm install
npm run build
```

### 4. TypeScript Compilation Errors

**Solution:**
```bash
# Run TypeScript check locally
npx tsc --noEmit

# Fix any errors before pushing
```

### 5. Webpack Configuration Issues

**Solution:**
- The `next.config.js` has complex webpack config
- If specific packages cause issues, they're already handled with try-catch blocks
- Check build logs for specific webpack errors

## Step-by-Step Debugging

### Step 1: Test Build Locally
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Test build
npm run build
```

If local build fails, fix those errors first.

### Step 2: Check Netlify Build Logs

1. Go to Netlify dashboard
2. Click on failed deployment
3. Scroll through the build log
4. Look for:
   - Red error messages
   - "Module not found" errors
   - TypeScript errors
   - Memory errors

### Step 3: Common Fixes

**If you see "Cannot find module":**
- Add missing package to `package.json`
- Run `npm install` locally to verify

**If you see TypeScript errors:**
- Fix the TypeScript errors in your code
- Or temporarily set `"strict": false` in `tsconfig.json` (not recommended)

**If you see memory errors:**
- Already handled with `NODE_OPTIONS` in `netlify.toml`
- Consider splitting large files

**If you see webpack errors:**
- Check `next.config.js` for syntax errors
- Verify all webpack configurations are correct

### Step 4: Verify Configuration

Check these files are correct:
- ✅ `netlify.toml` - Build settings
- ✅ `package.json` - All dependencies listed
- ✅ `next.config.js` - No syntax errors
- ✅ `tsconfig.json` - TypeScript config

### Step 5: Try Clean Deploy

1. In Netlify dashboard:
   - Go to Site settings → Build & deploy
   - Clear cache and deploy site
2. Or trigger a new deploy:
   - Make a small change (like updating README)
   - Commit and push to GitHub
   - This triggers a fresh build

## Getting More Help

### Check Netlify Status
- [status.netlify.com](https://status.netlify.com) - Check if Netlify has issues

### Review Documentation
- [Netlify Next.js Docs](https://docs.netlify.com/integrations/frameworks/nextjs/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)

### Enable Debug Mode

Add to `netlify.toml`:
```toml
[build.environment]
  DEBUG = "*"
```

This will show more detailed logs (remove after debugging).

## Quick Checklist

Before deploying:
- [ ] `npm run build` works locally
- [ ] No TypeScript errors (`npx tsc --noEmit`)
- [ ] All dependencies in `package.json`
- [ ] `netlify.toml` is correct
- [ ] Code is pushed to GitHub

After deployment fails:
- [ ] Check build logs in Netlify
- [ ] Look for specific error messages
- [ ] Test build locally with same Node version
- [ ] Verify all files are committed to Git

## Still Having Issues?

1. **Share the build log** - Copy the error from Netlify build log
2. **Check Node version** - Make sure you're using Node 18 (set in `netlify.toml`)
3. **Verify dependencies** - All packages should be in `package.json`
4. **Test incrementally** - Comment out problematic features to isolate the issue

