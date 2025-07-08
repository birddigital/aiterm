import * as pty from 'node-pty'
import { IDisposable, IPty } from 'node-pty'
import { EventEmitter } from 'events'

export interface TerminalOptions {
  shell?: string
  cwd?: string
  env?: Record<string, string>
  cols?: number
  rows?: number
}

export class Terminal extends EventEmitter {
  private pty: IPty
  private id: string

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

  write(data: string): void {
    this.pty.write(data)
  }

  resize(cols: number, rows: number): void {
    this.pty.resize(cols, rows)
  }

  destroy(): void {
    this.pty.kill()
    this.removeAllListeners()
  }

  get pid(): number {
    return this.pty.pid
  }
}

export class TerminalManager {
  private terminals: Map<string, Terminal> = new Map()
  private nextId = 1

  createTerminal(options: TerminalOptions = {}): string {
    const id = `term-${this.nextId++}`
    const terminal = new Terminal(id, options)
    this.terminals.set(id, terminal)
    return id
  }

  getTerminal(id: string): Terminal | undefined {
    return this.terminals.get(id)
  }

  destroyTerminal(id: string): boolean {
    const terminal = this.terminals.get(id)
    if (terminal) {
      terminal.destroy()
      this.terminals.delete(id)
      return true
    }
    return false
  }

  getAllTerminals(): Terminal[] {
    return Array.from(this.terminals.values())
  }
}