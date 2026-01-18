/**
 * Bulk Operations Hook
 * Generic hook for bulk selection and operations
 */

import { useState } from 'react'
import { toast } from '@/components/ui/use-toast'

export function useBulkOperations<T extends { id: string }>(
  items: T[],
  onUpdate: (ids: string[], updates: Partial<T>) => Promise<void>
) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [isSelectMode, setIsSelectMode] = useState(false)

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const selectAll = () => {
    setSelected(new Set(items.map(i => i.id)))
  }

  const clearSelection = () => {
    setSelected(new Set())
    setIsSelectMode(false)
  }

  const bulkUpdate = async (updates: Partial<T>) => {
    if (selected.size === 0) return

    try {
      await onUpdate(Array.from(selected), updates)
      clearSelection()
      toast({
        title: 'Updated',
        description: `Updated ${selected.size} item${selected.size !== 1 ? 's' : ''}`
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update items',
        variant: 'destructive'
      })
    }
  }

  const bulkDelete = async (onDelete: (ids: string[]) => Promise<void>) => {
    if (selected.size === 0) return

    try {
      await onDelete(Array.from(selected))
      clearSelection()
      toast({
        title: 'Deleted',
        description: `Deleted ${selected.size} item${selected.size !== 1 ? 's' : ''}`
      })
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete items',
        variant: 'destructive'
      })
    }
  }

  return {
    selected,
    isSelectMode,
    setIsSelectMode,
    toggleSelect,
    selectAll,
    clearSelection,
    bulkUpdate,
    bulkDelete,
    selectedCount: selected.size
  }
}

