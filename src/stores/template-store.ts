import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Template } from '@/types/invoice'
import { Template as WorkflowTemplate, replaceVariables, extractVariables } from '@/types/template'
import { DEFAULT_TEMPLATES } from '@/lib/default-templates'
import { TEMPLATES as REGISTRY_TEMPLATES } from './template-registry'
import { useInvoiceStore } from './invoice-store'
import { useTaskStore } from './task-store'
import { logger } from '@/lib/logger'

interface TemplateStore {
  // Invoice templates (existing)
  activeTemplateId: string
  templates: Template[]
  customization: {
    primaryColor: string
    fontFamily: string
    layout: 'standard' | 'compact' | 'bold'
  }
  setActiveTemplate: (id: string) => void
  updateCustomization: (updates: Partial<TemplateStore['customization']>) => void

  // Workflow templates (new)
  workflowTemplates: WorkflowTemplate[]
  createFromTemplate: (templateId: string, variables: Record<string, any>) => Promise<void>
  saveAsTemplate: (name: string, type: WorkflowTemplate['type'], content: any) => void
  deleteTemplate: (id: string) => void
}

// Map registry templates to invoice templates
const mappedTemplates: Template[] = REGISTRY_TEMPLATES.map(t => ({
  id: t.id,
  name: t.name,
  description: `${t.style} style template for ${t.category}`,
  type: 'built-in',
  config: {
    colors: { 
      primary: t.colors.primary, 
      secondary: t.colors.secondary, 
      accent: t.colors.text 
    },
    fonts: { 
      heading: t.fonts.header, 
      body: t.fonts.body 
    },
    layout: { 
      headerPosition: 'top', 
      logoPosition: 'left', 
      showLogo: true, 
      showBusinessInfo: true, 
      showClientInfo: true 
    }
  }
}))

export const useTemplateStore = create<TemplateStore>()(
  persist(
    (set, get) => ({
      // Invoice templates (existing)
      activeTemplateId: 'fortune500', // Default to first registry template
      templates: mappedTemplates,
      customization: {
        primaryColor: '#1e293b',
        fontFamily: 'Inter',
        layout: 'standard'
      },
      setActiveTemplate: (id) => set({ activeTemplateId: id }),
      updateCustomization: (updates) => set((state) => ({ 
        customization: { ...state.customization, ...updates } 
      })),

      // Workflow templates (new)
      workflowTemplates: DEFAULT_TEMPLATES,

      createFromTemplate: async (templateId, variables) => {
        const template = get().workflowTemplates.find(t => t.id === templateId)
        if (!template) {
          const err = new Error(`Template ${templateId} not found`)
          logger.error('Template not found', err)
          throw err
        }

        try {
            // Replace variables in content
            const content = JSON.parse(JSON.stringify(template.content))
            const replaced = replaceVariables(content, variables)

            // Create the actual item based on template type
            switch (template.type) {
              case 'invoice': {
                const invoiceStore = useInvoiceStore.getState()
                const dueDate = replaced.dueDate 
                  ? (typeof replaced.dueDate === 'string' ? new Date(replaced.dueDate) : replaced.dueDate)
                  : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
                
                invoiceStore.addInvoice({
                  invoiceNumber: `INV-${Date.now()}`,
                  clientId: '',
                  issueDate: new Date(),
                  dueDate: dueDate,
                  status: 'draft',
                  currency: 'USD',
                  lineItems: replaced.lineItems || [],
                  subtotal: 0,
                  tax: 0,
                  total: 0,
                  notes: replaced.notes || '',
                  terms: replaced.terms || ''
                })
                break
              }

              case 'task-list': {
                const taskStore = useTaskStore.getState()
                if (replaced.tasks && Array.isArray(replaced.tasks)) {
                  replaced.tasks.forEach((task: any) => {
                    taskStore.addTask({
                      title: task.title,
                      description: '',
                      priority: task.priority || 'medium',
                      status: task.status || 'todo',
                      tags: []
                    })
                  })
                }
                break
              }

              case 'email':
              case 'contract':
              case 'project':
                // These types would need their respective stores
                logger.warn('Template type not yet implemented:', template.type)
                break
            }
        } catch (error) {
            logger.error('Failed to create from template', error)
            throw error
        }
      },

      saveAsTemplate: (name, type, content) => {
        const template: WorkflowTemplate = {
          id: Math.random().toString(36).substr(2, 9),
          name,
          category: 'custom',
          type,
          content,
          variables: extractVariables(content),
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date()
        }
        set((state) => ({
          workflowTemplates: [...state.workflowTemplates, template]
        }))
      },

      deleteTemplate: (id) => {
        set((state) => ({
          workflowTemplates: state.workflowTemplates.filter(t => t.id !== id)
        }))
      }
    }),
    {
      name: 'ftw-template-storage'
    }
  )
)
