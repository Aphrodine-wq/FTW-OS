/**
 * Workflow Engine
 * Executes workflow automation rules
 */

import { WorkflowRule, Trigger, Condition, Action, evaluateCondition } from '@/types/workflow'
import { useWorkflowStore } from '@/stores/workflow-store'
import { useTaskStore } from '@/stores/task-store'
import { useInvoiceStore } from '@/stores/invoice-store'
import { useNotificationStore } from '@/stores/notification-store'
import { notificationEngine } from './smart-notifications'

export class WorkflowEngine {
  private scheduleTimers: Map<string, NodeJS.Timeout> = new Map()

  /**
   * Initialize workflow engine
   */
  initialize() {
    const workflows = useWorkflowStore.getState().workflows
    workflows.forEach(workflow => {
      if (workflow.enabled && workflow.trigger.type === 'schedule') {
        this.scheduleWorkflow(workflow)
      }
    })
  }

  /**
   * Schedule a workflow based on cron-like config
   */
  private scheduleWorkflow(workflow: WorkflowRule) {
    // Simple daily schedule for now (9 AM)
    // In production, use a proper cron parser
    const now = new Date()
    const nextRun = new Date()
    nextRun.setHours(9, 0, 0, 0)
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1)
    }

    const delay = nextRun.getTime() - now.getTime()
    const timer = setTimeout(() => {
      this.executeWorkflow(workflow, {})
      // Reschedule for next day
      this.scheduleWorkflow(workflow)
    }, delay)

    this.scheduleTimers.set(workflow.id, timer)
  }

  /**
   * Execute a workflow
   */
  async executeWorkflow(workflow: WorkflowRule, data: any): Promise<void> {
    if (!workflow.enabled) return

    // Check conditions
    const conditionsMet = workflow.conditions.every(condition =>
      evaluateCondition(condition, data)
    )

    if (!conditionsMet) return

    // Execute actions
    for (const action of workflow.actions) {
      await this.executeAction(action, data)
    }
  }

  /**
   * Execute a single action
   */
  private async executeAction(action: Action, data: any): Promise<void> {
    switch (action.type) {
      case 'create_task': {
        const taskStore = useTaskStore.getState()
        const taskConfig = this.replaceVariables(action.config, data)
        taskStore.addTask({
          title: taskConfig.title || 'New Task',
          description: taskConfig.description || '',
          priority: taskConfig.priority || 'medium',
          tags: taskConfig.tags || []
        })
        break
      }

      case 'update_status': {
        // This would update the status of the triggering item
        // Implementation depends on the data structure
        console.log('Update status:', action.config, data)
        break
      }

      case 'notify': {
        const message = this.replaceVariables(action.config.message || '', data)
        notificationEngine.notify({
          type: 'system',
          title: 'Workflow Notification',
          content: message,
          priority: 'normal',
          timestamp: new Date()
        })
        break
      }

      case 'send_email': {
        // Email sending would be implemented here
        // For now, just log
        console.log('Send email:', action.config, data)
        break
      }

      case 'webhook': {
        // Webhook execution
        if (action.config.url) {
          try {
            await fetch(action.config.url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(data)
            })
          } catch (error) {
            console.error('Webhook error:', error)
          }
        }
        break
      }

      case 'create_invoice':
      case 'update_invoice': {
        // Invoice operations
        console.log('Invoice action:', action.type, action.config, data)
        break
      }
    }
  }

  /**
   * Replace variables in config with actual data
   */
  private replaceVariables(template: any, data: any): any {
    if (typeof template === 'string') {
      let result = template
      for (const [key, value] of Object.entries(data)) {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g')
        result = result.replace(regex, String(value))
      }
      return result
    } else if (Array.isArray(template)) {
      return template.map(item => this.replaceVariables(item, data))
    } else if (typeof template === 'object' && template !== null) {
      const result: any = {}
      for (const [key, value] of Object.entries(template)) {
        result[key] = this.replaceVariables(value, data)
      }
      return result
    }
    return template
  }

  /**
   * Handle trigger event
   */
  async handleTrigger(trigger: Trigger, data: any): Promise<void> {
    const workflows = useWorkflowStore.getState().workflows.filter(
      w => w.enabled && w.trigger.type === trigger.type
    )

    for (const workflow of workflows) {
      await this.executeWorkflow(workflow, data)
    }
  }

  /**
   * Cleanup timers
   */
  cleanup() {
    this.scheduleTimers.forEach(timer => clearTimeout(timer))
    this.scheduleTimers.clear()
  }
}

export const workflowEngine = new WorkflowEngine()

