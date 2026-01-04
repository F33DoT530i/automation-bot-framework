#!/bin/bash

# Automation Bot Framework - Deployment Script
# This script automates the deployment process for the automation bot framework
# It handles dependencies, process management with PM2, and ensures proper restart behavior

# Configuration
PROJECT_DIR="${PROJECT_DIR:-automation-bot-framework}"
BACKEND_DIR="backend"
APP_NAME="${APP_NAME:-automation-bot}"
ENTRY_POINT="${ENTRY_POINT:-src/index.js}"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🚀 Starting deployment for $APP_NAME..."

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to print error and exit
error_exit() {
    echo -e "${RED}❌ Error: $1${NC}" >&2
    exit 1
}

# Function to print warning
warn() {
    echo -e "${YELLOW}⚠️  Warning: $1${NC}"
}

# Function to print success
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# 1. Check prerequisites
echo "🔍 Checking prerequisites..."

# Check if Node.js is installed
if ! command_exists node; then
    error_exit "Node.js is not installed. Please install Node.js first."
fi

# Check if npm is installed
if ! command_exists npm; then
    error_exit "npm is not installed. Please install npm first."
fi

# Check if PM2 is installed
if ! command_exists pm2; then
    warn "PM2 is not installed. Installing PM2 globally..."
    npm install -g pm2 || error_exit "Failed to install PM2"
fi

success "Prerequisites check completed"

# 2. Navigate to the project directory
echo "📂 Navigating to project directory..."
if [ -d "$HOME/$PROJECT_DIR" ]; then
    cd "$HOME/$PROJECT_DIR" || error_exit "Failed to navigate to $HOME/$PROJECT_DIR"
else
    # Try current directory
    if [ -f "backend/package.json" ]; then
        echo "   Using current directory as project root"
    else
        error_exit "Project directory not found. Expected at $HOME/$PROJECT_DIR or current directory"
    fi
fi

success "Project directory: $(pwd)"

# 3. Pull the latest changes (optional - only if in git repo)
if [ -d ".git" ]; then
    echo "📥 Pulling latest code from GitHub..."
    git pull origin main || warn "Git pull failed or not on main branch"
else
    warn "Not a git repository, skipping git pull"
fi

# 4. Enter the backend directory
echo "📂 Entering backend directory..."
cd "$BACKEND_DIR" || error_exit "Backend directory not found"

success "Backend directory: $(pwd)"

# 5. Verify package files exist
if [ ! -f "package.json" ]; then
    error_exit "package.json not found in backend directory"
fi

if [ ! -f "package-lock.json" ]; then
    warn "package-lock.json not found. Using npm install instead of npm ci"
    INSTALL_CMD="npm install"
else
    INSTALL_CMD="npm ci"
fi

# 6. Install dependencies
echo "📦 Installing dependencies..."
$INSTALL_CMD || error_exit "Failed to install dependencies"

success "Dependencies installed"

# 7. Verify entry point exists
if [ ! -f "$ENTRY_POINT" ]; then
    error_exit "Entry point $ENTRY_POINT not found"
fi

success "Entry point verified: $ENTRY_POINT"

# 8. Run tests (optional)
if grep -q '"test":' package.json; then
    echo "🧪 Running tests..."
    npm test || warn "Tests failed, but continuing deployment"
fi

# 9. Manage the process with PM2
echo "⚙️  Managing process with PM2..."

# Check if process already exists
if pm2 list | grep -q "$APP_NAME"; then
    echo "🔄 Restarting existing process..."
    pm2 restart "$APP_NAME" || error_exit "Failed to restart PM2 process"
    success "Process restarted"
else
    echo "🟢 Starting new process..."
    pm2 start "$ENTRY_POINT" --name "$APP_NAME" --time || error_exit "Failed to start PM2 process"
    success "New process started"
fi

# 10. Save PM2 configuration
echo "💾 Saving PM2 configuration..."
pm2 save || warn "Failed to save PM2 configuration"

# 11. Setup PM2 to start on system boot (optional)
if command_exists systemctl; then
    echo "🔧 Setting up PM2 startup script..."
    pm2 startup systemd -u "$USER" --hp "$HOME" || warn "Failed to setup PM2 startup"
fi

# 12. Display status
echo ""
echo "📊 Deployment Status:"
pm2 status

echo ""
success "Deployment completed successfully!"
echo ""
echo "Useful commands:"
echo "  pm2 status           - View process status"
echo "  pm2 logs $APP_NAME   - View application logs"
echo "  pm2 restart $APP_NAME - Restart application"
echo "  pm2 stop $APP_NAME   - Stop application"
echo "  pm2 delete $APP_NAME - Remove application from PM2"
echo ""
