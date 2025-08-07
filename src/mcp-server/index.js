#!/usr/bin/env node

/**
 * Claude Context System - MCP Server
 * 
 * Provides seamless integration between Claude Desktop and Notion
 * for automatic context capture and project management.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { Client as NotionClient } from '@notionhq/client';
import { config } from 'dotenv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class ClaudeContextServer {
  constructor() {
    this.server = new Server(
      {
        name: 'claude-context-system',
        version: '1.0.0',
      },      {
        capabilities: {
          tools: {},
        },
      }
    );

    // Initialize Notion client
    this.notion = new NotionClient({
      auth: process.env.NOTION_API_KEY,
    });

    // Configuration
    this.config = {
      projectsDatabaseId: process.env.NOTION_PROJECTS_DB_ID,
      chatsDatabaseId: process.env.NOTION_CHATS_DB_ID,
      autoCreateProjects: process.env.AUTO_CREATE_PROJECTS !== 'false',
    };

    this.setupToolHandlers();

    // Error handling
    this.server.onerror = (error) => console.error('[MCP Error]', error);
    process.on('SIGINT', async () => {
      await this.server.close();
      process.exit(0);
    });
  }

  setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'save_context',
          description: 'Save current conversation context to Notion',
          inputSchema: {
            type: 'object',
            properties: {
              summary: {
                type: 'string',
                description: 'Brief summary of the conversation'
              },
              projectName: {
                type: 'string',
                description: 'Project this conversation belongs to'
              },
              keyDecisions: {
                type: 'array',
                items: { type: 'string' },
                description: 'Important decisions made'
              },
              nextActions: {
                type: 'array',
                items: { type: 'string' },
                description: 'Next steps identified'
              },
              tags: {
                type: 'array',
                items: { type: 'string' },
                description: 'Tags for categorization'
              }
            },
            required: ['summary']
          }
        },        {
          name: 'get_context',
          description: 'Retrieve context from a previous session',
          inputSchema: {
            type: 'object',
            properties: {
              sessionId: {
                type: 'string',
                description: 'Session ID (e.g., Claude-20250802143000)'
              }
            },
            required: ['sessionId']
          }
        },
        {
          name: 'list_projects',
          description: 'List all available projects',
          inputSchema: {
            type: 'object',
            properties: {
              includeArchived: {
                type: 'boolean',
                description: 'Include archived projects',
                default: false
              }
            }
          }
        },
        {
          name: 'create_project',
          description: 'Create a new project in Notion',
          inputSchema: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                description: 'Project name'
              },
              description: {
                type: 'string',
                description: 'Project description'
              },
              status: {
                type: 'string',
                enum: ['Not started', 'In progress', 'Done'],
                default: 'Not started'
              }
            },
            required: ['name']
          }
        }
      ]
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      try {
        switch (name) {
          case 'save_context':
            return await this.saveContext(args);
          
          case 'get_context':
            return await this.getContext(args);
          
          case 'list_projects':
            return await this.listProjects(args);
          
          case 'create_project':
            return await this.createProject(args);
          
          default:
            throw new Error(`Unknown tool: ${name}`);
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error.message}`
            }
          ]
        };
      }
    });
  }

  async saveContext(args) {
    const {
      summary,
      projectName = 'General Inquiries',
      keyDecisions = [],
      nextActions = [],
      tags = []
    } = args;

    // Generate session ID - KEEP EXISTING FORMAT
    const now = new Date();
    const sessionId = `Claude-${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}${String(now.getSeconds()).padStart(2, '0')}`;

    try {
      // STEP 1: Get the highest Chat # from existing records
      const existingChats = await this.notion.databases.query({
        database_id: this.config.chatsDatabaseId,
        sorts: [{ property: 'Chat #', direction: 'descending' }],
        page_size: 1
      });

      let nextChatNumber = 1;
      if (existingChats.results.length > 0) {
        const highestChat = existingChats.results[0];
        const chatNumProp = highestChat.properties['Chat #'];
        if (chatNumProp && chatNumProp.number) {
          nextChatNumber = chatNumProp.number + 1;
        }
      }

      // STEP 2: Format the chat title properly
      const chatNumberStr = String(nextChatNumber).padStart(4, '0');
      
      // Create a descriptive title from the summary (first 50 chars)
      let descriptiveTitle = summary.substring(0, 50);
      if (summary.length > 50) descriptiveTitle += '...';
      
      // Remove any special characters that might break the title
      descriptiveTitle = descriptiveTitle.replace(/[^\w\s-]/g, ' ').trim();
      
      const chatTitle = `${chatNumberStr} - ${descriptiveTitle}`;

      // STEP 3: Find or create project
      let projectId = await this.findProjectByName(projectName);
      if (!projectId && this.config.autoCreateProjects) {
        projectId = await this.createProject({
          name: projectName,
          _internal: true
        });
      }

      // STEP 4: UNCHECK "Is Most Recent" for all previous chats in this project
      if (projectId) {
        const previousChats = await this.notion.databases.query({
          database_id: this.config.chatsDatabaseId,
          filter: {
            and: [
              {
                property: 'Project',
                relation: {
                  contains: projectId
                }
              },
              {
                property: 'Is Most Recent',
                checkbox: {
                  equals: true
                }
              }
            ]
          }
        });

        // Update all previous "most recent" chats for this project
        for (const chat of previousChats.results) {
          await this.notion.pages.update({
            page_id: chat.id,
            properties: {
              'Is Most Recent': {
                checkbox: false
              }
            }
          });
        }
      }

      // STEP 5: Determine chat type based on context
      let chatType = 'Implementation';
      if (summary.toLowerCase().includes('test') || summary.toLowerCase().includes('debug')) {
        chatType = 'Testing';
      } else if (summary.toLowerCase().includes('plan') || summary.toLowerCase().includes('design')) {
        chatType = 'Planning';
      } else if (summary.toLowerCase().includes('setup') || summary.toLowerCase().includes('config')) {
        chatType = 'Setup';
      } else if (summary.toLowerCase().includes('document')) {
        chatType = 'Documentation';
      } else if (summary.toLowerCase().includes('troubleshoot') || summary.toLowerCase().includes('fix')) {
        chatType = 'Troubleshooting';
      }

      // STEP 6: Create the chat record with ALL required properties
      const response = await this.notion.pages.create({
        parent: { database_id: this.config.chatsDatabaseId },
        icon: {
          type: 'emoji',
          emoji: '💬'
        },
        cover: {
          type: 'external',
          external: {
            url: 'https://res.cloudinary.com/dcnxrirvd/image/upload/v1754489967/chats_banner_final_lp6kbb.png'
          }
        },
        properties: {
          // Title property (required)
          'Chat Title': {
            title: [{
              text: { content: chatTitle }
            }]
          },
          
          // Chat number
          'Chat #': {
            number: nextChatNumber
          },
          
          // Session ID - KEEP EXISTING FORMAT
          'Session ID': {
            rich_text: [{
              text: { content: sessionId }
            }]
          },
          
          // Summary
          'Summary': {
            rich_text: [{
              text: { content: summary }
            }]
          },
          
          // Date
          'Date': {
            date: { start: now.toISOString() }
          },
          
          // Created timestamp
          'Created': {
            date: { start: now.toISOString() }
          },
          
          // Chat Type (select)
          'Chat Type': {
            select: { name: chatType }
          },
          
          // Context Status (select) - always Active for new chats
          'Context Status': {
            select: { name: 'Active' }
          },
          
          // Duration (default to 0 for new chats)
          'Duration': {
            number: 0
          },
          
          // Project relation
          'Project': projectId ? {
            relation: [{ id: projectId }]
          } : undefined,
          
          // Tags
          'Tags': {
            multi_select: tags.map(tag => ({ name: tag }))
          },
          
          // Key Decisions
          'Key Decisions': {
            rich_text: [{
              text: { content: keyDecisions.join('\n• ') }
            }]
          },
          
          // Next Actions
          'Next Actions': {
            rich_text: [{
              text: { content: nextActions.join('\n• ') }
            }]
          },
          
          // Handoff Prompt - CRITICAL for context continuity
          'Handoff Prompt': {
            rich_text: [{
              text: { content: `Continue from Session ID: ${sessionId}\n\nPrevious context:\n${summary}\n\nKey decisions made:\n${keyDecisions.join('\n• ')}\n\nNext actions to complete:\n${nextActions.join('\n• ')}\n\nProject: ${projectName}\nTags: ${tags.join(', ')}` }
            }]
          },
          
          // Is Most Recent - TRUE for new chat
          'Is Most Recent': {
            checkbox: true
          },
          
          // URL (can be filled later if needed)
          'URL': {
            url: null
          }
        }
      });

      return {
        content: [{
          type: 'text',
          text: `✅ Context saved successfully!\n\nSession ID: ${sessionId}\nChat #: ${nextChatNumber}\nTitle: ${chatTitle}\n\nUse this ID to resume this conversation later.`
        }]
      };
    } catch (error) {
      throw new Error(`Failed to save context: ${error.message}`);
    }
  }

  async getContext(args) {
    const { sessionId } = args;

    try {
      // Search for chat by session ID
      const response = await this.notion.databases.query({
        database_id: this.config.chatsDatabaseId,
        filter: {
          property: 'Session ID',
          rich_text: {
            contains: sessionId
          }
        }
      });

      if (response.results.length === 0) {
        return {
          content: [{
            type: 'text',
            text: '❌ No context found for this session ID.'
          }]
        };
      }

      const page = response.results[0];
      const props = page.properties;

      // Extract context information
      const context = {
        chatTitle: props['Chat Title']?.title[0]?.text.content || 'Untitled',
        summary: props['Summary']?.rich_text[0]?.text.content || '',
        date: props['Date']?.date?.start || '',
        keyDecisions: props['Key Decisions']?.rich_text[0]?.text.content || '',
        nextActions: props['Next Actions']?.rich_text[0]?.text.content || '',
        tags: props['Tags']?.multi_select.map(tag => tag.name) || []
      };

      return {
        content: [{
          type: 'text',
          text: `📋 **Loaded Context from ${context.date}**\n\n**Summary:** ${context.summary}\n\n**Key Decisions:**\n${context.keyDecisions}\n\n**Next Actions:**\n${context.nextActions}\n\n**Tags:** ${context.tags.join(', ')}`
        }]
      };
    } catch (error) {
      throw new Error(`Failed to retrieve context: ${error.message}`);
    }
  }

  async listProjects(args) {
    const { includeArchived = false } = args;

    try {
      const filter = includeArchived ? {} : {
        property: 'Status',
        status: {
          does_not_equal: 'Done'
        }
      };

      const response = await this.notion.databases.query({
        database_id: this.config.projectsDatabaseId,
        filter,
        sorts: [{
          property: 'Created',
          direction: 'descending'
        }]
      });

      const projects = response.results.map(page => ({
        id: page.id,
        name: page.properties['Project name']?.title[0]?.text.content || 'Untitled',
        status: page.properties['Status']?.status?.name || 'Unknown',
        created: page.properties['Created']?.created_time || ''
      }));

      const projectList = projects
        .map(p => `• ${p.name} (${p.status})`)
        .join('\n');

      return {
        content: [{
          type: 'text',
          text: `📁 **Available Projects (${projects.length}):**\n\n${projectList}`
        }]
      };
    } catch (error) {
      throw new Error(`Failed to list projects: ${error.message}`);
    }
  }

  async createProject(args) {
    const { name, description = '', status = 'Not started' } = args;

    try {
      const response = await this.notion.pages.create({
        parent: { database_id: this.config.projectsDatabaseId },
        properties: {
          'Project name': {
            title: [{
              text: { content: name }
            }]
          },
          'Status': {
            status: { name: status }
          },
          'Goal': description ? {
            rich_text: [{
              text: { content: description }
            }]
          } : undefined
        }
      });

      // Return the project ID directly for internal use
      if (args._internal) {
        return response.id;
      }

      // Return friendly message for MCP responses
      return {
        content: [{
          type: 'text',
          text: `✅ Project "${name}" created successfully!`
        }]
      };
    } catch (error) {
      throw new Error(`Failed to create project: ${error.message}`);
    }
  }

  async findProjectByName(name) {
    try {
      console.error(`Finding project with name: ${name}`);
      console.error(`Using database ID: ${this.config.projectsDatabaseId}`);
      
      const response = await this.notion.databases.query({
        database_id: this.config.projectsDatabaseId,
        filter: {
          property: 'Project name',
          title: {
            equals: name
          }
        }
      });

      console.error(`Found ${response.results.length} matching projects`);
      
      return response.results.length > 0 ? response.results[0].id : null;
    } catch (error) {
      console.error('Error finding project:', error);
      return null;
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Claude Context System MCP server running');
  }
}

// Create and run the server
const server = new ClaudeContextServer();
server.run().catch(console.error);