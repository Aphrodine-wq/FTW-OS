/**
 * Workflow Types
 * Define workflow automation structures
 */

export type TriggerType = 
  | 'invoice_created' 
  | 'invoice_paid' 
  | 'invoice_overdue'
  | 'task_completed' 
  | 'task_created'
  | 'expense_submitted' 
  | 'time_tracked' 
  | 'schedule'

export type ConditionOperator = 'equals' | 'contains' | 'greater_than' | 'less_than' | 'not_equals'

export type ActionType = 
  | 'send_email' 
  | 'create_task' 
  | 'update_status' 
  | 'notify' 
  | 'webhook'
  | 'update_invoice'
  | 'create_invoice'

export interface Trigger {
  type: TriggerType
  config: any
}

export interface Condition {
  field: string
  operator: ConditionOperator
  value: any
}

export interface Action {
  type: ActionType
  config: any
}

export interface WorkflowRule {
  id: string
  name: string
  enabled: boolean
  trigger: Trigger
  conditions: Condition[]
  actions: Action[]
  createdAt?: Date
  updatedAt?: Date
}

/**
 * Evaluate a condition against data
 */
export function evaluateCondition(condition: Condition, data: any): boolean {
  const fieldValue = data[condition.field]
  const conditionValue = condition.value

  switch (condition.operator) {
    case 'equals':
      return fieldValue === conditionValue
    case 'not_equals':
      return fieldValue !== conditionValue
    case 'contains':
      return String(fieldValue).toLowerCase().includes(String(conditionValue).toLowerCase())
    case 'greater_than':
      return Number(fieldValue) > Number(conditionValue)
    case 'less_than':
      return Number(fieldValue) < Number(conditionValue)
    default:
      return false
  }
}

