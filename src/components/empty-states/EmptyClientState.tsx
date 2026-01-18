import React from 'react'
import { Users, Plus } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'

interface EmptyClientStateProps {
  onAddClient?: () => void
}

export function EmptyClientState({ onAddClient }: EmptyClientStateProps) {
  return (
    <EmptyState
      icon={Users}
      title="No clients yet"
      description="Add your first client to start managing relationships and projects"
      actionLabel="Add Client"
      actionIcon={Plus}
      onAction={onAddClient}
    />
  )
}
