import { Ollama } from 'ollama'

/**
 * Represents an AI model configuration
 */
export interface AIModel {
  /** Unique model identifier */
  id: string
  /** Human-readable model name */
  name: string
  /** Model size (e.g., "70B", "34B") */
  size: string
  /** List of model capabilities */
  capabilities: string[]
  /** Maximum context length in tokens */
  contextLength: number
}

/**
 * Configuration for an AI query
 */
export interface AIQuery {
  /** The user's prompt or question */
  prompt: string
  /** Optional context to enhance the query */
  context?: {
    /** Recent terminal output */
    terminalOutput?: string
    /** Current working directory */
    currentDirectory?: string
    /** Recent command history */
    recentCommands?: string[]
    /** Selected text from terminal */
    selectedText?: string
  }
  /** Specific model to use (overrides default) */
  model?: string
  /** Whether to stream the response */
  stream?: boolean
}

/**
 * Manages AI model interactions and query routing.
 * Connects to local Ollama instance and provides intelligent
 * model selection based on query type and context.
 */
export class AIOrchestrator {
  private ollama: Ollama
  private models: Map<string, AIModel> = new Map()
  private activeModel: string = 'llama3.2:70b'

  /**
   * Creates a new AI orchestrator instance
   */
  constructor() {
    this.ollama = new Ollama({
      host: 'http://localhost:11434'
    })

    // Define available models optimized for M1 Max 64GB
    this.models.set('llama3.2:70b', {
      id: 'llama3.2:70b',
      name: 'Llama 3.2 70B',
      size: '70B',
      capabilities: ['general', 'coding', 'analysis'],
      contextLength: 128000
    })

    this.models.set('codellama:34b', {
      id: 'codellama:34b',
      name: 'Code Llama 34B',
      size: '34B',
      capabilities: ['coding', 'debugging', 'refactoring'],
      contextLength: 100000
    })

    this.models.set('mixtral:8x7b', {
      id: 'mixtral:8x7b',
      name: 'Mixtral 8x7B',
      size: '47B',
      capabilities: ['general', 'reasoning', 'multi-task'],
      contextLength: 32000
    })

    this.models.set('phi-3:mini', {
      id: 'phi-3:mini',
      name: 'Phi-3 Mini',
      size: '3.8B',
      capabilities: ['fast', 'basic'],
      contextLength: 4096
    })
  }

  /**
   * Initializes the AI orchestrator and ensures required models are available
   * @throws Error if unable to connect to Ollama
   */
  async initialize(): Promise<void> {
    try {
      // Check Ollama connection
      await this.ollama.list()
      console.log('Connected to Ollama')

      // Pull default model if not exists
      const models = await this.ollama.list()
      const hasDefault = models.models.some(m => m.name === this.activeModel)
      
      if (!hasDefault) {
        console.log(`Pulling ${this.activeModel}...`)
        await this.ollama.pull({ model: this.activeModel })
      }
    } catch (error) {
      console.error('Failed to initialize AI:', error)
    }
  }

  /**
   * Sends a query to the AI model with optional context
   * @param prompt - The user's question or request
   * @param context - Optional context to enhance the response
   * @returns The AI model's response
   */
  async query(prompt: string, context?: AIQuery['context']): Promise<string> {
    const systemPrompt = this.buildSystemPrompt(context)
    
    try {
      const response = await this.ollama.chat({
        model: this.activeModel,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        options: {
          temperature: 0.7,
          top_p: 0.9,
          num_predict: 2048
        }
      })

      return response.message.content
    } catch (error) {
      console.error('AI query failed:', error)
      throw error
    }
  }

  async stream(prompt: string, context?: AIQuery['context']): Promise<AsyncGenerator<string>> {
    const systemPrompt = this.buildSystemPrompt(context)
    
    const response = await this.ollama.chat({
      model: this.activeModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      stream: true
    })

    return (async function* () {
      for await (const chunk of response) {
        yield chunk.message.content
      }
    })()
  }

  private buildSystemPrompt(context?: AIQuery['context']): string {
    let prompt = `You are AITerm, an intelligent terminal assistant. You help users with:
- Terminal commands and shell scripting
- Code analysis and debugging
- System automation and control
- Development workflows

You have access to the user's terminal context and can suggest commands, explain errors, and automate tasks.`

    if (context) {
      if (context.currentDirectory) {
        prompt += `\n\nCurrent directory: ${context.currentDirectory}`
      }
      if (context.terminalOutput) {
        prompt += `\n\nRecent terminal output:\n${context.terminalOutput}`
      }
      if (context.recentCommands?.length) {
        prompt += `\n\nRecent commands:\n${context.recentCommands.join('\n')}`
      }
      if (context.selectedText) {
        prompt += `\n\nSelected text:\n${context.selectedText}`
      }
    }

    return prompt
  }

  async switchModel(modelId: string): Promise<void> {
    if (this.models.has(modelId)) {
      this.activeModel = modelId
      
      // Ensure model is available
      const models = await this.ollama.list()
      const hasModel = models.models.some(m => m.name === modelId)
      
      if (!hasModel) {
        await this.ollama.pull({ model: modelId })
      }
    }
  }

  getAvailableModels(): AIModel[] {
    return Array.from(this.models.values())
  }

  getActiveModel(): AIModel | undefined {
    return this.models.get(this.activeModel)
  }
}