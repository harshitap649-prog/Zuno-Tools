@echo off
echo ========================================
echo   Zuno Tools - Deployment Script
echo ========================================
echo.

echo Step 1: Checking Git status...
git status
echo.

echo Step 2: Adding all changes...
git add .
echo.

echo Step 3: Committing changes...
set /p commit_msg="Enter commit message (or press Enter for default): "
if "%commit_msg%"=="" set commit_msg=Update: Fix build errors and deploy
git commit -m "%commit_msg%"
echo.

echo Step 4: Pushing to GitHub...
git push
echo.

echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Your changes have been pushed to GitHub.
echo Netlify will automatically deploy in 2-5 minutes.
echo.
echo Check your deployment at:
echo https://app.netlify.com/projects/zunootools/deploys
echo.
pause

