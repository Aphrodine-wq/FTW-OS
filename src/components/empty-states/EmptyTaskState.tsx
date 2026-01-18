import React from 'react'
import { CheckSquare, Plus } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'

interface EmptyTaskStateProps {
  onCreateTask?: () => void
}

export function EmptyTaskState({ onCreateTask }: EmptyTaskStateProps) {
  return (
    <EmptyState
      icon={CheckSquare}
      title="No tasks yet"
      description="Start tracking tasks to organize your work and boost productivity"
      actionLabel="Create Task"
      actionIcon={Plus}
      onAction={onCreateTask}
    />
  )
}
