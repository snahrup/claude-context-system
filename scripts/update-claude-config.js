#!/usr/bin/env node

/**
 * Update Claude Desktop Configuration
 * Adds the Claude Context System MCP server to the config
 */

import fs from 'fs/promises';
import path from 'path';
import os from 'os';

async function updateClaudeConfig() {
  const configPath = path.join(
    os.homedir(),
    process.platform === 'win32' 
      ? 'AppData/Roaming/Claude/claude_desktop_config.json'
      : '.config/Claude/claude_desktop_config.json'
  );

  try {
    // Read existing config
    let config = {};
    try {
      const configData = await fs.readFile(configPath, 'utf8');
      config = JSON.parse(configData);
    } catch (error) {
      console.log('Creating new Claude configuration...');
      config = { mcpServers: {} };
    }

    // Ensure mcpServers exists
    if (!config.mcpServers) {
      config.mcpServers = {};
    }
    // Add Claude Context System server
    const serverPath = path.join(process.cwd(), 'src', 'mcp-server', 'index.js');
    
    config.mcpServers['claude-context-system'] = {
      command: 'node',
      args: [serverPath],
      env: {
        NODE_ENV: 'production'
      }
    };

    // Create directory if it doesn't exist
    const configDir = path.dirname(configPath);
    await fs.mkdir(configDir, { recursive: true });

    // Write updated config
    await fs.writeFile(
      configPath,
      JSON.stringify(config, null, 2),
      'utf8'
    );

    console.log('✅ Claude Desktop configuration updated successfully!');
    console.log(`   Configuration saved to: ${configPath}`);
    
  } catch (error) {
    console.error('❌ Failed to update Claude configuration:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  updateClaudeConfig();
}

export default updateClaudeConfig;