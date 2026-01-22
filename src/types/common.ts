/**
 * Common type definitions used across the application
 */

/**
 * Generic result type for operations that can succeed or fail
 */
export type Result<T, E = Error> = 
  | { success: true; data: T }
  | { success: false; error: E }

/**
 * Async result type
 */
export type AsyncResult<T, E = Error> = Promise<Result<T, E>>

/**
 * Optional value type
 */
export type Optional<T> = T | null | undefined

/**
 * Dictionary/Record type alias
 */
export type Dictionary<T> = Record<string, T>

/**
 * ID type for entities
 */
export type EntityId = string

/**
 * Timestamp type
 */
export type Timestamp = number

/**
 * Date string in ISO format
 */
export type ISODateString = string

/**
 * Generic callback function type
 */
export type Callback<T = void> = (value: T) => void

/**
 * Generic async callback function type
 */
export type AsyncCallback<T = void> = (value: T) => Promise<void>

/**
 * Event handler type
 */
export type EventHandler<T = Event> = (event: T) => void

/**
 * Component props with children
 */
export interface ComponentWithChildren {
  children?: React.ReactNode
}

/**
 * Component props with className
 */
export interface ComponentWithClassName {
  className?: string
}

/**
 * Component props with id
 */
export interface ComponentWithId {
  id?: string
}

/**
 * Loading state
 */
export interface LoadingState {
  isLoading: boolean
  error?: Error | null
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number
  limit: number
  offset?: number
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

/**
 * Sort order
 */
export type SortOrder = 'asc' | 'desc'

/**
 * Sort parameters
 */
export interface SortParams<T = string> {
  field: T
  order: SortOrder
}

/**
 * Filter parameters
 */
export interface FilterParams {
  [key: string]: unknown
}

/**
 * Generic API response
 */
export interface ApiResponse<T> {
  data: T
  message?: string
  success: boolean
}

/**
 * Generic API error response
 */
export interface ApiErrorResponse {
  error: string
  message: string
  code?: string | number
  details?: unknown
}

/**
 * Status type for async operations
 */
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error'

/**
 * Generic state with status
 */
export interface StateWithStatus<T = unknown> {
  status: AsyncStatus
  data?: T
  error?: Error | null
}

