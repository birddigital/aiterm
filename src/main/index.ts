/**
 * Main entry point for AITerm Electron application.
 * Manages the main process, window creation, and IPC handlers.
 */
import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { TerminalManager } from './terminal-manager'
import { AIOrchestrator } from './ai-orchestrator'
import { SystemController } from './system-controller'
import { RaycastAdapter } from './raycast-adapter'

let mainWindow: BrowserWindow | null = null
let terminalManager: TerminalManager
let aiOrchestrator: AIOrchestrator
let systemController: SystemController
let raycastAdapter: RaycastAdapter

/**
 * Creates the main application window with macOS-style UI
 */
function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 20, y: 20 },
    backgroundColor: '#1a1b26',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(async () => {
  electronApp.setAppUserModelId('com.aiterm.app')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // Initialize core services
  terminalManager = new TerminalManager()
  aiOrchestrator = new AIOrchestrator()
  systemController = new SystemController()
  raycastAdapter = new RaycastAdapter()

  // Initialize AI models
  await aiOrchestrator.initialize()

  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC handlers for renderer communication
ipcMain.handle('terminal:create', async (_, options) => {
  return terminalManager.createTerminal(options)
})

ipcMain.handle('ai:query', async (_, prompt, context) => {
  return aiOrchestrator.query(prompt, context)
})

ipcMain.handle('system:control', async (_, action) => {
  return systemController.execute(action)
})

ipcMain.handle('raycast:execute', async (_, extensionId, command) => {
  return raycastAdapter.executeExtension(extensionId, command)
})