/**
 * Global type declarations
 */

import React from 'react'
import { Root } from 'react-dom/client'

/**
 * Extend Window interface to include React and ReactDOM for chunk compatibility
 */
declare global {
  interface Window {
    React: typeof React
    ReactDOM: {
      createRoot: typeof import('react-dom/client').createRoot
    }
  }
}

export {}

