# AITerm Configuration Guide

This guide covers all configuration options available in AITerm.

## Configuration Files

AITerm stores configuration in `~/Library/Application Support/AITerm/`:

```
~/Library/Application Support/AITerm/
├── config.json         # General settings
├── models.json         # AI model configurations
├── themes/             # Custom themes
├── extensions/         # Installed extensions
├── keybindings.json    # Custom keyboard shortcuts
└── profiles/           # Terminal profiles
```

## General Configuration (config.json)

### Default Configuration
```json
{
  "version": "1.0.0",
  "general": {
    "theme": "tokyo-night",
    "startupBehavior": "restore-last-session",
    "autoUpdate": true,
    "telemetry": false
  },
  "terminal": {
    "defaultShell": "/bin/zsh",
    "fontSize": 14,
    "fontFamily": "JetBrains Mono",
    "lineHeight": 1.2,
    "cursorStyle": "block",
    "cursorBlink": true,
    "scrollback": 10000,
    "copyOnSelect": true,
    "pasteOnMiddleClick": false
  },
  "ai": {
    "defaultModel": "llama3.2:70b",
    "temperature": 0.7,
    "maxTokens": 2048,
    "streamResponses": true,
    "contextLength": 4096
  },
  "appearance": {
    "windowStyle": "hiddenTitleBar",
    "tabPosition": "top",
    "sidebarPosition": "right",
    "compactMode": false
  },
  "performance": {
    "gpuAcceleration": true,
    "renderingBackend": "webgl",
    "maxTerminals": 50
  }
}
```

### Configuration Options

#### General Settings
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `theme` | string | "tokyo-night" | UI theme |
| `startupBehavior` | string | "restore-last-session" | What to do on startup |
| `autoUpdate` | boolean | true | Automatically check for updates |
| `telemetry` | boolean | false | Send anonymous usage data |

#### Terminal Settings
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `defaultShell` | string | $SHELL | Shell to use for new terminals |
| `fontSize` | number | 14 | Terminal font size |
| `fontFamily` | string | "JetBrains Mono" | Terminal font family |
| `cursorStyle` | string | "block" | Cursor style: block, underline, bar |
| `scrollback` | number | 10000 | Lines of scrollback buffer |

## AI Model Configuration (models.json)

### Model Definitions
```json
{
  "models": [
    {
      "id": "llama3.2:70b",
      "name": "Llama 3.2 70B",
      "provider": "ollama",
      "capabilities": ["general", "coding", "analysis"],
      "contextLength": 128000,
      "priority": 1,
      "fallback": "mixtral:8x7b"
    },
    {
      "id": "codellama:34b",
      "name": "Code Llama 34B",
      "provider": "ollama",
      "capabilities": ["coding", "debugging", "refactoring"],
      "contextLength": 100000,
      "priority": 2
    }
  ],
  "routing": {
    "coding": "codellama:34b",
    "general": "llama3.2:70b",
    "fast": "phi-3:mini"
  }
}
```

### Custom Model Configuration
```json
{
  "id": "custom-model",
  "name": "My Custom Model",
  "provider": "ollama",
  "endpoint": "http://localhost:11434",
  "capabilities": ["custom"],
  "parameters": {
    "temperature": 0.8,
    "top_p": 0.95,
    "repeat_penalty": 1.1
  }
}
```

## Theme Configuration

### Creating Custom Themes
Create a file in `~/Library/Application Support/AITerm/themes/my-theme.json`:

```json
{
  "name": "My Custom Theme",
  "type": "dark",
  "colors": {
    "terminal": {
      "background": "#1e1e1e",
      "foreground": "#d4d4d4",
      "cursor": "#ffffff",
      "selection": "#264f78",
      "black": "#000000",
      "red": "#cd3131",
      "green": "#0dbc79",
      "yellow": "#e5e510",
      "blue": "#2472c8",
      "magenta": "#bc3fbc",
      "cyan": "#11a8cd",
      "white": "#e5e5e5",
      "brightBlack": "#666666",
      "brightRed": "#f14c4c",
      "brightGreen": "#23d18b",
      "brightYellow": "#f5f543",
      "brightBlue": "#3b8eea",
      "brightMagenta": "#d670d6",
      "brightCyan": "#29b8db",
      "brightWhite": "#e5e5e5"
    },
    "ui": {
      "background": "#252526",
      "foreground": "#cccccc",
      "border": "#464647",
      "activeTab": "#1e1e1e",
      "inactiveTab": "#2d2d30",
      "highlight": "#094771",
      "buttonBackground": "#0e639c",
      "buttonForeground": "#ffffff"
    }
  }
}
```

### Applying Themes
```bash
# Via settings UI
Settings > Appearance > Theme

# Via command palette
Cmd+K > "Change Theme"

# Via config file
Edit config.json: "theme": "my-custom-theme"
```

## Keyboard Shortcuts (keybindings.json)

### Default Keybindings
```json
{
  "keybindings": [
    {
      "key": "cmd+k",
      "command": "openCommandPalette"
    },
    {
      "key": "cmd+t",
      "command": "newTerminalTab"
    },
    {
      "key": "cmd+d",
      "command": "splitTerminal"
    },
    {
      "key": "cmd+space",
      "command": "quickAI"
    },
    {
      "key": "cmd+shift+p",
      "command": "openCommandPalette"
    }
  ]
}
```

### Custom Keybindings
```json
{
  "key": "cmd+shift+g",
  "command": "extension.git-quick-commit",
  "when": "terminalFocus"
}
```

### Keybinding Conditions
- `terminalFocus` - When terminal has focus
- `aiPanelOpen` - When AI panel is visible
- `commandPaletteOpen` - When command palette is open
- `platform.mac` - Only on macOS

## Terminal Profiles

### Creating Profiles
Save in `~/Library/Application Support/AITerm/profiles/`:

```json
{
  "name": "Node Development",
  "shell": "/bin/zsh",
  "env": {
    "NODE_ENV": "development",
    "PATH": "/usr/local/bin:$PATH"
  },
  "cwd": "~/projects",
  "startupCommand": "nvm use default && clear",
  "fontSize": 16,
  "theme": "monokai"
}
```

### Using Profiles
```bash
# Via command palette
Cmd+K > "New Terminal with Profile"

# Via API
await createTerminal({ profile: 'node-development' })
```

## Environment Variables

AITerm respects these environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| `AITERM_CONFIG_DIR` | Configuration directory | `~/Library/Application Support/AITerm` |
| `AITERM_THEME` | Override theme | config.json value |
| `AITERM_AI_MODEL` | Override default AI model | config.json value |
| `OLLAMA_HOST` | Ollama server URL | `http://localhost:11434` |
| `AITERM_LOG_LEVEL` | Logging level | "info" |

## Performance Tuning

### For Large Terminals
```json
{
  "performance": {
    "gpuAcceleration": true,
    "renderingBackend": "webgl",
    "scrollback": 5000,
    "trimEmptyLines": true,
    "fastScrolling": true
  }
}
```

### For Many Terminals
```json
{
  "performance": {
    "maxTerminals": 100,
    "lazyRender": true,
    "throttleUpdates": 16,
    "virtualizeInactiveTabs": true
  }
}
```

### For AI Performance
```json
{
  "ai": {
    "cacheResponses": true,
    "maxCacheSize": 100,
    "batchRequests": true,
    "timeout": 30000
  }
}
```

## Security Configuration

### Restricted Mode
```json
{
  "security": {
    "restrictedMode": true,
    "allowedCommands": ["ls", "cd", "pwd", "git"],
    "blockedPatterns": ["rm -rf", "sudo"],
    "sandboxExtensions": true
  }
}
```

### Extension Permissions
```json
{
  "extensions": {
    "my-extension": {
      "permissions": {
        "terminal": "read",
        "ai": true,
        "system": false,
        "network": ["localhost"]
      }
    }
  }
}
```

## Backup and Sync

### Manual Backup
```bash
# Backup all settings
cp -r ~/Library/Application\ Support/AITerm ~/Desktop/aiterm-backup

# Restore settings
cp -r ~/Desktop/aiterm-backup/* ~/Library/Application\ Support/AITerm/
```

### Cloud Sync (Coming Soon)
```json
{
  "sync": {
    "enabled": true,
    "provider": "icloud",
    "syncSettings": true,
    "syncExtensions": true,
    "syncHistory": false
  }
}
```

## Troubleshooting Configuration

### Reset to Defaults
```bash
# Reset all settings
rm -rf ~/Library/Application\ Support/AITerm
# Restart AITerm

# Reset specific config
rm ~/Library/Application\ Support/AITerm/config.json
```

### Validate Configuration
```bash
# Check config syntax
aiterm validate-config

# Test specific settings
aiterm test-config --theme my-theme
```

### Common Issues

1. **Theme not loading**
   - Check theme file syntax
   - Ensure theme name matches filename
   - Restart AITerm

2. **Keybindings not working**
   - Check for conflicts
   - Verify command exists
   - Check "when" conditions

3. **AI model errors**
   - Verify Ollama is running
   - Check model is installed
   - Validate endpoint URL

## Configuration via CLI

```bash
# Get configuration value
aiterm config get terminal.fontSize

# Set configuration value
aiterm config set terminal.fontSize 16

# List all configurations
aiterm config list

# Export configuration
aiterm config export > my-config.json

# Import configuration
aiterm config import < my-config.json
```

## Advanced Configuration

### Conditional Settings
```json
{
  "conditionalSettings": [
    {
      "condition": "hostname == 'work-mac'",
      "settings": {
        "terminal.fontSize": 12,
        "ai.defaultModel": "codellama:7b"
      }
    }
  ]
}
```

### Profile Inheritance
```json
{
  "profiles": {
    "base": {
      "fontSize": 14,
      "theme": "tokyo-night"
    },
    "development": {
      "extends": "base",
      "env": {
        "NODE_ENV": "development"
      }
    }
  }
}
```

For more configuration options, see the [API Documentation](./API.md).