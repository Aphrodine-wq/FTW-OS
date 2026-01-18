/**
 * Context-Aware Sidebar
 * Shows relevant information based on current view
 */

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { X, Plus, Calendar } from 'lucide-react'
import { getTasksContext, getFinanceContext, getProjectsContext } from '@/services/context-loader'
import { useTaskStore } from '@/stores/task-store'
import { useInvoiceStore } from '@/stores/invoice-store'

interface ContextSidebarProps {
  activeTab: string
  onNewTask?: () => void
  onNewInvoice?: () => void
  onNewExpense?: () => void
  onViewCalendar?: () => void
  onClose?: () => void
}

export function ContextSidebar({
  activeTab,
  onNewTask,
  onNewInvoice,
  onNewExpense,
  onViewCalendar,
  onClose
}: ContextSidebarProps) {
  const [contextData, setContextData] = useState<any>(null)
  const tasks = useTaskStore(state => state.tasks)
  const invoices = useInvoiceStore(state => state.invoices)

  useEffect(() => {
    const loadContext = () => {
      switch (activeTab) {
        case 'tasks': {
          const context = getTasksContext()
          setContextData({
            type: 'tasks',
            summary: context,
            quickActions: [
              { label: 'New Task', action: onNewTask },
              { label: 'View Calendar', action: onViewCalendar }
            ],
            related: tasks
              .filter(t => t.priority === 'high' || t.status === 'in_progress')
              .slice(0, 5)
          })
          break
        }

        case 'finance':
        case 'expenses':
        case 'history': {
          const context = getFinanceContext()
          setContextData({
            type: 'finance',
            summary: context,
            quickActions: [
              { label: 'New Invoice', action: onNewInvoice },
              { label: 'Add Expense', action: onNewExpense }
            ],
            related: invoices.slice(0, 5)
          })
          break
        }

        case 'projects': {
          const context = getProjectsContext()
          setContextData({
            type: 'projects',
            summary: context,
            quickActions: [],
            related: []
          })
          break
        }

        default:
          setContextData(null)
      }
    }

    loadContext()
  }, [activeTab, tasks, invoices, onNewTask, onNewInvoice, onNewExpense, onViewCalendar])

  if (!contextData) return null

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  return (
    <div className="w-80 border-l bg-muted/30 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Context</h3>
        {onClose && (
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose} title="Hide Context Sidebar">
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Summary cards */}
      <div className="space-y-2">
        {Object.entries(contextData.summary).map(([key, value]) => (
          <Card key={key}>
            <CardContent className="p-3">
              <div className="text-sm text-muted-foreground capitalize mb-1">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
              <div className="text-2xl font-bold">
                {typeof value === 'number' && key.includes('Revenue')
                  ? formatCurrency(value)
                  : typeof value === 'number'
                  ? value
                  : Array.isArray(value)
                  ? value.length
                  : value}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick actions */}
      {contextData.quickActions && contextData.quickActions.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Quick Actions</h4>
          {contextData.quickActions.map((action: any, idx: number) => (
            <Button
              key={idx}
              variant="outline"
              className="w-full justify-start"
              onClick={action.action}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}

      {/* Related items */}
      {contextData.related && contextData.related.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Related</h4>
          <ScrollArea className="h-48">
            <div className="space-y-2">
              {contextData.related.map((item: any, idx: number) => (
                <div
                  key={item.id || idx}
                  className="p-2 rounded-lg bg-background border text-sm"
                >
                  {item.title || item.invoiceNumber || item.description}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  )
}

