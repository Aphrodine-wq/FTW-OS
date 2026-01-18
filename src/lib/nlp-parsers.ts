/**
 * Natural Language Parsers
 * Extract structured data from natural language text
 */

export interface TaskData {
  title: string
  tags: string[]
  priority?: 'low' | 'medium' | 'high'
  dueDate?: Date
}

export interface ExpenseData {
  description: string
  amount: number
  tags: string[]
  category?: string
}

/**
 * Extract currency amount from text
 */
export function extractAmount(text: string): number {
  // Match patterns like: $15.50, $15, 15.50, 15 dollars, etc.
  const patterns = [
    /\$?(\d+(?:\.\d{2})?)\s*(?:dollars?|usd)?/i,
    /\$(\d+(?:\.\d{2})?)/,
    /(\d+(?:\.\d{2})?)\s*(?:dollars?|usd)/i
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      return parseFloat(match[1])
    }
  }

  return 0
}

/**
 * Extract hashtags from text
 */
export function extractHashtags(text: string): string[] {
  const matches = text.matchAll(/#(\w+)/g)
  return Array.from(matches, m => m[1])
}

/**
 * Extract @mentions from text
 */
export function extractMentions(text: string): string[] {
  const matches = text.matchAll(/@(\w+)/g)
  return Array.from(matches, m => m[1])
}

/**
 * Parse task from natural language text
 */
export function parseTask(text: string): TaskData {
  const tags = extractHashtags(text)
  const mentions = extractMentions(text)
  
  // Determine priority from text
  let priority: 'low' | 'medium' | 'high' | undefined = 'medium'
  const lowerText = text.toLowerCase()
  if (lowerText.includes('urgent') || lowerText.includes('asap') || lowerText.includes('important')) {
    priority = 'high'
  } else if (lowerText.includes('low') || lowerText.includes('later')) {
    priority = 'low'
  }

  // Parse due date from mentions (e.g., @tomorrow, @next-week)
  let dueDate: Date | undefined
  if (mentions.includes('tomorrow')) {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    dueDate = tomorrow
  } else if (mentions.includes('today')) {
    dueDate = new Date()
  } else if (mentions.includes('next-week')) {
    const nextWeek = new Date()
    nextWeek.setDate(nextWeek.getDate() + 7)
    dueDate = nextWeek
  }

  // Clean text (remove hashtags and mentions for title)
  let title = text
    .replace(/#\w+/g, '')
    .replace(/@\w+/g, '')
    .trim()

  return {
    title,
    tags,
    priority,
    dueDate
  }
}

/**
 * Parse expense from natural language text
 */
export function parseExpense(text: string): ExpenseData {
  const amount = extractAmount(text)
  const tags = extractHashtags(text)
  
  // Extract category from common patterns
  let category: string | undefined
  const lowerText = text.toLowerCase()
  const categoryMap: Record<string, string> = {
    'lunch': 'Meals',
    'dinner': 'Meals',
    'breakfast': 'Meals',
    'coffee': 'Meals',
    'uber': 'Transportation',
    'lyft': 'Transportation',
    'taxi': 'Transportation',
    'gas': 'Transportation',
    'fuel': 'Transportation',
    'hotel': 'Travel',
    'flight': 'Travel',
    'office': 'Office Supplies',
    'software': 'Software',
    'subscription': 'Software'
  }

  for (const [keyword, cat] of Object.entries(categoryMap)) {
    if (lowerText.includes(keyword)) {
      category = cat
      break
    }
  }

  // Clean description (remove amount and hashtags)
  let description = text
    .replace(/\$?\d+(?:\.\d{2})?\s*(?:dollars?|usd)?/gi, '')
    .replace(/#\w+/g, '')
    .trim()

  return {
    description: description || text,
    amount,
    tags,
    category
  }
}

