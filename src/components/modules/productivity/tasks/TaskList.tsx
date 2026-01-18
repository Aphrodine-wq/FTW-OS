import React, { useState, useEffect } from 'react'
import { Check, Trash2, Plus, Calendar, AlertCircle } from 'lucide-react'
import { cn } from '@/services/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'

interface Task {
  id: string
  text: string
  completed: boolean
  priority: 'high' | 'medium' | 'low'
  createdAt: number
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [newTask, setNewTask] = useState('')
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium')
  const { toast } = useToast()

  // Load tasks from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('fairtrade-tasks')
    if (saved) {
      try {
        setTasks(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to parse tasks', e)
      }
    }
  }, [])

  // Save tasks whenever they change
  useEffect(() => {
    localStorage.setItem('fairtrade-tasks', JSON.stringify(tasks))
  }, [tasks])

  const addTask = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTask.trim()) return

    const task: Task = {
      id: Date.now().toString(),
      text: newTask,
      completed: false,
      priority,
      createdAt: Date.now()
    }

    setTasks(prev => [task, ...prev])
    setNewTask('')
    toast({ title: "Task Added", description: "Stay focused." })
  }

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ))
  }

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const clearCompleted = () => {
    setTasks(prev => prev.filter(t => !t.completed))
    toast({ title: "Cleaned Up", description: "Completed tasks removed." })
  }

  return (
    <div className="h-full flex flex-col gap-6 p-4 max-w-4xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-[var(--text-main)]">Tasks</h2>
          <p className="text-[var(--text-muted)]">Priority Management</p>
        </div>
        {tasks.some(t => t.completed) && (
          <Button variant="outline" onClick={clearCompleted} className="text-[var(--danger)] hover:bg-[var(--danger)]/10 border-[var(--danger)]/20">
            Clear Completed
          </Button>
        )}
      </div>

      {/* Input Area */}
      <form onSubmit={addTask} className="relative group">
        <div className="flex gap-2 p-2 bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl shadow-sm transition-shadow focus-within:shadow-md focus-within:border-[var(--accent-primary)]">
          <Input 
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            placeholder="What needs to be done?"
            className="border-0 shadow-none focus-visible:ring-0 bg-transparent text-[var(--text-main)] placeholder:text-[var(--text-muted)] text-lg h-12"
          />
          <div className="flex items-center gap-2 pr-2">
            <select 
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="bg-[var(--bg-surface-hover)] text-[var(--text-muted)] text-xs font-bold uppercase p-2 rounded-lg border-none outline-none cursor-pointer hover:text-[var(--text-main)] transition-colors"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <Button size="icon" type="submit" className="h-10 w-10 bg-[var(--accent-primary)] text-[var(--bg-app)] hover:brightness-110 rounded-lg">
              <Plus className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </form>

      {/* Task List */}
      <div className="flex-1 overflow-auto custom-scrollbar space-y-2">
        {tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-[var(--text-muted)] opacity-50">
            <Check className="h-16 w-16 mb-4 stroke-1" />
            <p className="text-lg">All caught up</p>
          </div>
        ) : (
          tasks.map(task => (
            <div 
              key={task.id}
              className={cn(
                "group flex items-center gap-4 p-4 rounded-xl border transition-all duration-200",
                task.completed 
                  ? "bg-[var(--bg-app)] border-transparent opacity-60" 
                  : "bg-[var(--bg-surface)] border-[var(--border-subtle)] hover:border-[var(--accent-primary)] hover:shadow-sm"
              )}
            >
              <button
                onClick={() => toggleTask(task.id)}
                className={cn(
                  "h-6 w-6 rounded-full border-2 flex items-center justify-center transition-colors",
                  task.completed 
                    ? "bg-[var(--success)] border-[var(--success)] text-[var(--bg-app)]" 
                    : "border-[var(--text-muted)] text-transparent hover:border-[var(--accent-primary)]"
                )}
              >
                <Check className="h-3.5 w-3.5 stroke-[3]" />
              </button>
              
              <div className="flex-1 min-w-0">
                <p className={cn(
                  "text-lg font-medium transition-all truncate",
                  task.completed ? "text-[var(--text-muted)] line-through" : "text-[var(--text-main)]"
                )}>
                  {task.text}
                </p>
                <div className="flex gap-2 mt-1">
                   <span className={cn(
                     "text-[10px] font-bold uppercase px-1.5 py-0.5 rounded",
                     task.priority === 'high' ? "bg-[var(--danger)]/10 text-[var(--danger)]" :
                     task.priority === 'medium' ? "bg-yellow-500/10 text-yellow-500" :
                     "bg-[var(--success)]/10 text-[var(--success)]"
                   )}>
                     {task.priority}
                   </span>
                   <span className="text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                     <Calendar className="h-3 w-3" />
                     {new Date(task.createdAt).toLocaleDateString()}
                   </span>
                </div>
              </div>

              <button 
                onClick={() => deleteTask(task.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 rounded-lg transition-all"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
