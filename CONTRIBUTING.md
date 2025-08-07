# Contributing to Claude Context System

Thank you for your interest in contributing to the Claude Context System! This document provides guidelines and instructions for contributing.

## 🎯 Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:
- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive criticism
- Respect differing opinions and experiences

## 🚀 Getting Started

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/yourusername/claude-context-system.git
   cd claude-context-system
   ```
3. Install dependencies:
   ```bash
   cd src/mcp-server
   npm install
   ```
4. Create a new branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 📝 Pull Request Process

1. **Before submitting:**
   - Ensure all tests pass
   - Update documentation if needed
   - Add tests for new features
   - Follow the existing code style

2. **PR Title Format:**
   - `feat:` New feature
   - `fix:` Bug fix
   - `docs:` Documentation changes
   - `style:` Code style changes
   - `refactor:` Code refactoring
   - `test:` Test additions/changes
   - `chore:` Maintenance tasks

3. **PR Description:**
   - Clearly describe the changes
   - Link to any related issues
   - Include screenshots for UI changes
   - List any breaking changes

## 🧪 Testing

Run the test suite:
```bash
npm test
```

For specific tests:
```bash
npm test -- --grep "your test description"
```

## 📦 Project Structure

```
claude-context-system/
├── src/
│   └── mcp-server/      # MCP server implementation
├── scripts/             # Setup and utility scripts
├── demo/               # Demo content and examples
├── docs/               # Documentation
├── assets/             # Visual assets
└── tests/              # Test files
```

## 🔧 Development Guidelines

### Code Style
- Use ES6+ JavaScript features
- Follow the existing code formatting
- Use meaningful variable and function names
- Add JSDoc comments for public APIs

### Commit Messages
Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:
```
type(scope): description

[optional body]

[optional footer]
```

Example:
```
feat(mcp-server): add batch processing for chat summaries

Implemented batch processing to improve performance when saving
multiple chat summaries simultaneously.

Closes #123
```

## 🐛 Reporting Issues

When reporting issues, please include:
- Your environment (OS, Node.js version, Claude Desktop version)
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Any error messages or logs

## 💡 Feature Requests

We welcome feature requests! Please:
- Check existing issues first
- Clearly describe the feature and its benefits
- Provide use cases and examples
- Be open to discussion and feedback

## 📚 Documentation

When contributing documentation:
- Use clear, concise language
- Include code examples where appropriate
- Update the table of contents if adding new sections
- Test all code examples

## 🎉 Recognition

Contributors will be recognized in our README. Thank you for helping make Claude Context System better!

## 📧 Questions?

If you have questions, feel free to:
- Open an issue with the `question` label
- Join our discussions in the GitHub Discussions tab
- Contact the maintainers

Thank you for contributing! 🙏
