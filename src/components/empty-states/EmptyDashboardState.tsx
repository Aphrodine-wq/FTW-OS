import { LayoutDashboard, Settings } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'

interface EmptyDashboardStateProps {
  onConfigure?: () => void
}

export function EmptyDashboardState({ onConfigure }: EmptyDashboardStateProps) {
  return (
    <EmptyState
      icon={LayoutDashboard}
      title="Welcome to your workspace"
      description="Configure your dashboard by adding widgets and customizing your view"
      actionLabel="Configure Dashboard"
      actionIcon={Settings}
      onAction={onConfigure}
    />
  )
}
