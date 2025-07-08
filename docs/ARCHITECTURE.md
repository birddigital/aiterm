# AITerm Architecture

## Overview

AITerm is built on Electron with a clear separation between main and renderer processes. This document describes the system architecture, data flow, and key design decisions.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          AITerm Application                      │
├─────────────────────────┬───────────────────────────────────────┤
│     Main Process        │         Renderer Process               │
│      (Node.js)          │         (Chromium/React)              │
├─────────────────────────┼───────────────────────────────────────┤
│                         │                                        │
│  ┌─────────────────┐    │    ┌─────────────────┐               │
│  │ Terminal        │    │    │ React UI        │               │
│  │ Manager         │◄───┼────┤ Components      │               │
│  └─────────────────┘    │    └─────────────────┘               │
│           │             │             │                          │
│  ┌─────────────────┐    │    ┌─────────────────┐               │
│  │ AI              │    │    │ Command         │               │
│  │ Orchestrator    │◄───┼────┤ Palette         │               │
│  └─────────────────┘    │    └─────────────────┘               │
│           │             │             │                          │
│  ┌─────────────────┐    │    ┌─────────────────┐               │
│  │ System          │    │    │ Terminal        │               │
│  │ Controller      │◄───┼────┤ Display         │               │
│  └─────────────────┘    │    └─────────────────┘               │
│           │             │             │                          │
│  ┌─────────────────┐    │    ┌─────────────────┐               │
│  │ Raycast         │    │    │ State           │               │
│  │ Adapter         │◄───┼────┤ Management      │               │
│  └─────────────────┘    │    └─────────────────┘               │
│                         │                                        │
└─────────────────────────┴───────────────────────────────────────┘
                                      ▲
                                      │ IPC
                                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                      External Services                           │
├─────────────────┬─────────────────┬─────────────────────────────┤
│     Ollama      │     System      │      File System            │
│   (AI Models)   │   (AppleScript) │    (Config/Extensions)      │
└─────────────────┴─────────────────┴─────────────────────────────┘
```

## Core Components

### Main Process Components

#### 1. Terminal Manager (`terminal-manager.ts`)
```
┌─────────────────────────────────────┐
│         Terminal Manager            │
├─────────────────────────────────────┤
│ - Terminal Creation                 │
│ - PTY Process Management            │
│ - I/O Stream Handling               │
│ - Terminal Lifecycle                │
├─────────────────────────────────────┤
│ Dependencies:                       │
│ - node-pty                          │
│ - EventEmitter                      │
└─────────────────────────────────────┘
                 │
                 ▼
        ┌─────────────────┐
        │   PTY Process   │
        │   (zsh/bash)    │
        └─────────────────┘
```

**Responsibilities:**
- Spawns and manages terminal processes
- Handles terminal I/O streams
- Manages terminal resize events
- Tracks terminal sessions by ID

#### 2. AI Orchestrator (`ai-orchestrator.ts`)
```
┌─────────────────────────────────────┐
│          AI Orchestrator            │
├─────────────────────────────────────┤
│ - Model Selection                   │
│ - Query Routing                     │
│ - Context Enhancement               │
│ - Response Streaming                │
├─────────────────────────────────────┤
│ Models:                             │
│ - Llama 3.2 70B                     │
│ - Code Llama 34B                    │
│ - Mixtral 8x7B                      │
│ - Phi-3 Mini                        │
└─────────────────────────────────────┘
                 │
                 ▼
        ┌─────────────────┐
        │     Ollama      │
        │   (localhost)   │
        └─────────────────┘
```

**Responsibilities:**
- Connects to local Ollama instance
- Routes queries to appropriate models
- Manages model context and memory
- Handles streaming responses

#### 3. System Controller (`system-controller.ts`)
```
┌─────────────────────────────────────┐
│         System Controller           │
├─────────────────────────────────────┤
│ - AppleScript Execution             │
│ - Shell Command Running             │
│ - Window Management                 │
│ - Keypress Simulation               │
└─────────────────────────────────────┘
                 │
    ┌────────────┴────────────┐
    ▼                         ▼
┌─────────────┐       ┌─────────────┐
│ AppleScript │       │    Shell    │
│   Engine    │       │  Commands   │
└─────────────┘       └─────────────┘
```

### Renderer Process Components

#### UI Component Hierarchy
```
App.tsx
├── CommandPalette.tsx
│   ├── Command Items
│   └── Search/Filter Logic
├── Terminal.tsx
│   ├── XTerm Instance
│   ├── Fit Addon
│   ├── Search Addon
│   └── WebLinks Addon
├── AIPanel.tsx
│   ├── Query Input
│   ├── Response Display
│   └── History View
└── StatusBar.tsx
    ├── Terminal Info
    └── AI Status
```

### State Management

```
┌─────────────────────────────────────┐
│            Zustand Stores           │
├──────────────┬──────────────────────┤
│ TerminalStore│      AIStore         │
├──────────────┼──────────────────────┤
│ - terminals  │ - isAIPanelOpen      │
│ - activeId   │ - currentQuery       │
│ - create()   │ - queryHistory       │
│ - close()    │ - activeModel        │
└──────────────┴──────────────────────┘
```

## Data Flow

### Terminal Data Flow
```
User Input → Terminal Component → IPC → Terminal Manager → PTY Process
                                                              │
                                                              ▼
User Display ← Terminal Component ← IPC ← Terminal Manager ← Output
```

### AI Query Flow
```
1. User triggers AI command
2. UI captures context (terminal output, cwd, etc.)
3. IPC call to main process
4. AI Orchestrator selects model
5. Query sent to Ollama
6. Response streamed back
7. UI displays response
```

### IPC Communication

```
┌─────────────┐         ┌─────────────┐
│   Renderer  │   IPC   │    Main     │
│   Process   │ <-----> │   Process   │
└─────────────┘         └─────────────┘

Channels:
- terminal:*  (create, write, resize, close)
- ai:*        (query, explain-error, suggest)
- system:*    (control, execute)
- raycast:*   (execute, list-extensions)
```

## Security Architecture

### Process Isolation
```
┌─────────────────────────────────────┐
│         Renderer Process            │
│      (Sandboxed, No Node.js)       │
├─────────────────────────────────────┤
│ - contextIsolation: true            │
│ - nodeIntegration: false            │
│ - sandbox: false (for preload)      │
└─────────────────────────────────────┘
                 │
                 │ Preload Bridge
                 ▼
┌─────────────────────────────────────┐
│          Main Process               │
│    (Full Node.js Access)            │
├─────────────────────────────────────┤
│ - File System Access                │
│ - System API Access                 │
│ - Process Spawning                  │
└─────────────────────────────────────┘
```

### IPC Security
- All IPC handlers validate inputs
- No direct code execution from renderer
- System commands are sanitized
- File paths are validated

## Performance Considerations

### Rendering Pipeline
```
Terminal Output → Buffering → Throttling → XTerm Render
                     │            │
                     ▼            ▼
               (Batch Updates) (60 FPS Max)
```

### AI Response Handling
```
Ollama Stream → Chunk Buffer → Debounced UI Update
                     │               │
                     ▼               ▼
               (Accumulate)    (Update Every 100ms)
```

## Extension System

### Raycast Compatibility Layer
```
┌─────────────────────────────────────┐
│      Raycast Extension API          │
├─────────────────────────────────────┤
│ - List Component                    │
│ - Action Component                  │
│ - Form Component                    │
│ - API Compatibility                 │
└─────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────┐
│        AITerm Adapter               │
├─────────────────────────────────────┤
│ - API Translation                   │
│ - Component Mapping                 │
│ - Event Bridging                    │
└─────────────────────────────────────┘
```

## Configuration System

### File Structure
```
~/Library/Application Support/AITerm/
├── config.json         # General settings
├── models.json         # AI model configs
├── themes/             # Custom themes
│   └── custom.json
└── extensions/         # Installed extensions
    ├── extension-1/
    └── extension-2/
```

### Configuration Flow
```
App Start → Load Configs → Merge Defaults → Apply Settings
                              │
                              ▼
                     Watch for Changes → Hot Reload
```

## Build System

### Development Build
```
electron-vite dev
      │
      ├── Main Process (esbuild)
      ├── Preload (esbuild)
      └── Renderer (Vite + React)
```

### Production Build
```
electron-vite build → electron-builder
      │                      │
      ▼                      ▼
  Optimized JS          Platform Packages
                        (.dmg, .app, .zip)
```

## Future Architecture Considerations

### Planned Enhancements
1. **Plugin System**: Dynamic loading of extensions
2. **Remote AI**: Support for cloud AI services
3. **Collaboration**: Multi-user terminal sessions
4. **Cloud Sync**: Settings and history sync

### Scalability Points
- Terminal manager can handle 100+ sessions
- AI queries are queued and rate-limited
- UI virtualization for large outputs
- Lazy loading for extensions

## Design Decisions

### Why Electron?
- Cross-platform potential
- Native system access
- Web technologies for UI
- Strong ecosystem

### Why Local AI?
- Privacy-first approach
- No internet dependency
- Fast response times
- Full control over models

### Why TypeScript?
- Type safety
- Better IDE support
- Easier refactoring
- Self-documenting code

### Why Zustand?
- Simple state management
- TypeScript friendly
- Small bundle size
- No boilerplate