import { useState, useEffect } from 'react'
import { Command } from 'cmdk'
import Fuse from 'fuse.js'
import { 
  Terminal, 
  Bot, 
  FileText, 
  Settings, 
  Layout, 
  Search,
  Zap,
  Code,
  Monitor
} from 'lucide-react'

interface CommandItem {
  id: string
  title: string
  subtitle?: string
  category: string
  icon: React.ReactNode
  action: () => void | Promise<void>
  keywords?: string[]
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [search, setSearch] = useState('')
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  
  const commands: CommandItem[] = [
    // AI Commands
    {
      id: 'ai-explain-error',
      title: 'Explain Last Error',
      subtitle: 'AI analyzes the most recent error',
      category: 'AI',
      icon: <Bot size={18} />,
      action: async () => {
        await window.electron.ipcRenderer.invoke('ai:explain-error')
        onOpenChange(false)
      }
    },
    {
      id: 'ai-suggest-command',
      title: 'Suggest Command',
      subtitle: 'AI suggests command based on context',
      category: 'AI',
      icon: <Zap size={18} />,
      action: async () => {
        await window.electron.ipcRenderer.invoke('ai:suggest-command')
        onOpenChange(false)
      }
    },
    {
      id: 'ai-code-review',
      title: 'Review Code Changes',
      subtitle: 'AI reviews staged git changes',
      category: 'AI',
      icon: <Code size={18} />,
      action: async () => {
        await window.electron.ipcRenderer.invoke('ai:review-changes')
        onOpenChange(false)
      }
    },
    
    // Terminal Commands
    {
      id: 'terminal-new',
      title: 'New Terminal',
      subtitle: 'Create a new terminal tab',
      category: 'Terminal',
      icon: <Terminal size={18} />,
      action: () => {
        window.electron.ipcRenderer.invoke('terminal:create')
        onOpenChange(false)
      }
    },
    {
      id: 'terminal-split',
      title: 'Split Terminal',
      subtitle: 'Split current terminal pane',
      category: 'Terminal',
      icon: <Layout size={18} />,
      action: () => {
        window.electron.ipcRenderer.invoke('terminal:split')
        onOpenChange(false)
      }
    },
    
    // System Commands
    {
      id: 'system-arrange-windows',
      title: 'Arrange Windows for Coding',
      subtitle: 'Optimize window layout for development',
      category: 'System',
      icon: <Monitor size={18} />,
      action: async () => {
        await window.electron.ipcRenderer.invoke('system:control', {
          type: 'window',
          action: 'arrange-coding'
        })
        onOpenChange(false)
      }
    },
    
    // Settings
    {
      id: 'settings-preferences',
      title: 'Preferences',
      subtitle: 'Open AITerm preferences',
      category: 'Settings',
      icon: <Settings size={18} />,
      action: () => {
        window.electron.ipcRenderer.invoke('open-preferences')
        onOpenChange(false)
      }
    }
  ]

  // Fuzzy search
  const fuse = new Fuse(commands, {
    keys: ['title', 'subtitle', 'keywords'],
    threshold: 0.3
  })

  const filteredCommands = search
    ? fuse.search(search).map(result => result.item)
    : commands

  const categories = Array.from(new Set(commands.map(cmd => cmd.category)))

  return (
    <Command.Dialog
      open={open}
      onOpenChange={onOpenChange}
      label="Command Palette"
      className="command-palette"
    >
      <Command.Input
        placeholder="Type a command or search..."
        value={search}
        onValueChange={setSearch}
      />
      
      <Command.List>
        <Command.Empty>No results found.</Command.Empty>
        
        {categories.map(category => {
          const categoryCommands = filteredCommands.filter(
            cmd => cmd.category === category
          )
          
          if (categoryCommands.length === 0) return null
          
          return (
            <Command.Group key={category} heading={category}>
              {categoryCommands.map(command => (
                <Command.Item
                  key={command.id}
                  value={command.title}
                  onSelect={() => command.action()}
                  className="command-item"
                >
                  <div className="command-icon">{command.icon}</div>
                  <div className="command-content">
                    <div className="command-title">{command.title}</div>
                    {command.subtitle && (
                      <div className="command-subtitle">{command.subtitle}</div>
                    )}
                  </div>
                </Command.Item>
              ))}
            </Command.Group>
          )
        })}
      </Command.List>
    </Command.Dialog>
  )
}