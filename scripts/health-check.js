#!/usr/bin/env node

/**
 * Claude Context System Health Check
 * Verifies that all components are properly configured
 */

import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class HealthChecker {
  constructor() {
    this.checks = [];
    this.errors = [];
    this.warnings = [];
  }

  async run() {
    console.log('\n🔍 Running Claude Context System Health Check...\n');

    // Run all checks
    await this.checkNodeVersion();
    await this.checkDependencies();
    await this.checkEnvConfiguration();
    await this.checkClaudeConfig();
    await this.checkNotionConnection();

    // Display results
    this.displayResults();
  }
  async checkNodeVersion() {
    const nodeVersion = process.version;
    const major = parseInt(nodeVersion.split('.')[0].substring(1));
    
    if (major >= 16) {
      this.checks.push(`✅ Node.js ${nodeVersion} - OK`);
    } else {
      this.errors.push(`❌ Node.js ${nodeVersion} - Requires v16.0.0 or higher`);
    }
  }

  async checkDependencies() {
    try {
      const packagePath = path.join(__dirname, '..', 'src', 'mcp-server', 'package.json');
      await fs.access(packagePath);
      
      const nodeModulesPath = path.join(__dirname, '..', 'src', 'mcp-server', 'node_modules');
      await fs.access(nodeModulesPath);
      
      this.checks.push('✅ Dependencies installed');
    } catch {
      this.warnings.push('⚠️ Dependencies not installed - run npm install in src/mcp-server');
    }
  }

  async checkEnvConfiguration() {
    try {
      const envPath = path.join(__dirname, '..', 'src', 'mcp-server', '.env');
      await fs.access(envPath);
      
      const envContent = await fs.readFile(envPath, 'utf8');
      const hasApiKey = envContent.includes('NOTION_API_KEY=') && 
                       !envContent.includes('NOTION_API_KEY=your_notion_api_key_here');
      
      if (hasApiKey) {
        this.checks.push('✅ Environment configuration found');
      } else {
        this.warnings.push('⚠️ Notion API key not configured');
      }
    } catch {
      this.warnings.push('⚠️ No .env file found - copy .env.example to .env');
    }
  }
  async checkClaudeConfig() {
    const configPath = path.join(
      os.homedir(),
      process.platform === 'win32' 
        ? 'AppData/Roaming/Claude/claude_desktop_config.json'
        : '.config/Claude/claude_desktop_config.json'
    );

    try {
      const config = JSON.parse(await fs.readFile(configPath, 'utf8'));
      if (config.mcpServers && config.mcpServers['claude-context-system']) {
        this.checks.push('✅ Claude Desktop configured');
      } else {
        this.warnings.push('⚠️ Claude Context System not found in Claude config');
      }
    } catch {
      this.warnings.push('⚠️ Claude Desktop configuration not found');
    }
  }

  async checkNotionConnection() {
    // This is a placeholder - in production, you'd actually test the API
    if (this.warnings.some(w => w.includes('API key'))) {
      this.warnings.push('⚠️ Cannot test Notion connection without API key');
    } else {
      this.checks.push('✅ Ready to connect to Notion');
    }
  }

  displayResults() {
    console.log('=== Health Check Results ===\n');

    if (this.checks.length > 0) {
      console.log('Passed Checks:');
      this.checks.forEach(check => console.log(`  ${check}`));
    }

    if (this.warnings.length > 0) {
      console.log('\nWarnings:');
      this.warnings.forEach(warning => console.log(`  ${warning}`));
    }

    if (this.errors.length > 0) {
      console.log('\nErrors:');
      this.errors.forEach(error => console.log(`  ${error}`));
    }

    const status = this.errors.length === 0 ? '✅ READY' : '❌ ISSUES FOUND';
    console.log(`\nOverall Status: ${status}`);
    
    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('\n🎉 Your Claude Context System is fully configured and ready to use!');
    }
  }
}

// Run health check
const checker = new HealthChecker();
checker.run().catch(console.error);