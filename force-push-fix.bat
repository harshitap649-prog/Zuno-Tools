@echo off
echo ========================================
echo   Force Push Build Fix to GitHub
echo ========================================
echo.

echo Step 1: Checking current status...
git status
echo.

echo Step 2: Adding all changes...
git add -A
echo.

echo Step 3: Committing changes...
git commit -m "Fix: Use npm install instead of npm ci - ensure Netlify build succeeds"
if %ERRORLEVEL% NEQ 0 (
    echo No changes to commit or commit failed.
) else (
    echo Commit successful!
)
echo.

echo Step 4: Pushing to GitHub...
git push origin main
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   SUCCESS! Changes pushed to GitHub
    echo ========================================
    echo.
    echo Netlify will automatically detect the push
    echo and start a new build in 1-2 minutes.
    echo.
    echo Check your deployment at:
    echo https://app.netlify.com/projects/zunootools/deploys
) else (
    echo.
    echo ========================================
    echo   PUSH FAILED!
    echo ========================================
    echo.
    echo Please check your Git credentials or network connection.
)
echo.
pause

