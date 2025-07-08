import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
const api = {
  // Terminal API
  terminal: {
    create: (options?: any) => ipcRenderer.invoke('terminal:create', options),
    close: (id: string) => ipcRenderer.invoke('terminal:close', id),
    write: (id: string, data: string) => ipcRenderer.send(`terminal-input-${id}`, data),
    resize: (id: string, cols: number, rows: number) => 
      ipcRenderer.send(`terminal-resize-${id}`, { cols, rows }),
    onData: (id: string, callback: (data: string) => void) => {
      ipcRenderer.on(`terminal-data-${id}`, (_, data) => callback(data))
    }
  },

  // AI API
  ai: {
    query: (prompt: string, context?: any) => 
      ipcRenderer.invoke('ai:query', prompt, context),
    stream: (prompt: string, context?: any) => 
      ipcRenderer.invoke('ai:stream', prompt, context),
    switchModel: (model: string) => 
      ipcRenderer.invoke('ai:switch-model', model),
    getModels: () => ipcRenderer.invoke('ai:get-models')
  },

  // System Control API
  system: {
    control: (action: any) => ipcRenderer.invoke('system:control', action),
    getApps: () => ipcRenderer.invoke('system:get-apps'),
    captureScreen: (area?: any) => ipcRenderer.invoke('system:capture-screen', area)
  },

  // Raycast API
  raycast: {
    getExtensions: () => ipcRenderer.invoke('raycast:get-extensions'),
    execute: (extensionId: string, command: string) => 
      ipcRenderer.invoke('raycast:execute', extensionId, command)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}