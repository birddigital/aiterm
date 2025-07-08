# AITerm API Documentation

This document describes the IPC (Inter-Process Communication) API between the main and renderer processes in AITerm.

## Table of Contents
- [Terminal API](#terminal-api)
- [AI API](#ai-api)
- [System Control API](#system-control-api)
- [Raycast Adapter API](#raycast-adapter-api)
- [Store APIs](#store-apis)
- [Event System](#event-system)

## Terminal API

### `terminal:create`
Creates a new terminal instance.

**Parameters:**
```typescript
interface TerminalOptions {
  shell?: string      // Shell to use (default: $SHELL or /bin/zsh)
  cwd?: string       // Working directory (default: $HOME)
  env?: Record<string, string>  // Environment variables
  cols?: number      // Terminal columns (default: 80)
  rows?: number      // Terminal rows (default: 24)
}
```

**Returns:**
```typescript
string  // Terminal ID (e.g., "term-abc123")
```

**Example:**
```typescript
const terminalId = await window.electron.ipcRenderer.invoke('terminal:create', {
  shell: '/bin/bash',
  cwd: '/Users/username/projects'
})
```

### `terminal:write`
Writes data to a terminal.

**Parameters:**
```typescript
{
  id: string    // Terminal ID
  data: string  // Data to write
}
```

**Example:**
```typescript
await window.electron.ipcRenderer.invoke('terminal:write', {
  id: 'term-abc123',
  data: 'ls -la\n'
})
```

### `terminal:resize`
Resizes a terminal.

**Parameters:**
```typescript
{
  id: string    // Terminal ID
  cols: number  // New column count
  rows: number  // New row count
}
```

### `terminal:close`
Closes a terminal session.

**Parameters:**
```typescript
string  // Terminal ID
```

### `terminal:data` (Event)
Emitted when terminal outputs data.

**Event Data:**
```typescript
{
  id: string    // Terminal ID
  data: string  // Output data
}
```

## AI API

### `ai:query`
Sends a query to the AI orchestrator.

**Parameters:**
```typescript
interface AIQuery {
  prompt: string
  context?: {
    terminalOutput?: string    // Recent terminal output
    currentDirectory?: string  // Current working directory
    recentCommands?: string[]  // Recent command history
    selectedText?: string      // Selected text in terminal
  }
  model?: string              // Specific model to use
  stream?: boolean           // Stream responses
}
```

**Returns:**
```typescript
{
  response: string           // AI response
  model: string             // Model used
  tokensUsed?: number       // Tokens consumed
  latency?: number          // Response time in ms
}
```

**Example:**
```typescript
const result = await window.electron.ipcRenderer.invoke('ai:query', {
  prompt: 'Explain this error',
  context: {
    terminalOutput: errorText,
    currentDirectory: '/Users/project'
  }
})
```

### `ai:explain-error`
Analyzes the most recent error in terminal.

**Parameters:** None (uses current terminal context)

**Returns:**
```typescript
{
  explanation: string      // Error explanation
  suggestions: string[]    // Fix suggestions
  commands?: string[]      // Suggested commands
}
```

### `ai:suggest-command`
Suggests commands based on context.

**Parameters:**
```typescript
{
  description: string      // What you want to do
  context?: object        // Optional context
}
```

### `ai:stream` (Event)
Emitted during streaming AI responses.

**Event Data:**
```typescript
{
  chunk: string           // Response chunk
  done: boolean          // Is streaming complete
  model: string          // Model being used
}
```

## System Control API

### `system:control`
Executes system automation actions.

**Parameters:**
```typescript
interface SystemAction {
  type: 'applescript' | 'command' | 'keypress' | 'window'
  action: string
  params?: any
}
```

**Returns:** Varies by action type

### Action Types

#### AppleScript
```typescript
{
  type: 'applescript',
  action: 'tell application "Finder" to activate'
}
```

#### Shell Command
```typescript
{
  type: 'command',
  action: 'open -a "Visual Studio Code" .'
}
```

#### Window Management
```typescript
{
  type: 'window',
  action: 'arrange',
  params: {
    layout: 'coding'  // Predefined layout
  }
}
```

#### Keypress Simulation
```typescript
{
  type: 'keypress',
  action: 'cmd+space'
}
```

## Raycast Adapter API

### `raycast:execute`
Executes a Raycast extension command.

**Parameters:**
```typescript
{
  extensionId: string     // Extension identifier
  command: string         // Command to execute
  args?: any             // Command arguments
}
```

**Returns:**
```typescript
{
  success: boolean
  result?: any
  error?: string
}
```

### `raycast:list-extensions`
Lists available Raycast extensions.

**Returns:**
```typescript
Array<{
  id: string
  name: string
  commands: string[]
  icon?: string
}>
```

## Store APIs

### Terminal Store Methods

Available through `useTerminalStore`:

```typescript
interface TerminalStore {
  terminals: Terminal[]
  activeTerminal: string | null
  createTerminal: () => Promise<void>
  closeTerminal: (id: string) => void
  setActiveTerminal: (id: string) => void
  updateTerminalTitle: (id: string, title: string) => void
}
```

### AI Store Methods

Available through `useAIStore`:

```typescript
interface AIStore {
  isAIPanelOpen: boolean
  currentQuery: string | null
  queryHistory: AIQuery[]
  activeModel: string
  toggleAIPanel: () => void
  setActiveModel: (model: string) => void
  addToHistory: (query: AIQuery) => void
}
```

## Event System

### Listening to Events

```typescript
// In renderer process
window.electron.ipcRenderer.on('terminal:data', (event, data) => {
  console.log(`Terminal ${data.id} output:`, data.data)
})

// Remove listener
window.electron.ipcRenderer.removeAllListeners('terminal:data')
```

### Available Events

| Event | Description | Data |
|-------|-------------|------|
| `terminal:data` | Terminal output | `{id, data}` |
| `terminal:exit` | Terminal closed | `{id, exitCode, signal}` |
| `ai:stream` | Streaming AI response | `{chunk, done, model}` |
| `system:result` | System action result | Varies |
| `error` | General error | `{message, code}` |

## Error Handling

All IPC calls can throw errors. Handle them appropriately:

```typescript
try {
  const result = await window.electron.ipcRenderer.invoke('ai:query', query)
} catch (error) {
  console.error('AI query failed:', error)
  // Show user-friendly error message
}
```

Common error codes:
- `TERMINAL_NOT_FOUND` - Invalid terminal ID
- `AI_MODEL_NOT_AVAILABLE` - Model not installed
- `SYSTEM_ACTION_FAILED` - System control failed
- `PERMISSION_DENIED` - Missing permissions

## Security Considerations

1. All IPC calls are validated in the main process
2. No direct Node.js access from renderer
3. System commands are sandboxed
4. AppleScript requires user permission
5. File system access is restricted

## Rate Limiting

Some APIs have rate limits:
- AI queries: 10 per minute per model
- System commands: 30 per minute
- Terminal creation: 10 active terminals

## Best Practices

1. **Always handle errors** - IPC calls can fail
2. **Clean up listeners** - Remove event listeners when done
3. **Validate inputs** - Check data before sending
4. **Use TypeScript** - For type safety
5. **Cache when possible** - Reduce IPC calls
6. **Stream large data** - Use events for big responses