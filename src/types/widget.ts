/**
 * Widget-related type definitions
 */

/**
 * Widget layout configuration
 */
export interface WidgetLayout {
  x: number
  y: number
  w: number
  h: number
}

/**
 * Widget configuration
 */
export interface WidgetConfig {
  id: string
  type: string
  title: string
  layout: WidgetLayout
  visible: boolean
  config?: Record<string, unknown>
}

/**
 * Widget definition from registry
 */
export interface WidgetDefinition {
  id: string
  name: string
  description: string
  category: string
  icon?: string
  component: React.ComponentType<WidgetProps>
  defaultSize?: WidgetLayout
  minSize?: WidgetLayout
  maxSize?: WidgetLayout
}

/**
 * Widget props passed to widget components
 */
export interface WidgetProps {
  id: string
  config?: Record<string, unknown>
  onConfigChange?: (config: Record<string, unknown>) => void
  onRemove?: () => void
}

/**
 * Widget metadata
 */
export interface WidgetMetadata {
  version: string
  author?: string
  tags?: string[]
  dependencies?: string[]
}

