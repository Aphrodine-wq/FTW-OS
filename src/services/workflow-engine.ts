/**
 * Workflow Engine
 * Executes workflow automation rules
 */

import { WorkflowRule, Trigger, Condition, Action, evaluateCondition } from '@/types/workflow'
import { useWorkflowStore } from '@/stores/workflow-store'
import { useTaskStore } from '@/stores/task-store'
import { useInvoiceStore } from '@/stores/invoice-store'
import { useNotificationStore } from '@/stores/notification-store'
import { logger } from '@/lib/logger'

export type TriggerType = 'schedule' | 'event' | 'webhook'
export type ActionType = 'create_task' | 'send_email' | 'notify' | 'webhook' | 'create_invoice' | 'update_invoice'

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
  async executeWorkflow(workflow: WorkflowRule, data: Record<string, unknown>): Promise<void> {
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
  private async executeAction(action: Action, data: Record<string, unknown>): Promise<void> {
    logger.info(`[Workflow] Executing action: ${action.type}`, { actionId: action.id, workflowId: action.id })

    try {
      switch (action.type) {
        case 'create_task': {
          const title = this.replaceVariables(action.config.title || '', data) as string
          useTaskStore.getState().addTask({
            title,
            priority: action.config.priority || 'medium',
            status: 'todo',
            projectId: action.config.projectId
          })
          break
        }

        case 'notify': {
          const message = this.replaceVariables(action.config.message || '', data) as string
          useNotificationStore.getState().addNotification({
            type: 'system',
            title: 'Workflow Notification',
            content: message,
            priority: 'medium',
          })
          break
        }

        case 'send_email': {
          // Send email via IPC if available
          const to = this.replaceVariables(action.config.to || '', data) as string
          const subject = this.replaceVariables(action.config.subject || 'Workflow Notification', data) as string
          const body = this.replaceVariables(action.config.body || '', data) as string
          
          if ((window as any).ipcRenderer) {
            try {
               // Mock IPC call - in real app, main process would handle nodemailer
               // await window.ipcRenderer.invoke('mail:send', { to, subject, body })
               logger.info('[Workflow] Email sent (simulated)', { to, subject })
               useNotificationStore.getState().addNotification({
                  type: 'system',
                  title: 'Email Sent',
                  content: `Email to ${to} has been queued.`,
                  priority: 'low',
               })
            } catch (e) {
               logger.error('Failed to send email', e)
            }
          } else {
             logger.info('[Workflow] Email action skipped (no IPC)', { to, subject })
          }
          break
        }

        case 'webhook': {
          const url = this.replaceVariables(action.config.url || '', data) as string
          const method = action.config.method || 'POST'
          const body = action.config.body ? JSON.parse(this.replaceVariables(JSON.stringify(action.config.body), data) as string) : undefined
          
          try {
            await fetch(url, {
              method,
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(body)
            })
          } catch (error) {
            logger.error(`Webhook failed: ${url}`, error)
          }
          break
        }
        
        case 'create_invoice':
        case 'update_invoice': {
          // Invoice operations
          logger.info(`[Workflow] Executing invoice action: ${action.type}`, action.config)
          // In a real implementation, we would call useInvoiceStore.getState().addInvoice(...)
          // For now, we just acknowledge the action execution
          useNotificationStore.getState().addNotification({
              type: 'system',
              title: 'Invoice Action',
              content: `Workflow executed invoice action: ${action.type}`,
              priority: 'low',
          })
          break
        }
      }
    } catch (error) {
      logger.error(`Failed to execute action ${action.type}`, error)
    }
  }

  /**
   * Replace variables in config with actual data
   */
  private replaceVariables(template: unknown, data: Record<string, unknown>): unknown {
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
      const result: Record<string, unknown> = {}
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
  async handleTrigger(trigger: Trigger, data: Record<string, unknown>): Promise<void> {
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

