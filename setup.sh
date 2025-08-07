#!/bin/bash

# Claude Context System Installer v1.0
# ====================================

clear
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║        🔗 Claude Context System Installer v1.0            ║"
echo "║                                                           ║"
echo "║    Transform your AI workflow with seamless context       ║"
echo "║    management between Claude Desktop and Notion           ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
sleep 2

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "[1/6] Checking system requirements..."
echo "====================================="

# Check Node.js installation
echo -n "-> Checking Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo -e " ${GREEN}[✅] Node.js $NODE_VERSION detected${NC}"
else
    echo -e " ${RED}[❌] Node.js is not installed!${NC}"
    echo ""
    echo "Please install Node.js 16.0 or higher from:"
    echo "https://nodejs.org/"
    echo ""
    exit 1
fi