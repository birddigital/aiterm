import * as pty from 'node-pty'
import { IDisposable, IPty } from 'node-pty'
import { EventEmitter } from 'events'

/**
 * Configuration options for creating a new terminal instance
 */
export interface TerminalOptions {
  /** Shell to use (defaults to $SHELL or /bin/zsh) */
  shell?: string
  /** Working directory (defaults to $HOME) */
  cwd?: string
  /** Environment variables to set */
  env?: Record<string, string>
  /** Initial column count (default: 80) */
  cols?: number
  /** Initial row count (default: 24) */
  rows?: number
}

/**
 * Represents a terminal session with PTY (pseudo-terminal) support.
 * Extends EventEmitter to emit 'data' and 'exit' events.
 * 
 * @emits {string} data - Terminal output data
 * @emits {Object} exit - Terminal exit event with exitCode and signal
 */
export class Terminal extends EventEmitter {
  private pty: IPty
  private id: string

  /**
   * Creates a new terminal instance
   * @param id - Unique identifier for this terminal
   * @param options - Terminal configuration options
   */
  constructor(id: string, options: TerminalOptions = {}) {
    super()
    this.id = id
    
    const shell = options.shell || process.env.SHELL || '/bin/zsh'
    const cwd = options.cwd || process.env.HOME || '/'
    const env = { ...process.env, ...options.env }

    this.pty = pty.spawn(shell, [], {
      name: 'xterm-256color',
      cols: options.cols || 80,
      rows: options.rows || 24,
      cwd,
      env
    })

    this.pty.onData((data) => {
      this.emit('data', data)
    })

    this.pty.onExit(({ exitCode, signal }) => {
      this.emit('exit', { exitCode, signal })
    })
  }

  /**
   * Writes data to the terminal
   * @param data - Data to write (typically user input)
   */
  write(data: string): void {
    this.pty.write(data)
  }

  /**
   * Resizes the terminal
   * @param cols - New column count
   * @param rows - New row count
   */
  resize(cols: number, rows: number): void {
    this.pty.resize(cols, rows)
  }

  /**
   * Destroys the terminal session and cleans up resources
   */
  destroy(): void {
    this.pty.kill()
    this.removeAllListeners()
  }

  /**
   * Gets the process ID of the terminal
   * @returns The PID of the underlying shell process
   */
  get pid(): number {
    return this.pty.pid
  }
}

/**
 * Manages multiple terminal instances.
 * Handles creation, retrieval, and destruction of terminals.
 */
export class TerminalManager {
  private terminals: Map<string, Terminal> = new Map()
  private nextId = 1

  /**
   * Creates a new terminal instance
   * @param options - Terminal configuration options
   * @returns The unique ID of the created terminal
   */
  createTerminal(options: TerminalOptions = {}): string {
    const id = `term-${this.nextId++}`
    const terminal = new Terminal(id, options)
    this.terminals.set(id, terminal)
    return id
  }

  /**
   * Retrieves a terminal by its ID
   * @param id - Terminal ID
   * @returns The terminal instance or undefined if not found
   */
  getTerminal(id: string): Terminal | undefined {
    return this.terminals.get(id)
  }

  /**
   * Destroys a terminal and removes it from management
   * @param id - Terminal ID to destroy
   * @returns true if terminal was found and destroyed, false otherwise
   */
  destroyTerminal(id: string): boolean {
    const terminal = this.terminals.get(id)
    if (terminal) {
      terminal.destroy()
      this.terminals.delete(id)
      return true
    }
    return false
  }

  /**
   * Gets all active terminal instances
   * @returns Array of all active terminals
   */
  getAllTerminals(): Terminal[] {
    return Array.from(this.terminals.values())
  }
}