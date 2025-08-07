# 🚀 Claude Context System - Quick Start Guide

Welcome to the Claude Context System! This guide will help you get up and running in less than 5 minutes.

## Prerequisites

- Node.js 16.0 or higher installed
- Claude Desktop application
- Notion account (free tier works!)

## 🎯 Quick Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/claude-context-system.git
   cd claude-context-system
   ```

2. **Run the automated setup**
   ```bash
   # Windows
   setup.bat
   
   # Mac/Linux
   ./setup.sh
   ```

3. **Follow the prompts**
   - Enter your Notion API key (or press Enter for demo mode)
   - The installer will handle everything else!

## 🎨 Demo Mode

If you chose demo mode during setup:
- Sample projects and chats are available locally
- Check the `demo/sample-chats` folder for examples
- No Notion connection required

## 🔧 Manual Setup (if needed)

1. **Get a Notion API Key**
   - Go to https://www.notion.so/my-integrations
   - Create a new integration
   - Copy the API key

2. **Configure the system**
   - Copy `src/mcp-server/.env.example` to `.env`
   - Add your Notion API key
   - Add your database IDs (or use the demo template)

3. **Restart Claude Desktop**
   - The context system will be automatically available

## 📝 Your First Context Save

1. Start a conversation in Claude Desktop
2. When you want to save context, ask Claude to "save this conversation"
3. Claude will automatically:
   - Create a summary
   - Save to Notion (or locally in demo mode)
   - Generate a Session ID for later retrieval

## 🔄 Resuming a Conversation

Simply paste a Session ID like:
```
Claude-20250802143000
```

Claude will load all context and continue where you left off!

## 🎯 Pro Tips

- Use projects to organize related conversations
- Tag your chats for easy searching
- Review "Key Decisions" to track important choices
- Check "Next Actions" to stay on track

## 🆘 Troubleshooting

Run the health check:
```bash
npm run health-check
```

This will diagnose any configuration issues.

## 📚 More Resources

- [Full Documentation](../docs/README.md)
- [Architecture Guide](../docs/ARCHITECTURE.md)
- [API Reference](../docs/API.md)

---

Ready to transform your AI workflow? Start chatting with Claude and watch your context automatically organize itself! 🎉