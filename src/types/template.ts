/**
 * Template Types
 * Extended template system for invoices, emails, contracts, task lists, and projects
 */

export type TemplateType = 'invoice' | 'email' | 'contract' | 'task-list' | 'project'

export interface Template {
  id: string
  name: string
  category: string
  type: TemplateType
  content: any // Template-specific content structure
  variables: string[] // e.g., ['clientName', 'projectName']
  tags: string[]
  createdAt?: Date
  updatedAt?: Date
}

export interface TemplateVariable {
  key: string
  label: string
  type: 'string' | 'number' | 'date' | 'email'
  required: boolean
  defaultValue?: any
}

/**
 * Replace variables in template content
 */
export function replaceVariables(content: any, variables: Record<string, any>): any {
  if (typeof content === 'string') {
    let result = content
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
      result = result.replace(regex, String(value))
    }
    return result
  } else if (Array.isArray(content)) {
    return content.map(item => replaceVariables(item, variables))
  } else if (typeof content === 'object' && content !== null) {
    const result: any = {}
    for (const [key, value] of Object.entries(content)) {
      result[key] = replaceVariables(value, variables)
    }
    return result
  }
  return content
}

/**
 * Extract variables from template content
 */
export function extractVariables(content: any): string[] {
  const variables = new Set<string>()
  
  const extractFromString = (str: string) => {
    const matches = str.matchAll(/{{\s*(\w+)\s*}}/g)
    for (const match of matches) {
      variables.add(match[1])
    }
  }
  
  const traverse = (obj: any) => {
    if (typeof obj === 'string') {
      extractFromString(obj)
    } else if (Array.isArray(obj)) {
      obj.forEach(item => traverse(item))
    } else if (typeof obj === 'object' && obj !== null) {
      Object.values(obj).forEach(value => traverse(value))
    }
  }
  
  traverse(content)
  return Array.from(variables)
}

