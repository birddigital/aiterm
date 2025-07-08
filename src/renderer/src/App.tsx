import { useState, useEffect, useCallback } from 'react'
import { Terminal } from './components/Terminal'
import { CommandPalette } from './components/CommandPalette'
import { AIPanel } from './components/AIPanel'
import { StatusBar } from './components/StatusBar'
import { useTerminalStore } from './stores/terminal-store'
import { useAIStore } from './stores/ai-store'
import './App.css'

function App(): JSX.Element {
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false)
  const { activeTerminal, terminals } = useTerminalStore()
  const { isAIPanelOpen } = useAIStore()

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K for command palette
      if (e.metaKey && e.key === 'k') {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
      
      // Cmd+Shift+P for command palette (VS Code users)
      if (e.metaKey && e.shiftKey && e.key === 'P') {
        e.preventDefault()
        setCommandPaletteOpen(true)
      }
      
      // Cmd+Space for quick AI
      if (e.metaKey && e.key === ' ') {
        e.preventDefault()
        window.electron.ipcRenderer.invoke('ai:quick-query')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <div className="app">
      <div className="app-header">
        <div className="traffic-lights" />
        <div className="tabs">
          {terminals.map((term) => (
            <div
              key={term.id}
              className={`tab ${activeTerminal === term.id ? 'active' : ''}`}
              onClick={() => useTerminalStore.getState().setActiveTerminal(term.id)}
            >
              {term.title}
            </div>
          ))}
          <button
            className="tab-add"
            onClick={() => useTerminalStore.getState().createTerminal()}
          >
            +
          </button>
        </div>
      </div>

      <div className="app-body">
        <div className="terminal-container">
          <Terminal />
        </div>
        
        {isAIPanelOpen && (
          <div className="ai-panel-container">
            <AIPanel />
          </div>
        )}
      </div>

      <StatusBar />
      
      <CommandPalette
        open={commandPaletteOpen}
        onOpenChange={setCommandPaletteOpen}
      />
    </div>
  )
}

export default App