/**
 * Input Sanitization Library
 * Prevents injection attacks and ensures safe data handling
 */

import DOMPurify from 'dompurify'

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export const sanitize = {
  /**
   * Sanitize HTML string
   */
  html: (dirty: string): string => {
    return DOMPurify.sanitize(dirty, {
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
      ALLOWED_ATTR: ['href', 'target']
    })
  },

  /**
   * Sanitize filename to prevent directory traversal
   */
  filename: (name: string): string => {
    return name
      .replace(/[^a-zA-Z0-9.-]/g, '_')
      .replace(/\.\./g, '_')
      .slice(0, 255)
  },

  /**
   * Sanitize SQL value (use parameterized queries instead)
   * This is a basic sanitization - always prefer parameterized queries
   */
  sql: (value: string): string => {
    return value.replace(/['";\\]/g, '')
  },

  /**
   * Sanitize file path to prevent directory traversal
   */
  path: (path: string): string => {
    return path
      .replace(/\.\./g, '')
      .replace(/[^a-zA-Z0-9/.-]/g, '_')
      .replace(/\/+/g, '/') // Remove duplicate slashes
  },

  /**
   * Sanitize URL
   */
  url: (url: string): string => {
    try {
      const parsed = new URL(url)
      // Only allow http and https protocols
      if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        throw new Error('Invalid protocol')
      }
      return url
    } catch {
      return ''
    }
  },

  /**
   * Sanitize email address
   */
  email: (email: string): string => {
    return email.replace(/[^a-zA-Z0-9@._-]/g, '').toLowerCase()
  }
}

