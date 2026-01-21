import React, { useState } from 'react'
import { Check, Trash2, Plus, Calendar, AlertCircle, Clock, ArrowRight } from 'lucide-react'
import { cn } from '@/services/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { motion, AnimatePresence } from 'framer-motion'

interface Task {
  id: string
  text: string
  completed: boolean
  priority: 'high' | 'medium' | 'low'
  createdAt: number
  dueDate?: string
}

export function TaskList() {
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('fairtrade-tasks')
    return saved ? JSON.parse(saved) : []
  })
  const [newTask, setNewTask] = useState('')
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium')
  const { toast } = useToast()

  React.useEffect(() => {
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
    toast({ title: "Task Added", description: "Added to your list." })
  }

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ))
  }

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high': return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'medium': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
      case 'low': return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      default: return 'bg-slate-500/10 text-slate-500'
    }
  }

  const activeTasks = tasks.filter(t => !t.completed)
  const completedTasks = tasks.filter(t => t.completed)

  return (
    <div className="h-full flex flex-col gap-6 p-1 overflow-hidden">
      <div className="flex justify-between items-end px-1">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">My Tasks</h2>
          <p className="text-slate-500 text-sm">You have {activeTasks.length} pending tasks</p>
        </div>
      </div>

      {/* Input Area */}
      <form onSubmit={addTask} className="relative">
        <div className="flex gap-2 p-2 bg-white border border-slate-200 rounded-xl shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
          <Input
            value={newTask}
            onChange={e => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="border-0 shadow-none focus-visible:ring-0 bg-transparent text-lg h-10"
          />
          <div className="flex items-center gap-2 pr-1">
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="bg-slate-50 text-slate-600 text-xs font-bold uppercase p-2 rounded-lg border border-slate-200 outline-none cursor-pointer hover:bg-slate-100 transition-colors"
            >
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <Button size="icon" type="submit" className="h-9 w-9 bg-slate-900 text-white hover:bg-slate-800 rounded-lg shadow-sm">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>

      {/* Task List */}
      <ScrollArea className="flex-1 -mx-2 px-2">
        <div className="space-y-6 pb-20">
          {/* Active Tasks */}
          <div className="space-y-2">
            {activeTasks.length === 0 && completedTasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 opacity-50">
                <CheckCircle2 className="h-16 w-16 mb-4 stroke-1" />
                <p className="text-lg">No tasks yet</p>
              </div>
            ) : (
              activeTasks.map(task => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  key={task.id}
                  className="group flex items-start gap-4 p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-sm transition-all duration-200"
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="mt-1 h-5 w-5 rounded-full border-2 border-slate-300 flex items-center justify-center transition-colors hover:border-blue-500 text-transparent"
                  >
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium text-slate-900 leading-snug">{task.text}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={cn("text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border", getPriorityColor(task.priority))}>
                        {task.priority}
                      </span>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(task.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </motion.div>
              ))
            )}
          </div>

          {/* Completed Tasks */}
          {completedTasks.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pl-1">Completed</h3>
              {completedTasks.map(task => (
                <div
                  key={task.id}
                  className="flex items-center gap-4 p-3 rounded-xl border border-transparent bg-slate-50 opacity-60 hover:opacity-100 transition-all"
                >
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="h-5 w-5 rounded-full bg-green-500 border-2 border-green-500 flex items-center justify-center text-white"
                  >
                    <Check className="h-3 w-3 stroke-[3]" />
                  </button>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-500 line-through decoration-slate-400">{task.text}</p>
                  </div>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-2 text-slate-400 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

function CheckCircle2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
