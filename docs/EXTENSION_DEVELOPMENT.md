# AITerm Extension Development Guide

This guide explains how to create extensions for AITerm, including Raycast-compatible extensions.

## Table of Contents
- [Extension Architecture](#extension-architecture)
- [Creating Your First Extension](#creating-your-first-extension)
- [Extension API](#extension-api)
- [Raycast Compatibility](#raycast-compatibility)
- [Publishing Extensions](#publishing-extensions)

## Extension Architecture

Extensions in AITerm are JavaScript/TypeScript modules that can:
- Add new commands to the command palette
- Interact with terminal sessions
- Use AI capabilities
- Control system features

### Extension Structure
```
my-extension/
├── package.json        # Extension metadata
├── src/
│   ├── index.ts       # Main entry point
│   └── commands/      # Command implementations
├── assets/            # Icons and resources
└── README.md          # Extension documentation
```

## Creating Your First Extension

### 1. Extension Manifest (package.json)
```json
{
  "name": "my-aiterm-extension",
  "version": "1.0.0",
  "description": "My awesome AITerm extension",
  "main": "dist/index.js",
  "aiterm": {
    "displayName": "My Extension",
    "icon": "assets/icon.png",
    "commands": [
      {
        "name": "hello-world",
        "title": "Hello World",
        "subtitle": "My first command",
        "category": "Demo"
      }
    ]
  },
  "devDependencies": {
    "@aiterm/types": "^1.0.0"
  }
}
```

### 2. Main Entry Point (src/index.ts)
```typescript
import { Extension, Command } from '@aiterm/types'

export default class MyExtension implements Extension {
  commands: Command[] = [
    {
      id: 'hello-world',
      title: 'Hello World',
      subtitle: 'My first command',
      category: 'Demo',
      action: async (context) => {
        await context.showToast('Hello from my extension!')
      }
    }
  ]

  async activate(context: ExtensionContext): Promise<void> {
    console.log('My extension activated!')
  }

  async deactivate(): Promise<void> {
    console.log('My extension deactivated!')
  }
}
```

## Extension API

### Context Object
Every command receives a context object with these capabilities:

```typescript
interface ExtensionContext {
  // UI Methods
  showToast(message: string): Promise<void>
  showError(message: string): Promise<void>
  showInputPrompt(options: InputOptions): Promise<string>
  
  // Terminal Access
  getCurrentTerminal(): Terminal
  createTerminal(options?: TerminalOptions): Promise<Terminal>
  
  // AI Access
  queryAI(prompt: string, context?: AIContext): Promise<string>
  
  // System Access
  executeSystem(action: SystemAction): Promise<any>
  
  // Storage
  storage: ExtensionStorage
}
```

### Terminal Interaction
```typescript
// Get current terminal
const terminal = context.getCurrentTerminal()

// Write to terminal
await terminal.write('ls -la\n')

// Read terminal output
terminal.on('data', (data) => {
  console.log('Terminal output:', data)
})

// Create new terminal
const newTerminal = await context.createTerminal({
  cwd: '/Users/me/projects'
})
```

### AI Integration
```typescript
// Simple AI query
const response = await context.queryAI('Explain this error: ' + errorText)

// AI query with context
const response = await context.queryAI('What does this code do?', {
  terminalOutput: terminal.getRecentOutput(),
  selectedText: terminal.getSelection()
})
```

### System Automation
```typescript
// Run AppleScript
await context.executeSystem({
  type: 'applescript',
  action: 'tell application "Finder" to reveal POSIX file "/Users"'
})

// Execute shell command
const result = await context.executeSystem({
  type: 'command',
  action: 'open -a "Visual Studio Code" .'
})
```

## Raycast Compatibility

AITerm supports Raycast extensions with minimal modifications:

### Raycast Extension Structure
```typescript
import { List, ActionPanel, Action } from '@raycast/api'

export default function Command() {
  return (
    <List>
      <List.Item
        title="My Item"
        subtitle="Description"
        actions={
          <ActionPanel>
            <Action title="Run" onAction={() => console.log('Running!')} />
          </ActionPanel>
        }
      />
    </List>
  )
}
```

### Compatibility Layer
AITerm provides a compatibility layer that translates Raycast API calls:

```typescript
// Raycast API
import { showToast, Toast } from '@raycast/api'
await showToast({ style: Toast.Style.Success, title: 'Done!' })

// Translates to AITerm API
await context.showToast('Done!')
```

### Supported Raycast APIs
- ✅ List, Detail, Form components
- ✅ ActionPanel and Actions
- ✅ showToast, showHUD
- ✅ LocalStorage
- ✅ Clipboard
- ✅ Environment variables
- ⚠️  OAuth (requires adapter)
- ❌ Browser extensions

## Advanced Extension Features

### Custom UI Components
```typescript
import { registerComponent } from '@aiterm/ui'

registerComponent('MyCustomView', {
  render: (props) => {
    return {
      type: 'view',
      children: [
        { type: 'text', content: 'Custom UI!' }
      ]
    }
  }
})
```

### Background Tasks
```typescript
export default class MyExtension {
  async activate(context: ExtensionContext) {
    // Register background task
    context.intervals.register('sync', 60000, async () => {
      await this.syncData()
    })
  }

  private async syncData() {
    // Runs every 60 seconds
  }
}
```

### Extension Storage
```typescript
// Store data
await context.storage.set('apiKey', 'secret-key')
await context.storage.setJSON('config', { theme: 'dark' })

// Retrieve data
const apiKey = await context.storage.get('apiKey')
const config = await context.storage.getJSON('config')

// Remove data
await context.storage.remove('apiKey')
```

## Publishing Extensions

### 1. Build Your Extension
```bash
npm run build
npm pack
```

### 2. Test Locally
```bash
# Install in AITerm
aiterm install-extension ./my-extension-1.0.0.tgz
```

### 3. Publish to Registry
```bash
# Coming soon: AITerm extension registry
aiterm publish
```

### 4. Extension Guidelines
- Keep extensions focused and lightweight
- Follow TypeScript best practices
- Include comprehensive documentation
- Test on different macOS versions
- Respect user privacy

## Debugging Extensions

### Enable Developer Mode
1. Open AITerm settings
2. Enable "Developer Mode"
3. Access developer console: `⌘⌥I`

### Debug Output
```typescript
// Use console methods
console.log('Debug info')
console.error('Error occurred')

// Extension-specific logger
context.logger.info('Extension started')
context.logger.error('Failed to load', error)
```

### Hot Reload
During development, extensions automatically reload on file changes:
```bash
aiterm dev ./my-extension
```

## Best Practices

### Performance
- Lazy load heavy dependencies
- Use debouncing for frequent operations
- Cache AI responses when appropriate
- Clean up resources in deactivate()

### User Experience
- Provide clear command descriptions
- Show progress for long operations
- Handle errors gracefully
- Respect system resources

### Security
- Never store sensitive data in plain text
- Validate all user inputs
- Use secure communication channels
- Request minimal permissions

## Example Extensions

### 1. Git Helper
```typescript
{
  id: 'git-quick-commit',
  title: 'Quick Commit',
  action: async (context) => {
    const message = await context.showInputPrompt({
      title: 'Commit message'
    })
    
    const terminal = context.getCurrentTerminal()
    await terminal.write(`git add . && git commit -m "${message}"\n`)
  }
}
```

### 2. AI Code Review
```typescript
{
  id: 'ai-review-selection',
  title: 'Review Selected Code',
  action: async (context) => {
    const terminal = context.getCurrentTerminal()
    const selected = terminal.getSelection()
    
    if (!selected) {
      await context.showError('No code selected')
      return
    }
    
    const review = await context.queryAI(
      'Review this code for bugs and improvements:\n' + selected
    )
    
    await context.showDetail({
      title: 'Code Review',
      content: review
    })
  }
}
```

### 3. System Automation
```typescript
{
  id: 'arrange-dev-workspace',
  title: 'Arrange Development Workspace',
  action: async (context) => {
    await context.executeSystem({
      type: 'applescript',
      action: `
        tell application "Visual Studio Code" to activate
        tell application "AITerm" to activate
        tell application "Safari"
          activate
          open location "http://localhost:3000"
        end tell
      `
    })
  }
}
```

## Resources

- [Extension API Reference](/docs/API.md#extension-api)
- [Example Extensions](https://github.com/aiterm/example-extensions)
- [Extension Template](https://github.com/aiterm/extension-template)
- [Raycast Migration Guide](https://github.com/aiterm/raycast-migration)

Happy extension building! 🚀