@echo off
echo ========================================
echo   FINAL DEPLOYMENT - All Fixes
echo ========================================
echo.

echo Checking current status...
git status
echo.

echo Adding all changes...
git add -A
echo.

echo Committing all fixes...
git commit -m "Fix: All build errors - toast.info, npm install, TypeScript strict mode"
if %ERRORLEVEL% NEQ 0 (
    echo No new changes to commit.
) else (
    echo Commit successful!
)
echo.

echo Pushing to GitHub...
git push origin main
if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   SUCCESS! All fixes pushed!
    echo ========================================
    echo.
    echo Netlify will automatically deploy in 1-2 minutes.
    echo.
    echo Check: https://app.netlify.com/projects/zunootools/deploys
) else (
    echo.
    echo Push failed. Check your Git credentials.
)
echo.
pause

