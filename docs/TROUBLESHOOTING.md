# AITerm Troubleshooting Guide

This guide helps you resolve common issues with AITerm.

## Table of Contents
- [Installation Issues](#installation-issues)
- [Terminal Problems](#terminal-problems)
- [AI Model Issues](#ai-model-issues)
- [Performance Issues](#performance-issues)
- [Extension Problems](#extension-problems)
- [System Integration Issues](#system-integration-issues)
- [Getting Help](#getting-help)

## Installation Issues

### AITerm won't start

**Symptoms:**
- Application crashes on launch
- No window appears
- Dock icon bounces and disappears

**Solutions:**

1. **Check macOS version**
   ```bash
   sw_vers -productVersion
   # Requires macOS 12.0 or later
   ```

2. **Verify Node.js installation**
   ```bash
   node --version
   # Should be 18.0.0 or higher
   ```

3. **Reset application data**
   ```bash
   rm -rf ~/Library/Application\ Support/AITerm
   rm -rf ~/Library/Caches/com.aiterm.app
   ```

4. **Check crash logs**
   ```bash
   open ~/Library/Logs/DiagnosticReports/
   # Look for AITerm crash reports
   ```

### "App is damaged" error

**Solution:**
```bash
# Remove quarantine attribute
xattr -cr /Applications/AITerm.app

# If that doesn't work, reinstall
rm -rf /Applications/AITerm.app
# Download and install fresh copy
```

## Terminal Problems

### Terminal not responding

**Symptoms:**
- Can't type in terminal
- Commands don't execute
- Cursor not visible

**Solutions:**

1. **Check terminal process**
   ```bash
   # In another terminal
   ps aux | grep AITerm
   ```

2. **Reset terminal state**
   - Press `Cmd+R` to reset current terminal
   - Close and reopen terminal tab

3. **Check shell configuration**
   ```bash
   # Verify shell exists
   which $SHELL
   
   # Test shell directly
   /bin/zsh -l
   ```

### Colors/formatting incorrect

**Symptoms:**
- ANSI colors not showing
- Text formatting broken
- Unicode characters corrupted

**Solutions:**

1. **Check TERM environment**
   ```bash
   echo $TERM
   # Should be: xterm-256color
   ```

2. **Reset terminal profile**
   ```json
   // In config.json
   {
     "terminal": {
       "termType": "xterm-256color",
       "unicodeVersion": "11"
     }
   }
   ```

3. **Update shell configuration**
   ```bash
   # Add to ~/.zshrc or ~/.bashrc
   export TERM=xterm-256color
   export LANG=en_US.UTF-8
   ```

## AI Model Issues

### Ollama connection failed

**Symptoms:**
- "Failed to connect to Ollama" error
- AI features not working
- Model list empty

**Solutions:**

1. **Start Ollama service**
   ```bash
   # Check if running
   curl http://localhost:11434/api/tags
   
   # Start Ollama
   ollama serve
   ```

2. **Install Ollama**
   ```bash
   # If not installed
   brew install ollama
   ```

3. **Check port availability**
   ```bash
   lsof -i :11434
   # Should show ollama process
   ```

### Model not found

**Symptoms:**
- "Model not installed" error
- AI queries fail

**Solutions:**

1. **Pull required model**
   ```bash
   ollama pull llama3.2:70b
   ollama pull codellama:34b
   ```

2. **List available models**
   ```bash
   ollama list
   ```

3. **Check model configuration**
   ```json
   // In models.json
   {
     "defaultModel": "llama3.2:70b",
     "fallbackModel": "phi-3:mini"
   }
   ```

### AI responses slow

**Solutions:**

1. **Check system resources**
   ```bash
   # Memory usage
   top -l 1 | grep PhysMem
   
   # GPU usage (M1/M2)
   sudo powermetrics --samplers gpu_power
   ```

2. **Use smaller model**
   ```json
   {
     "ai": {
       "defaultModel": "phi-3:mini"
     }
   }
   ```

3. **Adjust model parameters**
   ```json
   {
     "ai": {
       "maxTokens": 1024,
       "temperature": 0.5
     }
   }
   ```

## Performance Issues

### High CPU usage

**Solutions:**

1. **Limit terminal output**
   ```json
   {
     "performance": {
       "scrollback": 5000,
       "throttleUpdates": 32
     }
   }
   ```

2. **Disable GPU acceleration** (if causing issues)
   ```json
   {
     "performance": {
       "gpuAcceleration": false,
       "renderingBackend": "canvas"
     }
   }
   ```

3. **Close unused terminals**
   - Set maximum terminal limit
   - Enable virtual scrolling

### Memory leaks

**Symptoms:**
- Memory usage grows over time
- Application becomes sluggish

**Solutions:**

1. **Enable memory limits**
   ```json
   {
     "performance": {
       "maxMemoryMB": 2048,
       "gcInterval": 300000
     }
   }
   ```

2. **Clear caches periodically**
   ```bash
   # Via command palette
   Cmd+K > "Clear All Caches"
   ```

## Extension Problems

### Extension won't load

**Solutions:**

1. **Check extension compatibility**
   ```bash
   aiterm extensions doctor my-extension
   ```

2. **Reinstall extension**
   ```bash
   aiterm uninstall my-extension
   aiterm install my-extension
   ```

3. **Check extension logs**
   ```bash
   tail -f ~/Library/Logs/AITerm/extensions.log
   ```

### Extension crashes AITerm

**Solutions:**

1. **Safe mode**
   ```bash
   aiterm --safe-mode
   # Disables all extensions
   ```

2. **Disable specific extension**
   ```json
   {
     "extensions": {
       "disabled": ["problematic-extension"]
     }
   }
   ```

## System Integration Issues

### AppleScript not working

**Symptoms:**
- System automation fails
- Permission errors

**Solutions:**

1. **Grant permissions**
   - System Preferences > Security & Privacy > Privacy
   - Add AITerm to Accessibility

2. **Test AppleScript directly**
   ```bash
   osascript -e 'tell application "Finder" to activate'
   ```

### Command palette shortcuts conflict

**Solutions:**

1. **Check for conflicts**
   ```bash
   # List all shortcuts
   aiterm shortcuts list
   ```

2. **Remap shortcuts**
   ```json
   {
     "keybindings": [
       {
         "key": "cmd+shift+p",
         "command": "openCommandPalette"
       }
     ]
   }
   ```

## Diagnostic Tools

### Built-in diagnostics
```bash
# Run diagnostic tests
aiterm doctor

# Generate diagnostic report
aiterm diagnostic-report > ~/Desktop/aiterm-diagnosis.txt
```

### Debug mode
```bash
# Start with debug logging
aiterm --debug

# Enable verbose logging
export AITERM_LOG_LEVEL=debug
```

### Developer tools
- Press `Cmd+Option+I` to open DevTools
- Check Console for errors
- Monitor Network tab for AI requests

## Common Error Messages

### "EACCES: permission denied"
```bash
# Fix permissions
sudo chown -R $(whoami) ~/Library/Application\ Support/AITerm
```

### "ENOSPC: no space left"
```bash
# Clear caches
rm -rf ~/Library/Caches/com.aiterm.app
```

### "Module not found"
```bash
# Reinstall dependencies
cd /Applications/AITerm.app/Contents/Resources/app
npm install --production
```

## Getting Help

### Before reporting an issue:

1. **Check existing issues**
   - [GitHub Issues](https://github.com/birddigital/aiterm/issues)

2. **Collect information**
   ```bash
   aiterm --version
   sw_vers -productVersion
   ollama --version
   ```

3. **Create minimal reproduction**
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshots if applicable

### Support channels:

- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: General questions and ideas
- **Discord**: Real-time community support (coming soon)

### Diagnostic information to include:

```bash
# Generate full diagnostic bundle
aiterm diagnostic-bundle

# Includes:
# - System information
# - Configuration files
# - Recent logs
# - Extension list
# - Performance metrics
```

## Emergency Recovery

If AITerm is completely broken:

1. **Safe mode**
   ```bash
   aiterm --safe-mode --reset-config
   ```

2. **Complete reset**
   ```bash
   # Backup first!
   cp -r ~/Library/Application\ Support/AITerm ~/Desktop/aiterm-backup
   
   # Then reset
   rm -rf ~/Library/Application\ Support/AITerm
   rm -rf ~/Library/Caches/com.aiterm.app
   rm -rf ~/Library/Preferences/com.aiterm.app.plist
   ```

3. **Reinstall**
   - Download latest version
   - Remove old app completely
   - Install fresh copy

Remember to check the [documentation](./README.md) and [configuration guide](./CONFIGURATION.md) for additional help.