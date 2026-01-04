# Deployment Quick Reference

## Quick Commands

### Local/Manual Deployment
```bash
# One-command deployment
./deploy.sh

# View deployment status
pm2 list

# View logs
pm2 logs automation-bot
```

### GitHub Actions Deployment
- **Automatic**: Push to `main` branch or modify files in `backend/` directory
- **Manual**: Go to Actions → Auto Deploy to Server → Run workflow

## File Overview

| File | Purpose |
|------|---------|
| `deploy.sh` | Standalone deployment script for manual/server deployment |
| `.github/workflows/auto_deploy.yml` | GitHub Actions workflow for automated deployment |
| `backend/ecosystem.config.js` | PM2 process configuration |
| `docs/DEPLOYMENT.md` | Comprehensive deployment documentation |

## Entry Points

- **Application**: `backend/src/index.js`
- **PM2 Process Name**: `automation-bot`
- **Tests**: `npm test` (in backend directory)

## Key Configuration Variables

```bash
# Environment variables for deploy.sh
PROJECT_DIR="automation-bot-framework"  # Project directory
APP_NAME="automation-bot"               # PM2 process name
ENTRY_POINT="src/index.js"              # Application entry point
```

## Common Issues

### PM2 Not Found
```bash
npm install -g pm2
```

### Port Already in Use
```bash
pm2 delete automation-bot
./deploy.sh
```

### View Logs for Errors
```bash
pm2 logs automation-bot --err --lines 50
```

## System Startup (One-Time Setup)

```bash
# Step 1: Generate startup script
pm2 startup

# Step 2: Run the command displayed by PM2 (requires sudo)
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME

# Step 3: Save PM2 configuration
pm2 save
```

## Workflow Summary

1. **Prerequisites Check** ✓
   - Node.js installed
   - npm installed
   - PM2 installed (auto-installs if missing)

2. **Deployment** 🚀
   - Pull latest code (if git repo)
   - Install dependencies with `npm ci`
   - Verify entry point exists
   - Start/restart with PM2

3. **Verification** ✅
   - Check PM2 status
   - View logs for errors
   - Test application functionality

## For More Details

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for comprehensive documentation.
