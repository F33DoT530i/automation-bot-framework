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
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_file: './logs/pm2-combined.log',
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
