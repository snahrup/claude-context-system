@echo off
setlocal enabledelayedexpansion

:: Claude Context System Installer v1.0
:: ====================================

cls
echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║        🔗 Claude Context System Installer v1.0            ║
echo ║                                                           ║
echo ║    Transform your AI workflow with seamless context       ║
echo ║    management between Claude Desktop and Notion           ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
timeout /t 2 /nobreak >nul

:: Check for Administrator privileges
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo [❌] This installer requires Administrator privileges.
    echo.
    echo Please right-click on setup.bat and select "Run as Administrator"
    echo.
    pause
    exit /b 1
)

echo [1/6] Checking system requirements...
echo =====================================
:: Check Node.js installation
echo -^> Checking Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo    [❌] Node.js is not installed!
    echo.
    echo    Please install Node.js 16.0 or higher from:
    echo    https://nodejs.org/
    echo.
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
    echo    [✅] Node.js !NODE_VERSION! detected
)

:: Check npm installation  
echo -^> Checking npm...
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo    [❌] npm is not installed!
    pause
    exit /b 1
) else (
    for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
    echo    [✅] npm !NPM_VERSION! detected
)

:: Check for Claude Desktop config
echo -^> Checking Claude Desktop...set CLAUDE_CONFIG=%APPDATA%\Claude\claude_desktop_config.json
if exist "!CLAUDE_CONFIG!" (
    echo    [✅] Claude Desktop configuration found
) else (
    echo    [⚠️] Claude Desktop configuration not found
    echo    We'll create it for you later
)

echo.
echo [2/6] Installing dependencies...
echo ================================
cd /d "%~dp0"

:: Install MCP server dependencies
echo -^> Installing MCP server dependencies...
cd src\mcp-server
call npm install --silent
if %errorlevel% neq 0 (
    echo    [❌] Failed to install dependencies
    pause
    exit /b 1
)
echo    [✅] Dependencies installed successfully
cd ..\..

echo.
echo [3/6] Configuring Notion integration...
echo ======================================
echo.
echo Please enter your Notion configuration:echo.
set /p NOTION_API_KEY="Notion API Key (or press Enter for demo mode): "

if "!NOTION_API_KEY!"=="" (
    echo    [ℹ️] Running in DEMO MODE - No Notion sync
    set DEMO_MODE=true
) else (
    echo    [✅] Notion API Key configured
    set DEMO_MODE=false
    
    :: Create config file
    echo {> src\mcp-server\config.json
    echo   "notion": {>> src\mcp-server\config.json
    echo     "apiKey": "!NOTION_API_KEY!">> src\mcp-server\config.json
    echo   }>> src\mcp-server\config.json
    echo }>> src\mcp-server\config.json
)

echo.
echo [4/6] Setting up Claude Desktop integration...
echo =============================================

:: Get current directory
set CURRENT_DIR=%cd%

:: Create Claude config if it doesn't exist
if not exist "!CLAUDE_CONFIG!" (
    mkdir "%APPDATA%\Claude" 2>nul
    echo {> "!CLAUDE_CONFIG!"
    echo   "mcpServers": {}>> "!CLAUDE_CONFIG!"
    echo }>> "!CLAUDE_CONFIG!"
)
:: Update Claude config
echo -^> Updating Claude Desktop configuration...
node scripts\update-claude-config.js
if %errorlevel% neq 0 (
    echo    [⚠️] Manual configuration may be required
) else (
    echo    [✅] Claude Desktop configured successfully
)

echo.
echo [5/6] Creating demo workspace...
echo ================================

if "!DEMO_MODE!"=="true" (
    echo -^> Setting up local demo files...
    xcopy /E /I /Y demo\* "%USERPROFILE%\Documents\Claude Context Demo" >nul
    echo    [✅] Demo workspace created in Documents folder
) else (
    echo -^> Creating Notion demo workspace...
    node scripts\create-demo-workspace.js
    echo    [✅] Demo workspace created in Notion
)

echo.
echo [6/6] Running health check...
echo =============================
node scripts\health-check.js

echo.
echo ╔═══════════════════════════════════════════════════════════╗
echo ║                                                           ║
echo ║              ✅ Installation Complete! ✅                 ║
echo ║                                                           ║
echo ║  Next steps:                                              ║
echo ║  1. Restart Claude Desktop                                ║
echo ║  2. Start a new conversation                              ║
echo ║  3. Your context will be automatically captured!          ║
echo ║                                                           ║
echo ║  Documentation: docs\README.md                            ║
echo ║  Demo workspace: %USERPROFILE%\Documents\Claude Context Demo ║
echo ║                                                           ║
echo ╚═══════════════════════════════════════════════════════════╝
echo.
pause