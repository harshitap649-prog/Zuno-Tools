@echo off
echo Testing build locally...
echo.
echo Step 1: Cleaning...
if exist node_modules rmdir /s /q node_modules
if exist .next rmdir /s /q .next
if exist package-lock.json del package-lock.json
echo.
echo Step 2: Installing dependencies...
call npm install
echo.
echo Step 3: Building...
call npm run build
echo.
if %ERRORLEVEL% EQU 0 (
    echo Build successful! You can now push to GitHub.
) else (
    echo Build failed! Check the errors above.
)
pause

