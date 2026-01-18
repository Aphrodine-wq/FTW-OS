import React from 'react'
import { Receipt, Plus } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'

interface EmptyExpenseStateProps {
  onAddExpense?: () => void
}

export function EmptyExpenseState({ onAddExpense }: EmptyExpenseStateProps) {
  return (
    <EmptyState
      icon={Receipt}
      title="No expenses tracked"
      description="Track your first expense to manage business costs and finances"
      actionLabel="Add Expense"
      actionIcon={Plus}
      onAction={onAddExpense}
    />
  )
}
