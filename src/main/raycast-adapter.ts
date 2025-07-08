import { exec } from 'child_process'
import { promisify } from 'util'
import * as fs from 'fs/promises'
import * as path from 'path'

const execAsync = promisify(exec)

export interface RaycastExtension {
  id: string
  name: string
  description: string
  author: string
  commands: RaycastCommand[]
}

export interface RaycastCommand {
  name: string
  title: string
  subtitle?: string
  description?: string
  mode: 'view' | 'no-view' | 'menu-bar'
}

export class RaycastAdapter {
  private extensionsPath: string
  private extensions: Map<string, RaycastExtension> = new Map()

  constructor() {
    // Path where Raycast extensions are typically stored
    this.extensionsPath = path.join(
      process.env.HOME!,
      'Library/Application Support/com.raycast.macos/extensions'
    )
  }

  async loadExtensions(): Promise<void> {
    try {
      const exists = await fs.access(this.extensionsPath).then(() => true).catch(() => false)
      if (!exists) {
        console.log('Raycast extensions directory not found')
        return
      }

      const dirs = await fs.readdir(this.extensionsPath)
      
      for (const dir of dirs) {
        const extensionPath = path.join(this.extensionsPath, dir)
        const packagePath = path.join(extensionPath, 'package.json')
        
        try {
          const packageData = await fs.readFile(packagePath, 'utf-8')
          const pkg = JSON.parse(packageData)
          
          const extension: RaycastExtension = {
            id: dir,
            name: pkg.name,
            description: pkg.description || '',
            author: pkg.author || 'Unknown',
            commands: pkg.commands || []
          }
          
          this.extensions.set(dir, extension)
        } catch (error) {
          console.error(`Failed to load extension ${dir}:`, error)
        }
      }
    } catch (error) {
      console.error('Failed to load Raycast extensions:', error)
    }
  }

  async executeExtension(extensionId: string, commandName: string): Promise<any> {
    const extension = this.extensions.get(extensionId)
    if (!extension) {
      throw new Error(`Extension ${extensionId} not found`)
    }

    const command = extension.commands.find(cmd => cmd.name === commandName)
    if (!command) {
      throw new Error(`Command ${commandName} not found in extension ${extensionId}`)
    }

    // For now, we'll use Raycast's deeplink API
    // In the future, we can implement direct execution
    const deeplink = `raycast://extensions/${extension.author}/${extension.name}/${commandName}`
    await execAsync(`open "${deeplink}"`)
    
    return { success: true, deeplink }
  }

  getExtensions(): RaycastExtension[] {
    return Array.from(this.extensions.values())
  }

  // Compatibility layer for Raycast API
  createCompatibilityLayer() {
    return {
      showToast: async (options: any) => {
        // Implement toast notifications
        console.log('Toast:', options)
      },
      
      showHUD: async (text: string) => {
        // Implement HUD display
        console.log('HUD:', text)
      },
      
      popToRoot: async () => {
        // Return to main view
        console.log('Pop to root')
      },
      
      closeMainWindow: async () => {
        // Close command palette
        console.log('Close main window')
      }
    }
  }
}