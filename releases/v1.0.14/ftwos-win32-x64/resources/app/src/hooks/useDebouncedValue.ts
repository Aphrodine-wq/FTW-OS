import { useState, useEffect } from 'react'

/**
 * Returns a debounced value that updates after `delay` ms when `value` changes.
 * Useful for search inputs to avoid filtering on every keystroke.
 */
export function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}

