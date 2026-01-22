import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useTaskStore } from './task-store'

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  }
}))

describe('TaskStore', () => {
  beforeEach(() => {
    useTaskStore.setState({ tasks: [] })
    vi.clearAllMocks()
  })

  it('should add a task', () => {
    const task = {
      title: 'Test Task',
      description: 'Test Description',
    }

    useTaskStore.getState().addTask(task)

    const tasks = useTaskStore.getState().tasks
    expect(tasks).toHaveLength(1)
    expect(tasks[0]).toMatchObject(task)
    expect(tasks[0].status).toBe('todo')
    expect(tasks[0].id).toBeDefined()
  })

  it('should update a task', () => {
    const task = {
      title: 'Test Task',
    }
    useTaskStore.getState().addTask(task)
    const id = useTaskStore.getState().tasks[0].id

    useTaskStore.getState().updateTask(id, { title: 'Updated Task' })

    const tasks = useTaskStore.getState().tasks
    expect(tasks[0].title).toBe('Updated Task')
  })

  it('should remove a task', () => {
    const task = {
      title: 'Test Task',
    }
    useTaskStore.getState().addTask(task)
    const id = useTaskStore.getState().tasks[0].id

    useTaskStore.getState().removeTask(id)

    const tasks = useTaskStore.getState().tasks
    expect(tasks).toHaveLength(0)
  })

  it('should move a task', () => {
    const task = {
      title: 'Test Task',
    }
    useTaskStore.getState().addTask(task)
    const id = useTaskStore.getState().tasks[0].id

    useTaskStore.getState().moveTask(id, 'done')

    const tasks = useTaskStore.getState().tasks
    expect(tasks[0].status).toBe('done')
  })
})
