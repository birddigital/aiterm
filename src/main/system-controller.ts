import { exec, execSync } from 'child_process'
import * as applescript from 'applescript'
import { promisify } from 'util'

const execAsync = promisify(exec)
const runAppleScript = promisify(applescript.execString)

export interface SystemAction {
  type: 'applescript' | 'command' | 'keypress' | 'window'
  action: string
  params?: any
}

export class SystemController {
  async execute(action: SystemAction): Promise<any> {
    switch (action.type) {
      case 'applescript':
        return this.executeAppleScript(action.action)
      
      case 'command':
        return this.executeCommand(action.action)
      
      case 'window':
        return this.controlWindow(action.action, action.params)
      
      case 'keypress':
        return this.simulateKeypress(action.action)
      
      default:
        throw new Error(`Unknown action type: ${action.type}`)
    }
  }

  private async executeAppleScript(script: string): Promise<string> {
    try {
      const result = await runAppleScript(script)
      return result as string
    } catch (error) {
      console.error('AppleScript error:', error)
      throw error
    }
  }

  private async executeCommand(command: string): Promise<{ stdout: string; stderr: string }> {
    try {
      const { stdout, stderr } = await execAsync(command)
      return { stdout, stderr }
    } catch (error) {
      console.error('Command error:', error)
      throw error
    }
  }

  private async controlWindow(action: string, params: any): Promise<void> {
    const scripts: Record<string, string> = {
      'arrange-coding': `
        tell application "System Events"
          tell process "AITerm"
            set position of window 1 to {0, 23}
            set size of window 1 to {960, 1057}
          end tell
          
          if exists process "Visual Studio Code" then
            tell process "Visual Studio Code"
              set position of window 1 to {960, 23}
              set size of window 1 to {960, 1057}
            end tell
          end if
        end tell
      `,
      
      'focus-mode': `
        tell application "System Events"
          set visible of every process whose name is not "AITerm" to false
        end tell
      `,
      
      'restore-windows': `
        tell application "System Events"
          set visible of every process to true
        end tell
      `
    }

    const script = scripts[action]
    if (script) {
      await this.executeAppleScript(script)
    }
  }

  private async simulateKeypress(keys: string): Promise<void> {
    const script = `
      tell application "System Events"
        keystroke "${keys}"
      end tell
    `
    await this.executeAppleScript(script)
  }

  async getActiveApplications(): Promise<string[]> {
    const script = `
      tell application "System Events"
        set appList to {}
        repeat with theProcess in (every process whose background only is false)
          set appName to name of theProcess
          set end of appList to appName
        end repeat
        return appList
      end tell
    `
    
    const result = await this.executeAppleScript(script)
    return result.split(', ')
  }

  async captureScreen(area?: { x: number; y: number; width: number; height: number }): Promise<string> {
    const filename = `/tmp/aiterm-screenshot-${Date.now()}.png`
    let command = `screencapture -x ${filename}`
    
    if (area) {
      command = `screencapture -x -R${area.x},${area.y},${area.width},${area.height} ${filename}`
    }
    
    await this.executeCommand(command)
    return filename
  }
}