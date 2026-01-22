import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { logger } from '@/lib/logger'

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: Date
  end: Date
  allDay?: boolean
  resource?: string
  color?: string
}

interface CalendarState {
  events: CalendarEvent[]
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void
  updateEvent: (id: string, updates: Partial<CalendarEvent>) => void
  removeEvent: (id: string) => void
  getEventsByDateRange: (start: Date, end: Date) => CalendarEvent[]
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      events: [],
      
      addEvent: (event) => {
        try {
          const newEvent = {
            ...event,
            id: crypto.randomUUID()
          }
          set((state) => ({
            events: [...state.events, newEvent]
          }))
          logger.info('Calendar event added', { id: newEvent.id, title: newEvent.title })
        } catch (error) {
          logger.error('Failed to add calendar event', error)
        }
      },

      updateEvent: (id, updates) => {
        try {
          set((state) => ({
            events: state.events.map(e => 
              e.id === id ? { ...e, ...updates } : e
            )
          }))
          logger.info('Calendar event updated', { id })
        } catch (error) {
          logger.error('Failed to update calendar event', error)
        }
      },

      removeEvent: (id) => {
        try {
          set((state) => ({
            events: state.events.filter(e => e.id !== id)
          }))
          logger.info('Calendar event removed', { id })
        } catch (error) {
          logger.error('Failed to remove calendar event', error)
        }
      },

      getEventsByDateRange: (start, end) => {
        return get().events.filter(e => 
          (e.start >= start && e.start <= end) ||
          (e.end >= start && e.end <= end) ||
          (e.start <= start && e.end >= end)
        )
      }
    }),
    {
      name: 'ftw-calendar-storage',
      storage: {
        getItem: (name) => {
          const str = localStorage.getItem(name)
          if (!str) return null
          return JSON.parse(str, (key, value) => {
             if (key === 'start' || key === 'end') {
              return new Date(value)
            }
            return value
          })
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value))
        },
        removeItem: (name) => localStorage.removeItem(name),
      }
    }
  )
)
