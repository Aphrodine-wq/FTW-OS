/**
 * Rate Limiting & Request Validation
 * Prevents API abuse and ensures fair resource usage
 */

export class RateLimiter {
  private attempts = new Map<string, number[]>()

  /**
   * Check if request is within rate limit
   * @param key - Unique identifier for the rate limit (e.g., user ID, IP, API endpoint)
   * @param maxAttempts - Maximum number of attempts allowed
   * @param windowMs - Time window in milliseconds
   * @returns true if within limit, false if exceeded
   */
  check(key: string, maxAttempts: number = 5, windowMs: number = 60000): boolean {
    const now = Date.now()
    const attempts = this.attempts.get(key) || []
    
    // Remove old attempts outside the time window
    const recentAttempts = attempts.filter(time => now - time < windowMs)
    
    if (recentAttempts.length >= maxAttempts) {
      return false // Rate limit exceeded
    }
    
    // Add current attempt
    recentAttempts.push(now)
    this.attempts.set(key, recentAttempts)
    
    // Clean up old entries periodically
    if (this.attempts.size > 1000) {
      this.cleanup(now)
    }
    
    return true
  }

  /**
   * Get remaining attempts for a key
   */
  getRemaining(key: string, maxAttempts: number = 5, windowMs: number = 60000): number {
    const now = Date.now()
    const attempts = this.attempts.get(key) || []
    const recentAttempts = attempts.filter(time => now - time < windowMs)
    return Math.max(0, maxAttempts - recentAttempts.length)
  }

  /**
   * Reset rate limit for a key
   */
  reset(key: string): void {
    this.attempts.delete(key)
  }

  /**
   * Clean up old entries
   */
  private cleanup(now: number): void {
    for (const [key, attempts] of this.attempts.entries()) {
      const recentAttempts = attempts.filter(time => now - time < 300000) // 5 minutes
      if (recentAttempts.length === 0) {
        this.attempts.delete(key)
      } else {
        this.attempts.set(key, recentAttempts)
      }
    }
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter()

