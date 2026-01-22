/**
 * Dashboard-related type definitions
 */

import { Layout } from 'react-grid-layout'

/**
 * React Grid Layout item
 */
export interface GridLayoutItem {
  i: string
  x: number
  y: number
  w: number
  h: number
  minW?: number
  minH?: number
  maxW?: number
  maxH?: number
}

/**
 * Responsive layouts
 */
export interface ResponsiveLayouts {
  lg?: GridLayoutItem[]
  md?: GridLayoutItem[]
  sm?: GridLayoutItem[]
  xs?: GridLayoutItem[]
  xxs?: GridLayoutItem[]
}

/**
 * Layout change handler
 */
export type LayoutChangeHandler = (layout: Layout[], allLayouts: ResponsiveLayouts) => void

/**
 * Widget add configuration
 */
export interface WidgetAddConfig {
  type: string
  x?: number
  y?: number
  w?: number
  h?: number
}

