/**
 * Store-related type definitions
 */

import { WidgetConfig } from './widget'

/**
 * Zustand store state type
 */
export type StoreState<T> = T & {
  // Common store methods can be added here
}

/**
 * Store selector function
 */
export type StoreSelector<T, R> = (state: T) => R

/**
 * Store action
 */
export type StoreAction<T, P = void> = (state: T, payload: P) => Partial<T> | void

/**
 * Store subscription
 */
export type StoreSubscription<T> = (state: T, prevState: T) => void

