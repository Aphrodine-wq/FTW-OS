import React, { useState } from 'react'
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/services/utils'

// Setup the localizer for react-big-calendar
const localizer = momentLocalizer(moment)

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  allDay?: boolean
  resource?: string
}

// Mock Events
const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team Standup',
    start: new Date(new Date().setHours(10, 0, 0, 0)),
    end: new Date(new Date().setHours(10, 30, 0, 0)),
  },
  {
    id: '2',
    title: 'Client Meeting - Acme',
    start: new Date(new Date().setHours(14, 0, 0, 0)),
    end: new Date(new Date().setHours(15, 0, 0, 0)),
  },
  {
    id: '3',
    title: 'Project Deadline',
    start: new Date(new Date().setHours(17, 0, 0, 0)),
    end: new Date(new Date().setHours(18, 0, 0, 0)),
    allDay: true
  }
]

export function Calendar() {
  const [events, setEvents] = useState<CalendarEvent[]>(MOCK_EVENTS)
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')
  const [date, setDate] = useState(new Date())

  const handleNavigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
    const newDate = new Date(date)
    if (action === 'TODAY') {
        setDate(new Date())
        return
    }

    const direction = action === 'NEXT' ? 1 : -1
    
    if (view === 'month') newDate.setMonth(newDate.getMonth() + direction)
    if (view === 'week') newDate.setDate(newDate.getDate() + (direction * 7))
    if (view === 'day') newDate.setDate(newDate.getDate() + direction)
    
    setDate(newDate)
  }

  return (
    <div className="h-full flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white">
        <div className="flex items-center gap-4">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <CalendarIcon className="h-6 w-6 text-blue-600" />
                {moment(date).format('MMMM YYYY')}
            </h2>
            <div className="flex items-center bg-slate-100 rounded-lg p-1">
                <Button variant="ghost" size="icon" onClick={() => handleNavigate('PREV')}>
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleNavigate('TODAY')} className="text-xs font-bold">
                    Today
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleNavigate('NEXT')}>
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>

        <div className="flex items-center gap-4">
            <div className="flex bg-slate-100 rounded-lg p-1">
                {['month', 'week', 'day'].map((v) => (
                    <button
                        key={v}
                        onClick={() => setView(v as any)}
                        className={cn(
                            "px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-all",
                            view === v ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        {v}
                    </button>
                ))}
            </div>
            <Button className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4" /> New Event
            </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 p-4">
        <BigCalendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: '100%' }}
            view={view}
            date={date}
            onView={(v) => setView(v as any)}
            onNavigate={(d) => setDate(d)}
            toolbar={false} // Custom toolbar above
            eventPropGetter={(event) => ({
                style: {
                    backgroundColor: '#EFF6FF',
                    color: '#2563EB',
                    border: '1px solid #BFDBFE',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 500
                }
            })}
        />
      </div>
    </div>
  )
}
