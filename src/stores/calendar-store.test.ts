import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// Mock crypto
const mockCrypto = {
  randomUUID: vi.fn().mockReturnValue('test-uuid')
}
vi.stubGlobal('crypto', mockCrypto)

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
}
vi.stubGlobal('localStorage', mockLocalStorage)

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }
}))

import { useCalendarStore } from './calendar-store'

describe('CalendarStore', () => {
  beforeEach(() => {
    useCalendarStore.setState({ events: [] })
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should add an event', () => {
    const event = {
      title: 'Meeting',
      start: new Date('2024-01-01T10:00:00'),
      end: new Date('2024-01-01T11:00:00')
    }

    useCalendarStore.getState().addEvent(event)

    const state = useCalendarStore.getState()
    expect(state.events).toHaveLength(1)
    expect(state.events[0]).toEqual({ ...event, id: 'test-uuid' })
    expect(mockCrypto.randomUUID).toHaveBeenCalled()
  })

  it('should update an event', () => {
    const event = {
      id: '1',
      title: 'Old Title',
      start: new Date(),
      end: new Date()
    }
    useCalendarStore.setState({ events: [event] })

    useCalendarStore.getState().updateEvent('1', { title: 'New Title' })

    const state = useCalendarStore.getState()
    expect(state.events[0].title).toBe('New Title')
  })

  it('should remove an event', () => {
    const event = {
      id: '1',
      title: 'Meeting',
      start: new Date(),
      end: new Date()
    }
    useCalendarStore.setState({ events: [event] })

    useCalendarStore.getState().removeEvent('1')

    const state = useCalendarStore.getState()
    expect(state.events).toHaveLength(0)
  })

  it('should get events by date range', () => {
    const events = [
      { id: '1', title: 'Jan 1', start: new Date('2024-01-01'), end: new Date('2024-01-01') },
      { id: '2', title: 'Jan 10', start: new Date('2024-01-10'), end: new Date('2024-01-10') },
      { id: '3', title: 'Feb 1', start: new Date('2024-02-01'), end: new Date('2024-02-01') }
    ]
    useCalendarStore.setState({ events })

    const result = useCalendarStore.getState().getEventsByDateRange(
      new Date('2024-01-01'),
      new Date('2024-01-15')
    )

    expect(result).toHaveLength(2)
    expect(result.map(e => e.id)).toEqual(['1', '2'])
  })
})
