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

  static async draftEmail(clientName: string, invoiceNumber: string, tone: 'polite' | 'firm' | 'urgent') {
    await new Promise(r => setTimeout(r, 1500)) // Simulate thinking
    
    if (tone === 'polite') {
      return `Subject: Invoice #${invoiceNumber} Reminder

Hi ${clientName},

I hope you're having a great week!

This is just a friendly reminder that Invoice #${invoiceNumber} was due recently. I've attached a copy for your convenience.

If you've already sent payment, please disregard this email. Otherwise, please let me know if you have any questions!

Best regards,
[Your Name]`
    }
    
    if (tone === 'firm') {
      return `Subject: Overdue: Invoice #${invoiceNumber}

Dear ${clientName},

Our records indicate that payment for Invoice #${invoiceNumber} has not yet been received. The amount was due on [Due Date].

Please ensure this is processed as soon as possible to avoid any late fees.

Regards,
[Your Name]`
    }

    return `Subject: URGENT: Payment Required for Invoice #${invoiceNumber}

Dear ${clientName},

This is a final notice regarding overdue Invoice #${invoiceNumber}. Payment is significantly past due.

Please remit payment immediately to maintain active service status.

Regards,
[Your Name]`
  }

  static async categorizeExpense(description: string): Promise<string> {
    const d = description.toLowerCase()
    if (d.includes('uber') || d.includes('lyft') || d.includes('flight') || d.includes('hotel') || d.includes('airbnb')) return 'Travel'
    if (d.includes('coffee') || d.includes('lunch') || d.includes('dinner') || d.includes('burger') || d.includes('pizza')) return 'Meals'
    if (d.includes('software') || d.includes('hosting') || d.includes('adobe') || d.includes('github') || d.includes('aws')) return 'Software'
    if (d.includes('office') || d.includes('desk') || d.includes('monitor') || d.includes('paper')) return 'Office Supplies'
    return 'General'
  }

  static async analyzeRisk(contractText: string): Promise<string[]> {
    await new Promise(r => setTimeout(r, 2000))
    const risks = []
    const lower = contractText.toLowerCase()
    
    if (lower.includes('indemnification') && !lower.includes('mutual')) risks.push('Unilateral Indemnification: Ensure this protects you as well.')
    if (!lower.includes('termination')) risks.push('Missing Termination Clause: How do you get out of this?')
    if (lower.includes('perpetual') && lower.includes('license')) risks.push('Perpetual License: Verify if you intend to grant rights forever.')
    if (lower.includes('exclusivity')) risks.push('Exclusivity Clause: This may limit your ability to work with other clients.')
    if (!lower.includes('payment terms')) risks.push('Vague Payment Terms: Define Net 15/30 clearly.')
    
    if (risks.length === 0) risks.push('No critical risks detected (Standard Analysis).')
    
    return risks
  }

  static async optimizeRate(clientHistory: any[]): Promise<string> {
    // Mock logic
    return "Based on consistent on-time payments and market trends, you could increase your rate by 10% for the next project."
  }
}
