/**
 * API-related type definitions
 */

import { ApiResponse, ApiErrorResponse } from './common'

/**
 * HTTP method types
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'

/**
 * Request configuration
 */
export interface RequestConfig {
  method?: HttpMethod
  headers?: Record<string, string>
  body?: unknown
  params?: Record<string, string | number | boolean>
  timeout?: number
  signal?: AbortSignal
}

/**
 * Request options
 */
export interface RequestOptions extends RequestConfig {
  retries?: number
  retryDelay?: number
  onRetry?: (attempt: number) => void
}

/**
 * Response metadata
 */
export interface ResponseMetadata {
  status: number
  statusText: string
  headers: Record<string, string>
  timestamp: number
}

/**
 * Typed API response
 */
export interface TypedApiResponse<T> extends ApiResponse<T> {
  metadata?: ResponseMetadata
}

/**
 * Paginated API response
 */
export interface PaginatedApiResponse<T> extends TypedApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasMore: boolean
  }
}

/**
 * Error response with status
 */
export interface TypedApiErrorResponse extends ApiErrorResponse {
  status?: number
  metadata?: ResponseMetadata
}

/**
 * Request interceptor
 */
export type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>

/**
 * Response interceptor
 */
export type ResponseInterceptor<T = unknown> = (response: TypedApiResponse<T>) => TypedApiResponse<T> | Promise<TypedApiResponse<T>>

/**
 * Error interceptor
 */
export type ErrorInterceptor = (error: TypedApiErrorResponse) => TypedApiErrorResponse | Promise<TypedApiErrorResponse>

