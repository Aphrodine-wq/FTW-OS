/**
 * Centralized logging utility
 * Respects environment and provides structured logging
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: unknown
}

class Logger {
  private isDevelopment = import.meta.env.DEV
  private isProduction = import.meta.env.PROD

  /**
   * Log debug message (only in development)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context || '')
    }
  }

  /**
   * Log info message (only in development)
   */
  info(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, context || '')
    }
  }

  /**
   * Log warning message
   */
  warn(message: string, context?: LogContext): void {
    if (this.isDevelopment) {
      console.warn(`[WARN] ${message}`, context || '')
    }
    // In production, could send to error tracking service
  }

  /**
   * Log error message
   */
  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorObj = error instanceof Error ? error : new Error(String(error))
    
    if (this.isDevelopment) {
      console.error(`[ERROR] ${message}`, errorObj, context || '')
    }
    
    // In production, send to error tracking service
    if (this.isProduction && error) {
      // Mock error tracking implementation for now
      // In a real app, this would send to Sentry/LogRocket
      // We use a safe fallback to localStorage to persist critical errors for debugging
      try {
        const errorLog = JSON.parse(localStorage.getItem('error_logs') || '[]')
        errorLog.push({
            timestamp: new Date().toISOString(),
            message,
            stack: errorObj.stack,
            context
        })
        // Keep only last 50 errors
        if (errorLog.length > 50) errorLog.shift()
        localStorage.setItem('error_logs', JSON.stringify(errorLog))
      } catch (e) {
        // Fallback if localStorage fails (e.g. quota exceeded)
        console.error('Failed to log error to storage', e)
      }
    }
  }

  /**
   * Log performance metric
   */
  performance(metric: string, duration: number, context?: LogContext): void {
    if (this.isDevelopment) {
      console.log(`[PERF] ${metric}: ${duration.toFixed(2)}ms`, context || '')
    }
  }

  /**
   * Group related logs
   */
  group(label: string, callback: () => void): void {
    if (this.isDevelopment) {
      console.group(label)
      callback()
      console.groupEnd()
    } else {
      callback()
    }
  }
}

export const logger = new Logger()



