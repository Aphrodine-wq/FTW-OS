/**
 * Widget Template
 * Reusable template for creating new widgets
 */

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useQuery } from '@tanstack/react-query'
import { AppWidget } from './core/AppWidget'

interface WidgetTemplateProps {
  id?: string
  onRemove?: () => void
  title: string
  icon: React.ComponentType<{ className?: string }>
  queryKey: string[]
  queryFn: () => Promise<any>
  refreshInterval?: number
  children: (data: any, isLoading: boolean) => React.ReactNode
}

export function WidgetTemplate({
  id,
  onRemove,
  title,
  icon: Icon,
  queryKey,
  queryFn,
  refreshInterval = 60000,
  children
}: WidgetTemplateProps) {
  const { data, isLoading } = useQuery({
    queryKey,
    queryFn,
    refetchInterval: refreshInterval
  })

  return (
    <AppWidget
      title={title}
      icon={Icon}
      isConfigured={true}
      onRemove={onRemove || (() => {})}
      configContent={<div>Configure {title}</div>}
      id={id || title.toLowerCase().replace(/\s+/g, '-')}
    >
      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ) : (
        children(data, isLoading)
      )}
    </AppWidget>
  )
}

