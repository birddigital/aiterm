import { create } from 'zustand'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface AIStore {
  messages: Message[]
  isAIPanelOpen: boolean
  activeModel: string
  addMessage: (message: Message) => void
  clearMessages: () => void
  togglePanel: () => void
  setActiveModel: (model: string) => void
}

export const useAIStore = create<AIStore>((set) => ({
  messages: [],
  isAIPanelOpen: true,
  activeModel: 'llama3.2:70b',

  addMessage: (message) => {
    set((state) => ({
      messages: [...state.messages, message]
    }))
  },

  clearMessages: () => {
    set({ messages: [] })
  },

  togglePanel: () => {
    set((state) => ({
      isAIPanelOpen: !state.isAIPanelOpen
    }))
  },

  setActiveModel: (model) => {
    set({ activeModel: model })
    window.electron.ipcRenderer.invoke('ai:switch-model', model)
  }
}))