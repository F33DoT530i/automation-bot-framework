/**
 * Unit Tests for Configuration Module
 */

const path = require('path');
const fs = require('fs');

// Mock the config module
jest.mock('fs');

describe('Configuration Module', () => {
  let config;
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the module
    jest.resetModules();
  });

  test('should load default configuration', () => {
    fs.existsSync.mockReturnValue(false);
    
    const Config = require('../../src/config/config');
    
    expect(Config.get('recorder.enabled')).toBe(false);
    expect(Config.get('recorder.format')).toBe('json');
    expect(Config.get('replay.speed')).toBe(1.0);
    expect(Config.get('legal.requireAcknowledgment')).toBe(true);
  });

  test('should get nested configuration values', () => {
    fs.existsSync.mockReturnValue(false);
    
    const Config = require('../../src/config/config');
    
    expect(Config.get('recorder.screenshotInterval')).toBe(1000);
    expect(Config.get('replay.previewMode')).toBe(true);
  });

  test('should set configuration values', () => {
    fs.existsSync.mockReturnValue(false);
    
    const Config = require('../../src/config/config');
    
    Config.set('recorder.enabled', true);
    expect(Config.get('recorder.enabled')).toBe(true);
    
    Config.set('replay.speed', 2.0);
    expect(Config.get('replay.speed')).toBe(2.0);
  });

  test('should merge user configuration with defaults', () => {
    const userConfig = {
      recorder: {
        enabled: true,
        outputDir: '/custom/path'
      }
    };
    
    fs.existsSync.mockReturnValue(true);
    fs.readFileSync.mockReturnValue(JSON.stringify(userConfig));
    
    // Need to reload module to pick up mocked file
    jest.resetModules();
    const Config = require('../../src/config/config');
    
    expect(Config.get('recorder.enabled')).toBe(true);
    expect(Config.get('recorder.outputDir')).toBe('/custom/path');
    // Default values should still be present
    expect(Config.get('recorder.format')).toBe('json');
  });
});
