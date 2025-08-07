#!/usr/bin/env node

/**
 * Create Demo Workspace in Notion
 * Sets up sample projects and chat summaries for demonstration
 */

import { Client as NotionClient } from '@notionhq/client';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
config({ path: path.join(__dirname, '..', 'src', 'mcp-server', '.env') });

async function createDemoWorkspace() {
  if (!process.env.NOTION_API_KEY || process.env.NOTION_API_KEY === 'your_notion_api_key_here') {
    console.log('📝 Skipping Notion demo workspace (no API key configured)');
    return;
  }

  const notion = new NotionClient({
    auth: process.env.NOTION_API_KEY,
  });

  console.log('Creating demo content in Notion...');

  try {
    // Sample projects
    const projects = [
      {
        name: 'E-Commerce Platform Redesign',
        status: 'In progress',
        goal: 'Modernize the user interface and improve conversion rates'
      },      {
        name: 'Mobile App Development',
        status: 'Not started',
        goal: 'Create a React Native app for iOS and Android'
      },
      {
        name: 'API Integration Suite',
        status: 'Done',
        goal: 'Build comprehensive API integrations for third-party services'
      }
    ];

    // Create projects if database ID is provided
    if (process.env.NOTION_PROJECTS_DB_ID) {
      for (const project of projects) {
        try {
          await notion.pages.create({
            parent: { database_id: process.env.NOTION_PROJECTS_DB_ID },
            properties: {
              'Project name': {
                title: [{ text: { content: project.name } }]
              },
              'Status': {
                status: { name: project.status }
              },
              'Goal': {
                rich_text: [{ text: { content: project.goal } }]
              }
            }
          });
          console.log(`  ✅ Created project: ${project.name}`);
        } catch (error) {
          console.log(`  ⚠️ Could not create project: ${error.message}`);
        }
      }
    }

    console.log('\n✅ Demo workspace setup complete!');
    
  } catch (error) {
    console.error('❌ Error creating demo workspace:', error.message);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createDemoWorkspace();
}

export default createDemoWorkspace;