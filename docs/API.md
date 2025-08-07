# 🔌 Claude Context System API Reference

## Overview

The Claude Context System exposes several tools through the Model Context Protocol (MCP) that can be called from Claude Desktop. This reference documents all available tools, their parameters, and expected responses.

## 📋 Available Tools

### 1. save_context

Saves the current conversation context to Notion.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| summary | string | Yes | Brief summary of the conversation |
| projectName | string | No | Project to associate with (default: "General Inquiries") |
| keyDecisions | array | No | List of important decisions made |
| nextActions | array | No | List of identified action items |
| tags | array | No | Tags for categorization |

**Example Request:**
```javascript
{
  "tool": "save_context",
  "arguments": {
    "summary": "Discussed API authentication strategies",
    "projectName": "E-Commerce Platform",
    "keyDecisions": [
      "Use JWT for stateless auth",
      "Implement refresh token rotation"
    ],
    "nextActions": [
      "Create auth middleware",
      "Set up token storage"
    ],
    "tags": ["#security", "#api", "#authentication"]
  }
}
```
**Response:**
```javascript
{
  "content": [{
    "type": "text",
    "text": "✅ Context saved successfully!\n\nSession ID: Claude-20250802143000\n\nUse this ID to resume this conversation later."
  }]
}
```

### 2. get_context

Retrieves context from a previous session.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| sessionId | string | Yes | Session ID (format: Claude-YYYYMMDDHHMMSS) |

**Example Request:**
```javascript
{
  "tool": "get_context",
  "arguments": {
    "sessionId": "Claude-20250802143000"
  }
}
```

**Response:**
```javascript
{
  "content": [{
    "type": "text",
    "text": "📋 **Loaded Context from 2025-08-02**\n\n**Summary:** Discussed API authentication strategies\n\n**Key Decisions:**\n• Use JWT for stateless auth\n• Implement refresh token rotation\n\n**Next Actions:**\n• Create auth middleware\n• Set up token storage\n\n**Tags:** #security, #api, #authentication"
  }]
}
```

### 3. list_projects

Lists all available projects in Notion.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| includeArchived | boolean | No | Include archived projects (default: false) |

**Example Request:**
```javascript
{
  "tool": "list_projects",
  "arguments": {
    "includeArchived": false
  }
}
```

**Response:**
```javascript
{
  "content": [{
    "type": "text",
    "text": "📁 **Available Projects (3):**\n\n• E-Commerce Platform Redesign (In progress)\n• Mobile App Development (Not started)\n• API Integration Suite (Done)"
  }]
}
```

### 4. create_project

Creates a new project in Notion.

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| name | string | Yes | Project name |
| description | string | No | Project description/goal |
| status | string | No | Initial status: "Not started", "In progress", "Done" |

**Example Request:**
```javascript
{
  "tool": "create_project",
  "arguments": {
    "name": "Machine Learning Pipeline",
    "description": "Build ML pipeline for recommendation system",
    "status": "Not started"
  }
}
```

**Response:**
```javascript
{
  "content": [{
    "type": "text",
    "text": "✅ Project \"Machine Learning Pipeline\" created successfully!"
  }]
}
```

## 🔐 Error Handling

All tools return errors in a consistent format:

```javascript
{
  "content": [{
    "type": "text",
    "text": "Error: [Error message]"
  }]
}
```

### Common Error Codes

| Error | Description | Solution |
|-------|-------------|----------|
| "No Notion API key configured" | Missing API key | Add key to .env file |
| "Failed to save context" | Notion API error | Check API permissions |
| "No context found for this session ID" | Invalid session | Verify session ID format |
| "Rate limit exceeded" | Too many requests | Wait and retry |

## 🔄 Integration Examples

### JavaScript/Node.js

```javascript
// Example: Save context programmatically
const saveContext = async (summary, project) => {
  const response = await claudeMCP.callTool('save_context', {
    summary: summary,
    projectName: project,
    tags: ['#automated']
  });
  
  console.log(response.content[0].text);
};
```

### Python

```python
# Example: Retrieve context
def get_context(session_id):
    response = claude_mcp.call_tool('get_context', {
        'sessionId': session_id
    })
    
    return response['content'][0]['text']
```

## 📊 Rate Limits

- **Notion API**: 3 requests per second
- **MCP timeout**: 30 seconds per request
- **Batch operations**: Not currently supported

## 🔧 Configuration

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| NOTION_API_KEY | Your Notion integration token | Yes |
| NOTION_PROJECTS_DB_ID | Projects database ID | Yes |
| NOTION_CHATS_DB_ID | Chat summaries database ID | Yes |
| AUTO_CREATE_PROJECTS | Auto-create missing projects | No |

### Advanced Configuration

Create `config.json` in the MCP server directory:

```json
{
  "notion": {
    "retryAttempts": 3,
    "retryDelay": 1000,
    "timeout": 25000
  },
  "context": {
    "maxSummaryLength": 1000,
    "maxDecisions": 10,
    "maxActions": 10,
    "maxTags": 5
  }
}
```

---

For architecture details, see [ARCHITECTURE.md](ARCHITECTURE.md).  
For usage instructions, see [USER_GUIDE.md](USER_GUIDE.md).