#!/usr/bin/env node

/**
 * Main installation script for Claude Context System
 * Orchestrates the entire setup process
 */

import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runCommand(command, args = []) {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, args, {
      stdio: 'inherit',
      shell: true,
      cwd: path.join(__dirname, '..')
    });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

async function install() {
  console.log('🚀 Starting Claude Context System installation...\n');

  try {
    // Install dependencies
    console.log('📦 Installing dependencies...');
    await runCommand('npm', ['install', '--prefix', 'src/mcp-server']);

    // Update Claude config
    console.log('\n⚙️ Configuring Claude Desktop...');
    await runCommand('node', ['scripts/update-claude-config.js']);

    // Create demo workspace
    console.log('\n🎨 Setting up demo workspace...');
    await runCommand('node', ['scripts/create-demo-workspace.js']);

    // Run health check
    console.log('\n🔍 Running health check...');
    await runCommand('node', ['scripts/health-check.js']);

    console.log('\n✨ Installation complete!');
    
  } catch (error) {
    console.error('\n❌ Installation failed:', error.message);
    process.exit(1);
  }
}

install();