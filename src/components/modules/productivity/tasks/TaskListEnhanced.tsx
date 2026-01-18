import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd'
import { Task } from '@/types/invoice'
import { useTaskStore } from '@/stores/task-store'
import { useProjectStore } from '@/stores/project-store'
import {
  Plus, Check, Clock, AlertCircle, Trash2, Edit2, Tag, Users,
  Filter, Search, Calendar, MessageSquare, Paperclip, ChevronDown,
  Repeat, Flag, MoreVertical, LayoutList, LayoutGrid, Folder
} from 'lucide-react'
import { cn } from '@/services/utils'
import { EmptyTaskState } from '@/components/empty-states'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

const priorityColors = {
  low: { bg: 'bg-blue-50 dark:bg-blue-900/20', border: 'border-blue-200 dark:border-blue-700', text: 'text-blue-700 dark:text-blue-300' },
  medium: { bg: 'bg-yellow-50 dark:bg-yellow-900/20', border: 'border-yellow-200 dark:border-yellow-700', text: 'text-yellow-700 dark:text-yellow-300' },
  high: { bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-700', text: 'text-red-700 dark:text-red-300' },
}

const statusColors = {
  todo: 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  in_progress: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  done: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
}

export const TaskListEnhanced: React.FC = () => {
  const { tasks, addTask, updateTask, removeTask, moveTask } = useTaskStore()
  const { projects } = useProjectStore()
  
  const [viewMode, setViewMode] = useState<'list' | 'board'>('board')
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [filterPriority, setFilterPriority] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedTask, setExpandedTask] = useState<string | null>(null)
  const [isNewTaskOpen, setIsNewTaskOpen] = useState(false)
  
  // New Task Form State
  const [newTask, setNewTask] = useState<{
    title: string
    priority: 'low' | 'medium' | 'high'
    projectId: string
    dueDate: string
  }>({
    title: '',
    priority: 'medium',
    projectId: 'none',
    dueDate: ''
  })

  const handleCreateTask = () => {
    if (!newTask.title.trim()) return

    addTask({
        title: newTask.title,
        priority: newTask.priority,
        projectId: newTask.projectId === 'none' ? undefined : newTask.projectId,
        dueDate: newTask.dueDate ? new Date(newTask.dueDate) : undefined
    })

    setNewTask({ title: '', priority: 'medium', projectId: 'none', dueDate: '' })
    setIsNewTaskOpen(false)
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const { source, destination, draggableId } = result

    if (source.droppableId !== destination.droppableId) {
      moveTask(draggableId, destination.droppableId as Task['status'])
    }
  }

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesStatus = !filterStatus || task.status === filterStatus
      const matchesPriority = !filterPriority || task.priority === filterPriority
      const matchesSearch = !searchQuery ||
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesStatus && matchesPriority && matchesSearch
    })
  }, [tasks, filterStatus, filterPriority, searchQuery])

  const groupedTasks = useMemo(() => {
    const groups = { todo: [], in_progress: [], done: [] } as any
    filteredTasks.forEach(task => {
      groups[task.status].push(task)
    })
    return groups
  }, [filteredTasks])

  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'done').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    overdue: tasks.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'done').length,
  }

  const TaskCard = ({ task }: { task: Task }) => {
    const priority = task.priority || 'low'
    const isExpanded = expandedTask === task.id
    const daysUntilDue = task.dueDate ?
      Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null
    const isOverdue = daysUntilDue !== null && daysUntilDue < 0
    const project = projects.find(p => p.id === task.projectId)

    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={cn(
          "rounded-xl border transition-all cursor-pointer",
          priorityColors[priority as keyof typeof priorityColors].bg,
          priorityColors[priority as keyof typeof priorityColors].border,
          "border-2"
        )}
      >
        {/* Task Header */}
        <div
          onClick={() => setExpandedTask(isExpanded ? null : task.id)}
          className="p-4 space-y-3"
        >
          <div className="flex items-start gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation()
                updateTask(task.id, { status: task.status === 'done' ? 'todo' : 'done' })
              }}
              className={cn(
                "mt-0.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                task.status === 'done'
                  ? "bg-green-500 border-green-500"
                  : "border-gray-300 dark:border-gray-600 hover:border-green-500"
              )}
              style={{ width: 20, height: 20 }}
            >
              {task.status === 'done' && <Check className="w-3.5 h-3.5 text-white" />}
            </motion.button>

            <div className="flex-1 min-w-0">
              <h4 className={cn(
                "font-semibold text-sm leading-snug",
                task.status === 'done' && "line-through opacity-60"
              )}>
                {task.title}
              </h4>
              {project && (
                  <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500 dark:text-gray-400 font-medium">
                      <Folder className="w-3 h-3" />
                      {project.name}
                  </div>
              )}
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <span className={cn(
                "text-xs px-2 py-1 rounded-full font-medium",
                statusColors[task.status as keyof typeof statusColors]
              )}>
                {task.status === 'in_progress' ? 'IP' : task.status === 'done' ? 'Done' : 'Todo'}
              </span>
              <Flag className={cn(
                "w-4 h-4",
                priority === 'high' && "text-red-500",
                priority === 'medium' && "text-yellow-500",
                priority === 'low' && "text-blue-500"
              )} />
            </div>
          </div>

          {/* Quick Info */}
          <div className="flex gap-3 text-xs flex-wrap">
            {task.dueDate && (
              <div className={cn("flex items-center gap-1", isOverdue && "text-red-600 dark:text-red-400 font-semibold")}>
                <Calendar className="w-3.5 h-3.5" />
                {isOverdue ? `${Math.abs(daysUntilDue!)} days overdue` : `${daysUntilDue} days left`}
              </div>
            )}
            {task.estimatedHours && (
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {task.actualHours ? `${task.actualHours}/${task.estimatedHours}h` : `${task.estimatedHours}h est`}
              </div>
            )}
            {task.assignee && (
              <div className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {task.assignee}
              </div>
            )}
          </div>
        </div>

        {/* Expanded Details */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-current/10 px-4 py-4 space-y-4"
            >
              {/* Description */}
              {task.description && (
                <div>
                  <p className="text-xs font-semibold opacity-70 mb-1">Description</p>
                  <p className="text-sm leading-relaxed">{task.description}</p>
                </div>
              )}

              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <div>
                  <p className="text-xs font-semibold opacity-70 mb-2">Tags</p>
                  <div className="flex gap-2 flex-wrap">
                    {task.tags.map(tag => (
                      <span key={tag} className="text-xs px-2.5 py-1 rounded-full bg-white/30 dark:bg-black/20">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-white/20 dark:bg-black/20 hover:bg-white/30 dark:hover:bg-black/30 transition-colors text-xs font-medium flex items-center gap-1 justify-center"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  Edit
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => removeTask(task.id)}
                  className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 transition-colors text-red-600 dark:text-red-400 text-xs font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    )
  }

  const ListView = () => (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-gray-800">
          <tr>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3">Task</th>
            <th className="px-4 py-3">Project</th>
            <th className="px-4 py-3">Priority</th>
            <th className="px-4 py-3">Due Date</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
          {filteredTasks.map(task => (
            <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td className="px-4 py-3">
                <span className={cn(
                  "text-xs px-2 py-1 rounded-full font-medium",
                  statusColors[task.status as keyof typeof statusColors]
                )}>
                  {task.status === 'in_progress' ? 'IP' : task.status === 'done' ? 'Done' : 'Todo'}
                </span>
              </td>
              <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">
                {task.title}
                {task.description && <p className="text-xs text-gray-500 truncate max-w-[200px]">{task.description}</p>}
              </td>
              <td className="px-4 py-3">
                {projects.find(p => p.id === task.projectId)?.name || '-'}
              </td>
              <td className="px-4 py-3">
                <Flag className={cn(
                  "w-4 h-4 inline mr-1",
                  task.priority === 'high' && "text-red-500",
                  task.priority === 'medium' && "text-yellow-500",
                  task.priority === 'low' && "text-blue-500"
                )} />
                <span className="capitalize">{task.priority}</span>
              </td>
              <td className="px-4 py-3">
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
              </td>
              <td className="px-4 py-3 text-right flex justify-end gap-2">
                <button className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-blue-600">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => removeTask(task.id)} className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600">
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <div className="h-full flex flex-col bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
      {/* Header & Stats */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Tasks</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {stats.completed} of {stats.total} completed
            </p>
          </div>
          <div className="flex gap-2">
            <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1 flex">
              <button
                onClick={() => setViewMode('board')}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === 'board' ? "bg-white dark:bg-gray-700 shadow-sm" : "text-gray-500"
                )}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  viewMode === 'list' ? "bg-white dark:bg-gray-700 shadow-sm" : "text-gray-500"
                )}
              >
                <LayoutList className="w-4 h-4" />
              </button>
            </div>
            
            <Dialog open={isNewTaskOpen} onOpenChange={setIsNewTaskOpen}>
                <DialogTrigger asChild>
                    <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:shadow-xl transition-shadow"
                    >
                    <Plus className="w-6 h-6" />
                    </motion.button>
                </DialogTrigger>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Create New Task</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Task Title</label>
                            <Input 
                                value={newTask.title}
                                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                                placeholder="What needs to be done?"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Priority</label>
                                <Select value={newTask.priority} onValueChange={(v: any) => setNewTask({ ...newTask, priority: v })}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="low">Low</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="high">High</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Due Date</label>
                                <Input 
                                    type="date"
                                    value={newTask.dueDate}
                                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Project</label>
                            <Select value={newTask.projectId} onValueChange={(v) => setNewTask({ ...newTask, projectId: v })}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a project..." />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="none">No Project</SelectItem>
                                    {projects.map(p => (
                                        <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <Button className="w-full" onClick={handleCreateTask}>Create Task</Button>
                    </div>
                </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-3">
          <div className="px-3 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/20">
            <p className="text-xs text-blue-700 dark:text-blue-300 font-semibold">{stats.inProgress}</p>
            <p className="text-xs text-blue-600 dark:text-blue-400">In Progress</p>
          </div>
          <div className="px-3 py-2 rounded-lg bg-green-50 dark:bg-green-900/20">
            <p className="text-xs text-green-700 dark:text-green-300 font-semibold">{stats.completed}</p>
            <p className="text-xs text-green-600 dark:text-green-400">Completed</p>
          </div>
          <div className="px-3 py-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
            <p className="text-xs text-yellow-700 dark:text-yellow-300 font-semibold">{stats.total - stats.completed}</p>
            <p className="text-xs text-yellow-600 dark:text-yellow-400">Todo</p>
          </div>
          <div className={cn(
            "px-3 py-2 rounded-lg",
            stats.overdue > 0 ? "bg-red-50 dark:bg-red-900/20" : "bg-gray-50 dark:bg-gray-800"
          )}>
            <p className={cn("text-xs font-semibold", stats.overdue > 0 ? "text-red-700 dark:text-red-300" : "text-gray-700 dark:text-gray-300")}>
              {stats.overdue}
            </p>
            <p className={cn("text-xs", stats.overdue > 0 ? "text-red-600 dark:text-red-400" : "text-gray-600 dark:text-gray-400")}>
              Overdue
            </p>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={filterStatus || ''}
            onChange={(e) => setFilterStatus(e.target.value || null)}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="">All Status</option>
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
          <select
            value={filterPriority || ''}
            onChange={(e) => setFilterPriority(e.target.value || null)}
            className="px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
      </div>

      {/* Task Lists */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {tasks.length === 0 ? (
          <Card className="border-2 border-dashed">
            <CardContent className="py-12">
              <EmptyTaskState
                onCreateTask={() => setIsNewTaskOpen(true)}
              />
            </CardContent>
          </Card>
        ) : viewMode === 'list' ? (
          <ListView />
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <div className="flex gap-6 overflow-x-auto pb-4 h-full">
              {['todo', 'in_progress', 'done'].map(status => (
                <Droppable key={status} droppableId={status}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={cn(
                        "flex-1 min-w-[300px] flex flex-col gap-3 rounded-xl p-4 transition-colors",
                        snapshot.isDraggingOver ? "bg-gray-100 dark:bg-gray-800/80" : "bg-gray-50/50 dark:bg-gray-800/30"
                      )}
                    >
                      <h3 className="font-semibold text-sm text-gray-600 dark:text-gray-400 mb-1 uppercase tracking-wide flex justify-between">
                        <span>{status === 'in_progress' ? '🚀 In Progress' : status === 'todo' ? '📋 Todo' : '✅ Done'}</span>
                        <span className="text-xs opacity-70">({groupedTasks[status].length})</span>
                      </h3>
                      
                      <div className="space-y-3 flex-1 min-h-[100px]">
                        {groupedTasks[status].map((task: Task, index: number) => (
                          <Draggable key={task.id} draggableId={task.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                style={{ ...provided.draggableProps.style }}
                                className={snapshot.isDragging ? "opacity-50" : ""}
                              >
                                <TaskCard task={task} />
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          </DragDropContext>
        )}
      </div>
    </div>
  )
}
