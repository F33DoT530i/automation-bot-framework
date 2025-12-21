/**
 * Configuration Management for Automation Bot Framework
 * 
 * LEGAL NOTICE: Use of this software is subject to legal and ethical requirements.
 * See docs/legal/DISCLAIMER.md for complete terms.
 */

const fs = require('fs');
const path = require('path');

class Config {
  constructor() {
    this.config = this.loadConfig();
  }

  loadConfig() {
    const defaultConfig = {
      recorder: {
        enabled: false,
        outputDir: path.join(process.cwd(), 'logs'),
        format: 'json',
        captureScreenshots: true,
        captureProcesses: true,
        screenshotInterval: 1000, // milliseconds
        processInterval: 500 // milliseconds
      },
      replay: {
        enabled: false,
        previewMode: true,
        speed: 1.0, // 1.0 = normal speed
        pauseOnError: true
      },
      legal: {
        requireAcknowledgment: true,
        showDisclaimerOnStart: true,
        logDisclaimerAcceptance: true
      },
      logging: {
        level: 'info',
        includeTimestamps: true,
        includeMetadata: true
      }
    };

    const configPath = path.join(process.cwd(), 'config.json');
    
    if (fs.existsSync(configPath)) {
      try {
        const userConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        return this.mergeConfig(defaultConfig, userConfig);
      } catch (error) {
        console.error('Error loading config file, using defaults:', error.message);
        return defaultConfig;
      }
    }

    return defaultConfig;
  }

  mergeConfig(defaults, user) {
    const merged = { ...defaults };
    
    for (const key in user) {
      if (typeof user[key] === 'object' && !Array.isArray(user[key]) && user[key] !== null) {
        merged[key] = this.mergeConfig(defaults[key] || {}, user[key]);
      } else {
        merged[key] = user[key];
      }
    }
    
    return merged;
  }

  get(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], this.config);
  }

  set(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((obj, key) => {
      if (!obj[key]) obj[key] = {};
      return obj[key];
    }, this.config);
    
    target[lastKey] = value;
  }

  save() {
    const configPath = path.join(process.cwd(), 'config.json');
    try {
      fs.writeFileSync(configPath, JSON.stringify(this.config, null, 2));
      return true;
    } catch (error) {
      console.error('Error saving config:', error.message);
      return false;
    }
  }
}

module.exports = new Config();
