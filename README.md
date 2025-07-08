# AITerm - AI-Powered Terminal Emulator

AITerm is a next-generation terminal emulator that seamlessly integrates AI capabilities, system automation, and Raycast compatibility into a unified development environment.

## Features

### 🤖 AI Integration
- **Local AI Models** - Runs Llama 3.2 70B, Code Llama 34B, and more on Apple Silicon
- **Contextual Assistance** - AI understands your terminal context and provides relevant help
- **Natural Language Commands** - Execute complex tasks with simple descriptions
- **Multi-Model Support** - Automatically routes queries to the best model

### 🖥️ Terminal Excellence
- **GPU-Accelerated Rendering** - Smooth performance with xterm.js
- **Multi-Tab & Split Panes** - Organize your workflow efficiently
- **Theme Support** - Beautiful Tokyo Night theme by default
- **Full PTY Support** - Works with all your favorite shells

### 🎯 Command Palette
- **Raycast-Style Interface** - Fast, fuzzy search for all commands
- **AI Commands** - Explain errors, suggest commands, review code
- **System Control** - Arrange windows, manage processes, automate tasks
- **Extensible** - Easy to add custom commands

### 🔧 System Automation
- **Accessibility API Integration** - Control any macOS application
- **AppleScript Bridge** - Execute system automation scripts
- **Window Management** - Intelligent window arrangement for different workflows
- **Cross-App Workflows** - Coordinate actions across multiple applications

### 🔌 Raycast Compatibility
- **Extension Support** - Run existing Raycast extensions
- **API Compatibility** - Implements Raycast API for seamless migration
- **Custom Extensions** - Build your own extensions with familiar APIs

## Installation

### Prerequisites
- macOS 12.0 or later
- Node.js 18+ and npm
- Ollama for local AI models

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/aiterm.git
   cd aiterm
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Ollama and models**
   ```bash
   brew install ollama
   ollama pull llama3.2:70b
   ollama pull codellama:34b
   ```

4. **Run in development**
   ```bash
   npm run dev
   ```

5. **Build for production**
   ```bash
   npm run build
   ```

## Usage

### Keyboard Shortcuts
- `⌘K` - Open command palette
- `⌘Space` - Quick AI query
- `⌘T` - New terminal tab
- `⌘D` - Split terminal pane
- `⌘⇧P` - Command palette (VS Code style)

### AI Commands
Type in the command palette or terminal:
- `ai: explain last error` - Get AI explanation of recent errors
- `ai: suggest command` - Get command suggestions based on context
- `ai: optimize this dockerfile` - Analyze and improve files
- `ai: what's on my screen?` - AI describes visible content

### System Control
- `arrange windows for coding` - Optimal development layout
- `close distracting apps` - Focus mode
- `show me all files I worked on yesterday` - Cross-app search

## Architecture

```
aiterm/
├── src/
│   ├── main/              # Electron main process
│   │   ├── ai-orchestrator.ts
│   │   ├── terminal-manager.ts
│   │   ├── system-controller.ts
│   │   └── raycast-adapter.ts
│   ├── renderer/          # React UI
│   │   ├── components/
│   │   ├── stores/
│   │   └── App.tsx
│   └── preload/          # Preload scripts
├── electron.vite.config.ts
└── package.json
```

## Configuration

AITerm stores configuration in `~/Library/Application Support/AITerm/`:
- `config.json` - General settings
- `models.json` - AI model configurations
- `extensions/` - Installed extensions

## Development

### Adding AI Models
```typescript
// In ai-orchestrator.ts
this.models.set('new-model:size', {
  id: 'new-model:size',
  name: 'Model Name',
  size: 'XXB',
  capabilities: ['general', 'coding'],
  contextLength: 128000
})
```

### Creating Commands
```typescript
// In CommandPalette.tsx
commands.push({
  id: 'my-command',
  title: 'My Custom Command',
  subtitle: 'Description',
  category: 'Custom',
  icon: <IconComponent />,
  action: async () => {
    // Command logic
  }
})
```

### Building Extensions
```javascript
// Raycast-compatible extension
export default function Command() {
  return (
    <List>
      <List.Item 
        title="My Extension"
        actions={
          <ActionPanel>
            <Action title="Run" onAction={() => {}} />
          </ActionPanel>
        }
      />
    </List>
  )
}
```

## Performance

Optimized for Apple Silicon Macs:
- **M1 Max 64GB** - Run 70B models with 30-50 tokens/sec
- **M1 Pro 32GB** - Run 34B models comfortably
- **M1 16GB** - Run 7-13B models

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built on [Tabby](https://github.com/Eugeny/tabby) terminal architecture
- Uses [cmdk](https://github.com/pacocoursey/cmdk) for command palette
- Powered by [Ollama](https://ollama.ai) for local AI
- Inspired by [Raycast](https://raycast.com) design principles