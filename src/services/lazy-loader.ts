import { lazy, Suspense, ComponentType, ReactNode } from 'react'

interface LazyLoadConfig {
  component: () => Promise<{ default: ComponentType<any> }>
  fallback?: ReactNode
}

export const createLazyComponent = (config: LazyLoadConfig) => {
  const LazyComponent = lazy(config.component)

  return {
    Component: LazyComponent,
    Suspended: (props: any) => (
      <Suspense fallback={config.fallback || <LoadingFallback />}>
        <LazyComponent {...props} />
      </Suspense>
    )
  }
}

export const LoadingFallback = () => (
  <div className="flex items-center justify-center h-full gap-2">
    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
    <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
  </div>
)
