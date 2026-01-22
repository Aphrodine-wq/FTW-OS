/**
 * Workflow Templates
 * Pre-built workflow automation templates
 */

import { WorkflowRule } from '@/types/workflow'

export const WORKFLOW_TEMPLATES: WorkflowRule[] = [
  {
    id: 'invoice-reminder',
    name: 'Invoice Payment Reminder',
    enabled: true,
    trigger: {
      type: 'schedule',
      config: { cron: '0 9 * * *' } // Daily at 9 AM
    },
    conditions: [
      { field: 'status', operator: 'equals', value: 'unpaid' },
      { field: 'dueDate', operator: 'less_than', value: 'today' }
    ],
    actions: [
      {
        type: 'send_email',
        config: {
          template: 'payment-reminder',
          to: '{{client.email}}'
        }
      },
      {
        type: 'notify',
        config: {
          message: 'Payment reminder sent to {{client.name}}'
        }
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'auto-categorize-expense',
    name: 'Auto-categorize Expenses',
    enabled: true,
    trigger: {
      type: 'expense_submitted',
      config: {}
    },
    conditions: [
      {
        field: 'description',
        operator: 'contains',
        value: 'uber|lyft|taxi'
      }
    ],
    actions: [
      {
        type: 'update_status',
        config: {
          category: 'Transportation'
        }
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'project-task-complete',
    name: 'Notify on Project Milestone',
    enabled: true,
    trigger: {
      type: 'task_completed',
      config: {}
    },
    conditions: [
      {
        field: 'tags',
        operator: 'contains',
        value: 'milestone'
      }
    ],
    actions: [
      {
        type: 'notify',
        config: {
          message: '🎉 Milestone completed: {{task.title}}',
          sound: true
        }
      },
      {
        type: 'create_task',
        config: {
          title: 'Review milestone: {{task.title}}',
          project: '{{task.project}}'
        }
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'invoice-paid-thanks',
    name: 'Thank You on Payment',
    enabled: true,
    trigger: {
      type: 'invoice_paid',
      config: {}
    },
    conditions: [],
    actions: [
      {
        type: 'send_email',
        config: {
          template: 'payment-thanks',
          to: '{{client.email}}'
        }
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

