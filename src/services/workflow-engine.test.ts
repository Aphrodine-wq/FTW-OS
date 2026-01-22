import { describe, it, expect, vi, beforeEach } from 'vitest'
import { WorkflowEngine } from './workflow-engine'

// Define mocks using vi.hoisted to ensure they are available for vi.mock
const mocks = vi.hoisted(() => ({
  addTask: vi.fn(),
  addInvoice: vi.fn(),
  addNotification: vi.fn(),
  loggerInfo: vi.fn(),
  loggerError: vi.fn()
}))

// Mock stores
vi.mock('@/stores/workflow-store', () => ({
  useWorkflowStore: {
    getState: () => ({
      workflows: []
    })
  }
}))

vi.mock('@/stores/task-store', () => ({
  useTaskStore: {
    getState: () => ({
      addTask: mocks.addTask
    })
  }
}))

vi.mock('@/stores/invoice-store', () => ({
  useInvoiceStore: {
    getState: () => ({
      addInvoice: mocks.addInvoice
    })
  }
}))

vi.mock('@/stores/notification-store', () => ({
  useNotificationStore: {
    getState: () => ({
      addNotification: mocks.addNotification
    })
  }
}))

vi.mock('@/lib/logger', () => ({
  logger: {
    info: mocks.loggerInfo,
    error: mocks.loggerError
  }
}))

describe('WorkflowEngine', () => {
  let engine: WorkflowEngine

  beforeEach(() => {
    engine = new WorkflowEngine()
    vi.clearAllMocks()
  })

  it('should execute notify action', async () => {
    const action = {
      id: '1',
      type: 'notify' as const,
      config: {
        message: 'Hello {{name}}'
      }
    }
    const workflow = {
      id: 'w1',
      name: 'Test Workflow',
      enabled: true,
      trigger: { type: 'event' as const, event: 'test' },
      conditions: [],
      actions: [action]
    }
    
    await engine.executeWorkflow(workflow, { name: 'World' })

    expect(mocks.addNotification).toHaveBeenCalledWith(expect.objectContaining({
      type: 'system',
      title: 'Workflow Notification',
      content: 'Hello World',
      priority: 'medium'
    }))
  })

  it('should execute create_task action', async () => {
    const action = {
      id: '2',
      type: 'create_task' as const,
      config: {
        title: 'Task for {{project}}',
        priority: 'high',
        projectId: 'p1'
      }
    }
    const workflow = {
      id: 'w2',
      name: 'Task Workflow',
      enabled: true,
      trigger: { type: 'event' as const, event: 'test' },
      conditions: [],
      actions: [action]
    }
    
    await engine.executeWorkflow(workflow, { project: 'Alpha' })

    expect(mocks.addTask).toHaveBeenCalledWith(expect.objectContaining({
      title: 'Task for Alpha',
      priority: 'high',
      projectId: 'p1',
      status: 'todo'
    }))
  })
})
