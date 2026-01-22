/**
 * Bulk Actions Bar
 * Sticky action bar for bulk operations
 */

import React from 'react'
import { Button } from '@/components/ui/button'
import { X, CheckCircle, AlertCircle, Trash2 } from 'lucide-react'

interface BulkActionsBarProps {
  selectedCount: number
  onMarkComplete?: () => void
  onSetHighPriority?: () => void
  onDelete?: () => void
  onCancel: () => void
}

export function BulkActionsBar({
  selectedCount,
  onMarkComplete,
  onSetHighPriority,
  onDelete,
  onCancel
}: BulkActionsBarProps) {
  return (
    <div className="sticky top-0 z-10 bg-primary text-primary-foreground p-3 flex items-center gap-2 shadow-lg">
      <span className="font-medium">{selectedCount} selected</span>
      <div className="flex-1" />
      {onMarkComplete && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onMarkComplete}
          className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground"
        >
          <CheckCircle className="w-4 h-4 mr-1" />
          Mark Complete
        </Button>
      )}
      {onSetHighPriority && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onSetHighPriority}
          className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground"
        >
          <AlertCircle className="w-4 h-4 mr-1" />
          High Priority
        </Button>
      )}
      {onDelete && (
        <Button
          variant="secondary"
          size="sm"
          onClick={onDelete}
          className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Delete
        </Button>
      )}
      <Button
        variant="secondary"
        size="sm"
        onClick={onCancel}
        className="bg-primary-foreground/10 hover:bg-primary-foreground/20 text-primary-foreground"
      >
        <X className="w-4 h-4 mr-1" />
        Cancel
      </Button>
    </div>
  )
}

