import { useSettingsStore } from '@/stores/settings-store'

export const DOCUMENT_CATEGORIES = [
  'Invoices',
  'Contracts',
  'Tax Documents',
  'Receipts',
  'Reports',
  'Correspondence'
] as const

export type DocumentCategory = typeof DOCUMENT_CATEGORIES[number]

export interface ClassificationResult {
  category: DocumentCategory
  confidence: number
  suggestedFolder: string
  reasoning?: string
}

export interface ClassificationError {
  success: false
  error: string
}

export interface ClassificationSuccess {
  success: true
  result: ClassificationResult
}

export type ClassificationResponse = ClassificationSuccess | ClassificationError

const CLASSIFICATION_PROMPT = `You are a document classifier. Analyze the following text and classify it into ONE of these categories:
- Invoices: Bills, payment requests, itemized charges, purchase orders
- Contracts: Agreements, terms of service, legal documents, NDAs
- Tax Documents: Tax forms, W-2s, 1099s, tax returns, deductions
- Receipts: Purchase confirmations, transaction records, payment confirmations
- Reports: Analysis documents, summaries, status updates, metrics
- Correspondence: Emails, letters, memos, communications

Respond ONLY with valid JSON in this exact format:
{"category": "CategoryName", "confidence": 0.85, "reasoning": "Brief explanation"}

The confidence should be between 0.0 and 1.0.
Do not include any other text, markdown, or explanation outside the JSON.

Text to classify:
`

export class DocumentClassifier {
  private static getOllamaEndpoint(): string {
    // Try to get from settings store, fallback to default
    try {
      const settings = useSettingsStore.getState()
      return settings.integrations?.ollamaEndpoint || 'http://localhost:11434'
    } catch {
      return 'http://localhost:11434'
    }
  }

  private static getModel(): string {
    try {
      const settings = useSettingsStore.getState()
      return settings.integrations?.ollamaModel || 'llama3'
    } catch {
      return 'llama3'
    }
  }

  static async isOllamaAvailable(): Promise<boolean> {
    try {
      const endpoint = this.getOllamaEndpoint()
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)
      
      const response = await fetch(`${endpoint}/api/tags`, {
        signal: controller.signal
      })
      clearTimeout(timeout)
      
      return response.ok
    } catch {
      return false
    }
  }

  static async getAvailableModels(): Promise<string[]> {
    try {
      const endpoint = this.getOllamaEndpoint()
      const response = await fetch(`${endpoint}/api/tags`)
      
      if (!response.ok) return []
      
      const data = await response.json()
      return data.models?.map((m: { name: string }) => m.name) || []
    } catch {
      return []
    }
  }

  static async classify(text: string): Promise<ClassificationResponse> {
    try {
      const endpoint = this.getOllamaEndpoint()
      const model = this.getModel()
      
      // Truncate text to avoid context window issues
      const truncatedText = text.slice(0, 3500)
      
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 30000) // 30s timeout
      
      const response = await fetch(`${endpoint}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          messages: [
            { role: 'user', content: CLASSIFICATION_PROMPT + truncatedText }
          ],
          stream: false,
          options: {
            temperature: 0.1 // Low temperature for consistent classification
          }
        }),
        signal: controller.signal
      })
      
      clearTimeout(timeout)
      
      if (!response.ok) {
        return { success: false, error: `Ollama API error: ${response.status}` }
      }
      
      const data = await response.json()
      const content = data.message?.content || ''
      
      // Parse JSON response
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return { success: false, error: 'Invalid response format from AI' }
      }
      
      const parsed = JSON.parse(jsonMatch[0])
      
      // Validate category
      if (!DOCUMENT_CATEGORIES.includes(parsed.category)) {
        return { success: false, error: `Invalid category: ${parsed.category}` }
      }
      
      // Normalize confidence
      const confidence = Math.min(1, Math.max(0, Number(parsed.confidence) || 0.5))
      
      return {
        success: true,
        result: {
          category: parsed.category as DocumentCategory,
          confidence,
          suggestedFolder: parsed.category,
          reasoning: parsed.reasoning
        }
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return { success: false, error: 'Classification timed out' }
        }
        return { success: false, error: error.message }
      }
      return { success: false, error: 'Unknown classification error' }
    }
  }

  static async classifyFile(filePath: string): Promise<ClassificationResponse> {
    try {
      // Read file content via IPC
      const result = await window.ipcRenderer.invoke('document:read-text', filePath)
      
      if (!result.success) {
        return { success: false, error: result.error }
      }
      
      return this.classify(result.content)
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to read file' 
      }
    }
  }

  static async classifyAndMove(filePath: string): Promise<{
    success: boolean
    category?: DocumentCategory
    newPath?: string
    error?: string
  }> {
    // First classify the document
    const classification = await this.classifyFile(filePath)
    
    if (!classification.success) {
      return { success: false, error: classification.error }
    }
    
    const { category, confidence } = classification.result
    
    // Only auto-move if confidence is high enough
    if (confidence < 0.6) {
      return { 
        success: false, 
        error: `Low confidence (${(confidence * 100).toFixed(0)}%). Manual review recommended.`,
        category
      }
    }
    
    // Move file to category folder
    const moveResult = await window.ipcRenderer.invoke('document:move-to-category', {
      sourcePath: filePath,
      category
    })
    
    if (!moveResult.success) {
      return { success: false, error: moveResult.error, category }
    }
    
    return {
      success: true,
      category,
      newPath: moveResult.newPath
    }
  }
}
