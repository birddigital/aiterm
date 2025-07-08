# Contributing to AITerm

Thank you for your interest in contributing to AITerm! This document provides guidelines and instructions for contributing to the project.

## Table of Contents
- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Pull Request Process](#pull-request-process)
- [Reporting Issues](#reporting-issues)

## Code of Conduct

By participating in this project, you agree to:
- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone git@github.com:yourusername/aiterm.git
   cd aiterm
   ```
3. Add the upstream repository:
   ```bash
   git remote add upstream git@github.com:birddigital/aiterm.git
   ```
4. Create a new branch for your feature/fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

## Development Setup

### Prerequisites
- Node.js 18+ and npm
- macOS 12.0 or later (for full functionality)
- Ollama installed and running
- Git

### Installation
```bash
# Install dependencies
npm install

# Install recommended AI models
ollama pull llama3.2:70b
ollama pull codellama:34b

# Run in development mode
npm run dev
```

### Development Commands
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run lint         # Run linting
npm run typecheck    # Run TypeScript type checking
```

## How to Contribute

### Types of Contributions

#### 1. Bug Fixes
- Check existing issues first
- Create a minimal reproduction
- Include before/after behavior
- Add tests for the fix

#### 2. New Features
- Discuss in an issue first
- Follow the existing architecture
- Add documentation
- Include comprehensive tests

#### 3. Documentation
- Fix typos and clarify unclear sections
- Add examples and use cases
- Update API documentation
- Improve inline code comments

#### 4. Performance Improvements
- Include benchmarks
- Document the optimization
- Ensure no functionality is broken

### Feature Development Guidelines

When adding new features:

1. **AI Commands**: Add to `src/renderer/src/components/CommandPalette.tsx`
2. **Terminal Features**: Modify `src/main/terminal-manager.ts`
3. **System Automation**: Update `src/main/system-controller.ts`
4. **UI Components**: Follow existing patterns in `src/renderer/src/components/`

## Coding Standards

### TypeScript Guidelines
- Use TypeScript for all new code
- Enable strict mode
- Define interfaces for all data structures
- Avoid `any` types

### Code Style
```typescript
// Good
interface TerminalOptions {
  shell?: string
  cwd?: string
  env?: Record<string, string>
}

// Bad
const options: any = {}
```

### File Organization
```
src/
├── main/           # Main process code
│   ├── services/   # Core services
│   └── utils/      # Utilities
├── renderer/       # Renderer process code
│   ├── components/ # React components
│   ├── stores/     # State management
│   └── utils/      # UI utilities
└── shared/         # Shared types/constants
```

### Naming Conventions
- Components: PascalCase (`CommandPalette.tsx`)
- Files: kebab-case (`terminal-manager.ts`)
- Functions/variables: camelCase (`createTerminal`)
- Constants: UPPER_SNAKE_CASE (`MAX_TERMINALS`)
- Interfaces: PascalCase with 'I' prefix optional (`ITerminal` or `Terminal`)

## Testing

### Writing Tests
```typescript
// Example test structure
describe('TerminalManager', () => {
  it('should create a new terminal', async () => {
    const manager = new TerminalManager()
    const terminal = await manager.createTerminal()
    expect(terminal).toBeDefined()
    expect(terminal.id).toMatch(/^term-/)
  })
})
```

### Test Categories
- **Unit Tests**: For individual functions/classes
- **Integration Tests**: For IPC communication
- **E2E Tests**: For full user workflows

### Running Tests
```bash
npm test                 # Run all tests
npm test -- --watch     # Run in watch mode
npm test -- --coverage  # Generate coverage report
```

## Pull Request Process

1. **Before Submitting**
   - Ensure all tests pass
   - Run linting and fix issues
   - Update documentation
   - Add entry to CHANGELOG.md

2. **PR Description Template**
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Documentation
   - [ ] Performance improvement

   ## Testing
   - [ ] Tests pass locally
   - [ ] Added new tests
   - [ ] Manual testing completed

   ## Screenshots (if applicable)
   ```

3. **Review Process**
   - PRs require at least one review
   - Address all feedback
   - Keep PRs focused and small
   - Rebase on main if needed

## Reporting Issues

### Bug Reports Should Include
- AITerm version
- macOS version
- Steps to reproduce
- Expected vs actual behavior
- Error messages/logs
- Screenshots if applicable

### Feature Requests Should Include
- Use case description
- Proposed implementation (optional)
- Alternative solutions considered
- Mockups/examples if applicable

## Architecture Decisions

When proposing architectural changes:
1. Create an ADR (Architecture Decision Record)
2. Discuss in an issue first
3. Consider backward compatibility
4. Document migration path if needed

## Release Process

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create release PR
4. Tag release after merge
5. Build and publish releases

## Getting Help

- Check existing documentation
- Search closed issues
- Ask in discussions
- Join our Discord (coming soon)

## Recognition

Contributors will be recognized in:
- CHANGELOG.md for their contributions
- README.md contributors section
- Release notes

Thank you for contributing to AITerm! 🚀