import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Task } from '@/types/invoice'

interface TaskState {
  tasks: Task[]
  addTask: (task: Omit<Task, 'id' | 'createdAt' | 'status'>) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  removeTask: (id: string) => void
  moveTask: (id: string, status: Task['status']) => void
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set) => ({
      tasks: [],
      
      addTask: (task) => set((state) => ({
        tasks: [
          ...state.tasks,
          {
            ...task,
            id: Math.random().toString(36).substr(2, 9),
            status: 'todo',
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      })),

      updateTask: (id, updates) => set((state) => ({
        tasks: state.tasks.map(t => 
          t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
        )
      })),

      removeTask: (id) => set((state) => ({
        tasks: state.tasks.filter(t => t.id !== id)
      })),

      moveTask: (id, status) => set((state) => ({
        tasks: state.tasks.map(t => 
          t.id === id ? { ...t, status, updatedAt: new Date() } : t
        )
      }))
    }),
    {
      name: 'ftw-tasks-storage',
    }
  )
)