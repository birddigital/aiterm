import { useEffect, useRef } from 'react'
import { Terminal as XTerm } from 'xterm'
import { FitAddon } from 'xterm-addon-fit'
import { SearchAddon } from 'xterm-addon-search'
import { WebLinksAddon } from 'xterm-addon-web-links'
import { useTerminalStore } from '../stores/terminal-store'
import 'xterm/css/xterm.css'

export function Terminal() {
  const terminalRef = useRef<HTMLDivElement>(null)
  const xtermRef = useRef<XTerm | null>(null)
  const fitAddonRef = useRef<FitAddon | null>(null)
  
  const { activeTerminal } = useTerminalStore()

  useEffect(() => {
    if (!terminalRef.current || !activeTerminal) return

    // Create XTerm instance
    const xterm = new XTerm({
      theme: {
        background: '#1a1b26',
        foreground: '#a9b1d6',
        cursor: '#c0caf5',
        black: '#15161e',
        red: '#f7768e',
        green: '#9ece6a',
        yellow: '#e0af68',
        blue: '#7aa2f7',
        magenta: '#bb9af7',
        cyan: '#7dcfff',
        white: '#a9b1d6',
        brightBlack: '#414868',
        brightRed: '#f7768e',
        brightGreen: '#9ece6a',
        brightYellow: '#e0af68',
        brightBlue: '#7aa2f7',
        brightMagenta: '#bb9af7',
        brightCyan: '#7dcfff',
        brightWhite: '#c0caf5'
      },
      fontFamily: 'JetBrains Mono, Menlo, Monaco, monospace',
      fontSize: 14,
      lineHeight: 1.2,
      cursorBlink: true,
      cursorStyle: 'block',
      scrollback: 10000,
      allowTransparency: true
    })

    // Add addons
    const fitAddon = new FitAddon()
    const searchAddon = new SearchAddon()
    const webLinksAddon = new WebLinksAddon()
    
    xterm.loadAddon(fitAddon)
    xterm.loadAddon(searchAddon)
    xterm.loadAddon(webLinksAddon)

    // Open terminal in DOM
    xterm.open(terminalRef.current)
    fitAddon.fit()

    // Store references
    xtermRef.current = xterm
    fitAddonRef.current = fitAddon

    // Connect to backend terminal
    window.electron.ipcRenderer.on(`terminal-data-${activeTerminal}`, (_, data) => {
      xterm.write(data)
    })

    // Send input to backend
    xterm.onData((data) => {
      window.electron.ipcRenderer.send(`terminal-input-${activeTerminal}`, data)
    })

    // Handle resize
    const handleResize = () => {
      fitAddon.fit()
      const { cols, rows } = xterm
      window.electron.ipcRenderer.send(`terminal-resize-${activeTerminal}`, { cols, rows })
    }

    window.addEventListener('resize', handleResize)

    // Context menu for copy/paste
    xterm.attachCustomKeyEventHandler((event) => {
      if (event.metaKey && event.key === 'v' && event.type === 'keydown') {
        navigator.clipboard.readText().then(text => {
          xterm.paste(text)
        })
        return false
      }
      if (event.metaKey && event.key === 'c' && event.type === 'keydown') {
        const selection = xterm.getSelection()
        if (selection) {
          navigator.clipboard.writeText(selection)
          return false
        }
      }
      return true
    })

    return () => {
      window.removeEventListener('resize', handleResize)
      xterm.dispose()
    }
  }, [activeTerminal])

  return (
    <div className="terminal-wrapper">
      <div ref={terminalRef} className="terminal" />
    </div>
  )
}