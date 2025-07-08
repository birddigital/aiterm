import { useState, useRef, useEffect } from 'react'
import { Send, Loader2, Bot, X } from 'lucide-react'
import { useAIStore } from '../stores/ai-store'

export function AIPanel() {
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  
  const { messages, addMessage, togglePanel } = useAIStore()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setIsLoading(true)

    // Add user message
    addMessage({
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    })

    try {
      // Get terminal context
      const context = await window.electron.ipcRenderer.invoke('terminal:get-context')
      
      // Send to AI
      const response = await window.electron.ipcRenderer.invoke('ai:query', userMessage, context)
      
      // Add AI response
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      })
    } catch (error) {
      addMessage({
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${error.message}`,
        timestamp: new Date()
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="ai-panel">
      <div className="ai-panel-header">
        <div className="ai-panel-title">
          <Bot size={20} />
          <span>AI Assistant</span>
        </div>
        <button
          className="ai-panel-close"
          onClick={togglePanel}
          aria-label="Close AI panel"
        >
          <X size={18} />
        </button>
      </div>

      <div className="ai-messages">
        {messages.length === 0 && (
          <div className="ai-welcome">
            <Bot size={32} className="ai-welcome-icon" />
            <h3>Welcome to AITerm Assistant</h3>
            <p>I can help you with:</p>
            <ul>
              <li>Explaining terminal errors</li>
              <li>Suggesting commands</li>
              <li>Writing scripts</li>
              <li>Debugging code</li>
              <li>System automation</li>
            </ul>
            <p>Just ask me anything!</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div
            key={message.id}
            className={`ai-message ai-message-${message.role}`}
          >
            <div className="ai-message-content">
              {message.content}
            </div>
            <div className="ai-message-time">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="ai-message ai-message-assistant">
            <div className="ai-message-content">
              <Loader2 className="ai-loading" size={16} />
              Thinking...
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="ai-input-form">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="ai-input"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="ai-submit"
          disabled={!input.trim() || isLoading}
        >
          {isLoading ? (
            <Loader2 className="ai-loading" size={18} />
          ) : (
            <Send size={18} />
          )}
        </button>
      </form>
    </div>
  )
}