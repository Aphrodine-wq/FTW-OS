import React, { useMemo } from 'react'
import { Calendar, Clock, Plus } from 'lucide-react'
import { AppWidget } from '../core/AppWidget'
import { format } from 'date-fns'
import { useCalendarStore } from '@/stores/calendar-store'

export function CalendarWidget({ id, onRemove }: { id?: string; onRemove?: () => void }) {
  const { events } = useCalendarStore()
  
  // Get upcoming events (next 7 days)
  const upcomingEvents = useMemo(() => {
    const now = new Date()
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
    
    return events
      .filter(e => {
        const eventStart = new Date(e.start)
        return eventStart >= now && eventStart <= weekFromNow
      })
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
      .slice(0, 5)
      .map(e => ({
        id: e.id,
        title: e.title,
        time: format(new Date(e.start), 'h:mm a'),
        date: new Date(e.start)
      }))
  }, [events])

  return (
    <AppWidget
      title="Upcoming Events"
      icon={Calendar}
      isConfigured={true}
      onRemove={onRemove || (() => {})}
      configContent={<div className="text-xs text-muted-foreground">Events are managed in the Calendar module</div>}
      id={id || 'calendar'}
    >
      <div className="space-y-2">
        {upcomingEvents.length > 0 ? (
          upcomingEvents.map((event) => (
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
          <div className="text-center py-6">
            <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No upcoming events</p>
            <p className="text-xs text-gray-400 mt-1">Add events in the Calendar module</p>
          </div>
        )}
      </div>
    </AppWidget>
  )
}

