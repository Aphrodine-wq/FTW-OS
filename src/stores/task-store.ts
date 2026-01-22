import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Task } from '@/types/invoice'
import { logger } from '@/lib/logger'

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
      
      addTask: (task) => {
        try {
          set((state) => ({
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
          }))
          logger.info('Task added', { title: task.title })
        } catch (error) {
          logger.error('Failed to add task', error)
        }
      },

      updateTask: (id, updates) => {
        try {
          set((state) => ({
            tasks: state.tasks.map(t =>
              t.id === id ? { ...t, ...updates, updatedAt: new Date() } : t
            )
          }))
          logger.info('Task updated', { id })
        } catch (error) {
          logger.error('Failed to update task', error)
        }
      },

      removeTask: (id) => {
        try {
          set((state) => ({
            tasks: state.tasks.filter(t => t.id !== id)
          }))
          logger.info('Task removed', { id })
        } catch (error) {
          logger.error('Failed to remove task', error)
        }
      },

      moveTask: (id, status) => {
        try {
          set((state) => ({
            tasks: state.tasks.map(t =>
              t.id === id ? { ...t, status, updatedAt: new Date() } : t
            )
          }))
          logger.info('Task moved', { id, status })
        } catch (error) {
          logger.error('Failed to move task', error)
        }
      }
    }),
    {
      name: 'ftw-tasks-storage',
    }
  )
)