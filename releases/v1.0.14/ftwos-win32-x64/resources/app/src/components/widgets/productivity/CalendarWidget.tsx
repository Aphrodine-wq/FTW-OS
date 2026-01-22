import React from 'react'
import { Calendar, Clock } from 'lucide-react'
import { AppWidget } from '../core/AppWidget'
import { useQuery } from '@tanstack/react-query'
import { format } from 'date-fns'

interface CalendarEvent {
  id: string
  title: string
  time: string
  date: Date
}

export function CalendarWidget({ id, onRemove }: { id?: string; onRemove?: () => void }) {
  const { data: events, isLoading } = useQuery<CalendarEvent[]>({
    queryKey: ['calendar-events'],
    queryFn: async () => {
      // Integrate with calendar API (Google Calendar, Outlook, etc.)
      // For demo, returning mock data
      const now = new Date()
      return [
        {
          id: '1',
          title: 'Team Meeting',
          time: '10:00 AM',
          date: new Date(now.getTime() + 2 * 60 * 60 * 1000)
        },
        {
          id: '2',
          title: 'Client Call',
          time: '2:00 PM',
          date: new Date(now.getTime() + 6 * 60 * 60 * 1000)
        },
        {
          id: '3',
          title: 'Project Review',
          time: '4:30 PM',
          date: new Date(now.getTime() + 8.5 * 60 * 60 * 1000)
        }
      ]
    },
    refetchInterval: 300000 // 5 minutes
  })

  return (
    <AppWidget
      title="Upcoming Events"
      icon={Calendar}
      isConfigured={true}
      onRemove={onRemove || (() => {})}
      configContent={<div>Configure Calendar</div>}
      id={id || 'calendar'}
    >
      <div className="space-y-2">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-16 bg-gray-100 rounded animate-pulse" />
            <div className="h-16 bg-gray-100 rounded animate-pulse" />
          </div>
        ) : events && events.length > 0 ? (
          events.slice(0, 3).map((event) => (
            <div key={event.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50">
              <div className="p-2 bg-blue-100 rounded">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">{event.title}</p>
                <p className="text-xs text-gray-500">{event.time}</p>
                <p className="text-xs text-gray-400">{format(event.date, 'MMM d')}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">No upcoming events</p>
        )}
      </div>
    </AppWidget>
  )
}

