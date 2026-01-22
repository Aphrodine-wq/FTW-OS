export interface AIProviderConfig {
  provider: 'ollama' | 'openai' | 'anthropic'
  apiKey?: string
  model: string
  baseUrl?: string
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export class AICore {
  private static config: AIProviderConfig = {
    provider: 'ollama',
    model: 'llama2',
    baseUrl: 'http://localhost:11434'
  }

  static setConfig(config: Partial<AIProviderConfig>) {
    this.config = { ...this.config, ...config }
  }

  static async chat(messages: ChatMessage[]): Promise<string> {
    try {
      if (this.config.provider === 'ollama') {
        const response = await fetch(`${this.config.baseUrl}/api/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            model: this.config.model,
            messages: messages,
            stream: false
          })
        })
        if (!response.ok) throw new Error('Ollama API failed')
        const data = await response.json()
        return data.message.content
      }

      if (this.config.provider === 'openai') {
        if (!this.config.apiKey) throw new Error('OpenAI API Key missing')
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKey}`
          },
          body: JSON.stringify({
            model: this.config.model,
            messages: messages
          })
        })
        const data = await response.json()
        return data.choices[0].message.content
      }

      if (this.config.provider === 'anthropic') {
        if (!this.config.apiKey) throw new Error('Anthropic API Key missing')
        // Implementation for Claude API would go here
        return "Claude support coming soon."
      }

      throw new Error('Unsupported provider')
    } catch (error) {
      console.error('AI Error:', error)
      return `Error: ${error instanceof Error ? error.message : 'Unknown AI error'}`
    }
  }

  // Additional AI capabilities will be added here
}
