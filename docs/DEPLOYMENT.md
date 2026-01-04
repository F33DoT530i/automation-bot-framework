# Deployment Guide

This guide covers deployment options for the Automation Bot Framework.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Deployment Methods](#deployment-methods)
- [Manual Deployment with deploy.sh](#manual-deployment-with-deploysh)
- [GitHub Actions Deployment](#github-actions-deployment)
- [PM2 Process Management](#pm2-process-management)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required

- **Node.js** (v18 or higher)
- **npm** (comes with Node.js)
- **PM2** (for process management) - will be auto-installed by deploy.sh if missing

### Optional

- **Git** (for pulling updates from repository)
- **Self-hosted GitHub Actions runner** (for automated deployments)

### Installation

#### Install Node.js and npm

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS (with Homebrew)
brew install node@18

# Verify installation
node --version
npm --version
```

#### Install PM2 Globally

```bash
npm install -g pm2

# Verify installation
pm2 --version
```

## Deployment Methods

### Method 1: Manual Deployment Script (Recommended for Production)

The `deploy.sh` script provides a comprehensive, automated deployment process.

#### Features

- ✅ Prerequisite checking (Node.js, npm, PM2)
- ✅ Automatic PM2 installation if missing
- ✅ Dependency installation with npm ci
- ✅ Entry point verification
- ✅ Process management (start/restart)
- ✅ PM2 configuration persistence
- ✅ System startup configuration
- ✅ Comprehensive error handling

#### Usage

```bash
# Basic deployment
./deploy.sh

# With custom configuration
PROJECT_DIR="my-custom-dir" APP_NAME="my-bot" ./deploy.sh

# From any directory
bash /path/to/automation-bot-framework/deploy.sh
```

#### Configuration Options

The script accepts environment variables for customization:

| Variable | Default | Description |
|----------|---------|-------------|
| `PROJECT_DIR` | `automation-bot-framework` | Project directory name |
| `APP_NAME` | `automation-bot` | PM2 process name |
| `ENTRY_POINT` | `src/index.js` | Application entry point |

Example:

```bash
export PROJECT_DIR="my-automation"
export APP_NAME="my-bot-v2"
export ENTRY_POINT="src/index.js"
./deploy.sh
```

### Method 2: GitHub Actions (Automated Deployment)

For automated deployments on push to main branch.

#### Setup Self-Hosted Runner

1. **Navigate to Repository Settings**
   - Go to your repository on GitHub
   - Click `Settings` > `Actions` > `Runners` > `New self-hosted runner`

2. **Download and Configure Runner**

   ```bash
   # Create a folder
   mkdir actions-runner && cd actions-runner
   
   # Download the latest runner package
   curl -o actions-runner-linux-x64-2.311.0.tar.gz -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz
   
   # Extract the installer
   tar xzf ./actions-runner-linux-x64-2.311.0.tar.gz
   
   # Configure the runner (follow GitHub instructions)
   ./config.sh --url https://github.com/YOUR_USERNAME/automation-bot-framework --token YOUR_TOKEN
   ```

3. **Start the Runner**

   ```bash
   # Run as service (recommended)
   sudo ./svc.sh install
   sudo ./svc.sh start
   
   # Or run interactively
   ./run.sh
   ```

4. **Verify Workflow**

   Push changes to the `main` branch or `backend/` directory to trigger deployment.

### Method 3: Manual Deployment (Development)

For development or testing without automation:

```bash
# 1. Navigate to backend directory
cd backend

# 2. Install dependencies
npm ci

# 3. Run tests (optional)
npm test

# 4. Start with PM2
pm2 start src/index.js --name automation-bot

# 5. Save PM2 configuration
pm2 save
```

## PM2 Process Management

### Basic Commands

```bash
# View all processes
pm2 list

# View detailed info
pm2 info automation-bot

# View logs
pm2 logs automation-bot

# View real-time logs
pm2 logs automation-bot --lines 100 --raw

# Monitor resources
pm2 monit

# Restart application
pm2 restart automation-bot

# Stop application
pm2 stop automation-bot

# Delete from PM2
pm2 delete automation-bot
```

### Advanced Configuration

#### Create Ecosystem File

Create `ecosystem.config.js` in the backend directory:

```javascript
module.exports = {
  apps: [{
    name: 'automation-bot',
    script: './src/index.js',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
    time: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
};
```

#### Use Ecosystem File

```bash
# Start with ecosystem file
pm2 start ecosystem.config.js

# Restart with ecosystem file
pm2 restart ecosystem.config.js
```

### System Startup Configuration

Configure PM2 to start on system boot:

```bash
# Generate startup script
pm2 startup

# Execute the command shown by PM2
# Example (will be different on your system):
# sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u username --hp /home/username

# Save current process list
pm2 save

# Verify
pm2 list
sudo reboot
# After reboot, check if process is running
pm2 list
```

## Deployment Workflow

### Production Deployment Steps

1. **Pre-deployment Checks**
   ```bash
   # Ensure tests pass
   cd backend
   npm test
   
   # Check for security vulnerabilities
   npm audit
   ```

2. **Backup Current State** (optional but recommended)
   ```bash
   pm2 save --force
   cp ~/.pm2/dump.pm2 ~/.pm2/dump.pm2.backup
   ```

3. **Run Deployment**
   ```bash
   ./deploy.sh
   ```

4. **Verify Deployment**
   ```bash
   # Check process status
   pm2 list
   
   # Check logs for errors
   pm2 logs automation-bot --lines 50
   
   # Test application
   # (Application-specific testing)
   ```

5. **Monitor**
   ```bash
   # Monitor for 5 minutes
   pm2 logs automation-bot
   ```

### Rollback Procedure

If deployment fails:

```bash
# Stop current version
pm2 stop automation-bot

# Go back to previous commit
git reset --hard HEAD~1

# Reinstall dependencies
cd backend
npm ci

# Restart with previous version
pm2 restart automation-bot

# Or restore from backup
pm2 resurrect ~/.pm2/dump.pm2.backup
```

## Troubleshooting

### Common Issues

#### Issue: PM2 not found

```bash
# Install PM2 globally
npm install -g pm2

# Verify installation
pm2 --version
```

#### Issue: Port already in use

```bash
# Find process using port
lsof -i :PORT_NUMBER

# Kill process
kill -9 PID

# Or use PM2
pm2 delete automation-bot
pm2 start src/index.js --name automation-bot
```

#### Issue: Application crashes immediately

```bash
# Check logs
pm2 logs automation-bot --err

# Check application configuration
cd backend
cat config.json

# Verify entry point
ls -la src/index.js

# Test manually
node src/index.js
```

#### Issue: Permission denied

```bash
# Make script executable
chmod +x deploy.sh

# Check file permissions
ls -la deploy.sh

# Run with explicit interpreter
bash deploy.sh
```

#### Issue: npm ci fails

```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Regenerate lock file
npm install

# Try deployment again
./deploy.sh
```

### Debugging

#### Enable Verbose Logging

```bash
# Start PM2 with debug mode
DEBUG=* pm2 start src/index.js --name automation-bot

# View detailed logs
pm2 logs automation-bot --raw
```

#### Check System Resources

```bash
# Check disk space
df -h

# Check memory
free -m

# Check PM2 status
pm2 status
pm2 describe automation-bot
```

#### Validate Configuration

```bash
# Check Node.js version
node --version

# Check npm version
npm --version

# Check PM2 version
pm2 --version

# List PM2 processes
pm2 list

# Check PM2 configuration
cat ~/.pm2/dump.pm2
```

## Security Considerations

### Production Deployment

1. **Environment Variables**: Use PM2 ecosystem file to manage sensitive data
2. **User Permissions**: Run PM2 as non-root user
3. **Firewall**: Configure firewall to restrict access
4. **Updates**: Keep Node.js, npm, and PM2 updated
5. **Monitoring**: Set up monitoring and alerting

### Environment-Specific Configuration

```bash
# Set NODE_ENV
export NODE_ENV=production

# Use different config files
pm2 start src/index.js --name automation-bot --env production
```

## Best Practices

1. **Always test before deploying to production**
2. **Use semantic versioning for releases**
3. **Keep deployment logs for audit trail**
4. **Set up monitoring and alerting**
5. **Document any custom deployment configurations**
6. **Use PM2 startup script for automatic recovery**
7. **Regular backups of PM2 configuration**
8. **Monitor application performance and resource usage**

## Additional Resources

- [PM2 Official Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [GitHub Actions Self-Hosted Runners](https://docs.github.com/en/actions/hosting-your-own-runners)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)

## Support

For deployment issues:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review PM2 logs: `pm2 logs automation-bot`
3. Check deployment script output
4. Review the repository issues on GitHub
