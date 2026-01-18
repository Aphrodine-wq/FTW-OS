/**
 * Quick Capture Component
 * Fast capture for tasks, notes, and expenses
 */

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { useTaskStore } from '@/stores/task-store'
import { useExpenseStore } from '@/stores/expense-store'
import { useNoteStore } from '@/stores/note-store'
import { parseTask, parseExpense, extractAmount, extractHashtags } from '@/lib/nlp-parsers'
import { toast } from '@/components/ui/use-toast'

interface QuickCaptureProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function QuickCapture({ open, onOpenChange }: QuickCaptureProps) {
  const [captureType, setCaptureType] = useState<'task' | 'note' | 'expense'>('task')
  const [content, setContent] = useState('')
  
  const createTask = useTaskStore(state => state.addTask)
  const createExpense = useExpenseStore(state => state.addExpense)
  const createNote = useNoteStore(state => state.createNote)

  // Global hotkey: Ctrl/Cmd + Shift + Space
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.shiftKey && (e.metaKey || e.ctrlKey) && e.code === 'Space') {
        e.preventDefault()
        onOpenChange(true)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onOpenChange])

  const handleCapture = async () => {
    if (!content.trim()) return

    const timestamp = new Date()

    try {
      switch (captureType) {
        case 'task': {
          const taskData = parseTask(content)
          createTask({
            title: taskData.title,
            description: '',
            priority: taskData.priority || 'medium',
            tags: taskData.tags,
            dueDate: taskData.dueDate
          })
          toast({
            title: 'Task captured!',
            description: 'Your task has been saved.'
          })
          break
        }

        case 'note': {
          const tags = extractHashtags(content)
          createNote({
            content,
            tags
          })
          toast({
            title: 'Note saved!',
            description: 'Your note has been saved.'
          })
          break
        }

        case 'expense': {
          const expenseData = parseExpense(content)
          if (expenseData.amount === 0) {
            toast({
              title: 'No amount found',
              description: 'Please include an amount (e.g., $15.50)',
              variant: 'destructive'
            })
            return
          }
          await createExpense({
            description: expenseData.description,
            amount: expenseData.amount,
            date: timestamp,
            category: expenseData.category || 'Other',
            status: 'draft'
          })
          toast({
            title: 'Expense tracked!',
            description: `$${expenseData.amount.toFixed(2)} expense saved.`
          })
          break
        }
      }

      setContent('')
      onOpenChange(false)
    } catch (error) {
      console.error('Error capturing:', error)
      toast({
        title: 'Error',
        description: 'Failed to save. Please try again.',
        variant: 'destructive'
      })
    }
  }

  const getPlaceholder = (type: string): string => {
    switch (type) {
      case 'task':
        return 'Buy groceries #personal @tomorrow'
      case 'note':
        return 'Great idea for #project...'
      case 'expense':
        return 'Lunch $15.50 #meals'
      default:
        return ''
    }
  }

  const detectedAmount = captureType === 'expense' ? extractAmount(content) : 0
  const detectedTags = extractHashtags(content)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Quick Capture</DialogTitle>
          <DialogDescription>
            Capture anything instantly. Parse with natural language.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Type selector */}
          <Tabs value={captureType} onValueChange={(v) => setCaptureType(v as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="task">Task</TabsTrigger>
              <TabsTrigger value="note">Note</TabsTrigger>
              <TabsTrigger value="expense">Expense</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Input */}
          <Textarea
            placeholder={getPlaceholder(captureType)}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[100px]"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                handleCapture()
              }
            }}
          />

          {/* Smart parsing preview */}
          {content && (
            <div className="text-sm text-muted-foreground space-y-1">
              {captureType === 'expense' && detectedAmount > 0 && (
                <p>💰 Amount detected: ${detectedAmount.toFixed(2)}</p>
              )}
              {detectedTags.length > 0 && (
                <p>🏷️ Tags: {detectedTags.join(', ')}</p>
              )}
            </div>
          )}

          <Button onClick={handleCapture} className="w-full">
            Capture <kbd className="ml-2 bg-slate-100 px-1.5 py-0.5 rounded text-xs">⌘↵</kbd>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

