module.exports = {
  apps: [{
    name: 'automation-bot',
    script: './src/index.js',
    
    // Process Management
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    
    // Resource Management
    max_memory_restart: '500M',
    
    // Environment
    env: {
      NODE_ENV: 'production'
    },
    env_development: {
      NODE_ENV: 'development'
    },
    env_staging: {
      NODE_ENV: 'staging'
    },
    
    // Logging
    // PM2 will create these files automatically
    // Logs stored in PM2 default directory: ~/.pm2/logs/
    error_file: '~/.pm2/logs/automation-bot-error.log',
    out_file: '~/.pm2/logs/automation-bot-out.log',
    log_file: '~/.pm2/logs/automation-bot-combined.log',
    time: true,
    merge_logs: true,
    
    // Restart Behavior
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    restart_delay: 4000,
    
    // Advanced Features
    listen_timeout: 3000,
    kill_timeout: 5000,
    
    // Process Control
    wait_ready: false,
    shutdown_with_message: false
  }]
};
