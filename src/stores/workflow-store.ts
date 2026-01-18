/**
 * Workflow Store
 * Manages workflow automation rules
 */

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { WorkflowRule, Trigger, Condition, Action, evaluateCondition } from '@/types/workflow'
import { WORKFLOW_TEMPLATES } from '@/lib/workflow-templates'

interface WorkflowState {
  workflows: WorkflowRule[]
  addWorkflow: (workflow: Omit<WorkflowRule, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateWorkflow: (id: string, updates: Partial<WorkflowRule>) => void
  deleteWorkflow: (id: string) => void
  toggleWorkflow: (id: string) => void
  executeWorkflow: (trigger: Trigger, data: any) => Promise<void>
}

export const useWorkflowStore = create<WorkflowState>()(
  persist(
    (set, get) => ({
      workflows: WORKFLOW_TEMPLATES,

      addWorkflow: (workflow) => {
        const newWorkflow: WorkflowRule = {
          ...workflow,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date(),
          updatedAt: new Date()
        }
        set((state) => ({
          workflows: [...state.workflows, newWorkflow]
        }))
      },

      updateWorkflow: (id, updates) => {
        set((state) => ({
          workflows: state.workflows.map(w =>
            w.id === id ? { ...w, ...updates, updatedAt: new Date() } : w
          )
        }))
      },

      deleteWorkflow: (id) => {
        set((state) => ({
          workflows: state.workflows.filter(w => w.id !== id)
        }))
      },

      toggleWorkflow: (id) => {
        set((state) => ({
          workflows: state.workflows.map(w =>
            w.id === id ? { ...w, enabled: !w.enabled, updatedAt: new Date() } : w
          )
        }))
      },

      executeWorkflow: async (trigger, data) => {
        // This is handled by workflow-engine.ts
        // Keeping for API compatibility
        console.log('Workflow execution requested:', trigger.type)
      }
    }),
    {
      name: 'ftw-workflows-storage'
    }
  )
)

