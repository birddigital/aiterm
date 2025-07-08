# Changelog

All notable changes to AITerm will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of AITerm
- Core terminal emulator with xterm.js integration
- AI integration with Ollama support
  - Llama 3.2 70B model
  - Code Llama 34B model
  - Mixtral 8x7B model
  - Phi-3 Mini model
- Raycast-style command palette with fuzzy search
- System automation capabilities
  - AppleScript execution
  - Shell command execution
  - Window management
  - Cross-application workflows
- Multi-tab terminal support
- Tokyo Night theme
- Keyboard shortcuts
  - `⌘K` - Open command palette
  - `⌘Space` - Quick AI query
  - `⌘T` - New terminal tab
  - `⌘D` - Split terminal pane
- AI Commands
  - Explain last error
  - Suggest command based on context
  - Code review
  - Optimize code
- Raycast extension compatibility layer
- Configuration system
- Search functionality in terminals
- Web link detection and clicking
- GPU-accelerated rendering

### Technical Details
- Built with Electron + React + TypeScript
- Uses Zustand for state management
- IPC-based architecture for security
- node-pty for terminal emulation
- cmdk for command palette
- Optimized for Apple Silicon Macs

## [0.1.0] - TBD

### Planned
- Settings UI
- Theme customization
- Extension marketplace
- Cloud sync for settings
- Terminal profiles
- SSH integration
- More AI models
- Performance optimizations

---

## Version History Format

### [Version] - YYYY-MM-DD

#### Added
- New features

#### Changed
- Changes in existing functionality

#### Deprecated
- Soon-to-be removed features

#### Removed
- Removed features

#### Fixed
- Bug fixes

#### Security
- Security vulnerability fixes