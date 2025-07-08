import { create } from 'zustand'

interface Terminal {
  id: string
  title: string
  cwd: string
}

interface TerminalStore {
  terminals: Terminal[]
  activeTerminal: string | null
  createTerminal: () => Promise<void>
  closeTerminal: (id: string) => void
  setActiveTerminal: (id: string) => void
  updateTerminalTitle: (id: string, title: string) => void
}

export const useTerminalStore = create<TerminalStore>((set, get) => ({
  terminals: [],
  activeTerminal: null,

  createTerminal: async () => {
    const id = await window.electron.ipcRenderer.invoke('terminal:create')
    const newTerminal: Terminal = {
      id,
      title: 'Terminal',
      cwd: process.env.HOME || '/'
    }
    
    set((state) => ({
      terminals: [...state.terminals, newTerminal],
      activeTerminal: id
    }))
  },

  closeTerminal: (id: string) => {
    window.electron.ipcRenderer.invoke('terminal:close', id)
    
    set((state) => {
      const terminals = state.terminals.filter(t => t.id !== id)
      const activeTerminal = state.activeTerminal === id
        ? terminals[terminals.length - 1]?.id || null
        : state.activeTerminal
      
      return { terminals, activeTerminal }
    })
  },

  setActiveTerminal: (id: string) => {
    set({ activeTerminal: id })
  },

  updateTerminalTitle: (id: string, title: string) => {
    set((state) => ({
      terminals: state.terminals.map(t =>
        t.id === id ? { ...t, title } : t
      )
    }))
  }
}))