/**
 * Legal Disclaimer and User Acknowledgment System
 * 
 * This module handles display and acceptance of legal disclaimers.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const DISCLAIMER_TEXT = `
╔════════════════════════════════════════════════════════════════════════════╗
║                        ⚠️  LEGAL DISCLAIMER ⚠️                              ║
╚════════════════════════════════════════════════════════════════════════════╝

IMPORTANT: READ CAREFULLY BEFORE USING THIS SOFTWARE

This software includes SCREEN RECORDING and PROCESS LOGGING capabilities.

BY USING THIS SOFTWARE, YOU ACKNOWLEDGE AND AGREE:

1. You will comply with ALL applicable laws and regulations
2. You will obtain proper CONSENT before recording others
3. You take FULL RESPONSIBILITY for your use of this software
4. You will use this software ONLY for lawful and ethical purposes

PROHIBITED USES:
  ✗ Unauthorized surveillance or monitoring
  ✗ Recording without consent
  ✗ Privacy law violations
  ✗ Any illegal or unethical activity

LIABILITY DISCLAIMER:
F33DoT530i and all contributors are NOT responsible for any misuse, illegal
activity, or unethical use of this software. Users assume ALL liability.

LEGAL CONSEQUENCES OF MISUSE MAY INCLUDE:
  • Criminal prosecution
  • Civil liability
  • Financial penalties
  • Imprisonment

For complete terms, see: docs/legal/DISCLAIMER.md
For usage guidelines, see: docs/legal/USAGE_GUIDELINES.md

IF YOU DO NOT AGREE TO THESE TERMS, DO NOT USE THIS SOFTWARE.
`;

class LegalDisclaimer {
  constructor() {
    this.accepted = false;
    this.acceptanceLogPath = path.join(process.cwd(), 'logs', 'legal_acceptance.log');
  }

  async display() {
    console.log(DISCLAIMER_TEXT);
  }

  async requireAcknowledgment() {
    console.log(DISCLAIMER_TEXT);
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      rl.question('\nDo you accept these terms and conditions? (yes/no): ', (answer) => {
        rl.close();
        
        const accepted = answer.toLowerCase() === 'yes';
        this.accepted = accepted;
        
        if (accepted) {
          this.logAcceptance();
          console.log('\n✓ Terms accepted. Proceeding...\n');
          resolve(true);
        } else {
          console.log('\n✗ Terms not accepted. Exiting...\n');
          resolve(false);
        }
      });
    });
  }

  logAcceptance() {
    const logDir = path.dirname(this.acceptanceLogPath);
    
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      action: 'disclaimer_accepted',
      user: process.env.USER || process.env.USERNAME || 'unknown',
      hostname: require('os').hostname(),
      version: '1.0.0'
    };

    try {
      fs.appendFileSync(
        this.acceptanceLogPath,
        JSON.stringify(logEntry) + '\n',
        'utf8'
      );
    } catch (error) {
      console.warn('Warning: Could not log disclaimer acceptance:', error.message);
    }
  }

  getDisclaimerForLog() {
    return {
      disclaimer: 'This recording was made using automation-bot-framework.',
      legal_notice: 'User is solely responsible for lawful and ethical use.',
      warning: 'Unauthorized recording or privacy violations may result in legal consequences.',
      terms: 'By using this software, user agreed to terms in docs/legal/DISCLAIMER.md',
      contact: 'See https://github.com/F33DoT530i/automation-bot-framework for more information'
    };
  }

  async checkAndRequireAcceptance(config) {
    if (config.get('legal.requireAcknowledgment')) {
      const accepted = await this.requireAcknowledgment();
      if (!accepted) {
        process.exit(0);
      }
    } else if (config.get('legal.showDisclaimerOnStart')) {
      await this.display();
      console.log('\nProceeding with operation...\n');
    }
  }
}

module.exports = new LegalDisclaimer();
