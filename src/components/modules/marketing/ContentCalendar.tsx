import React, { useState } from 'react'
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { Button } from '@/components/ui/button'
import { 
  Twitter, Linkedin, Instagram, FileText, 
  Plus, ChevronLeft, ChevronRight, Calendar as CalendarIcon,
  CheckCircle2, Clock, PenTool
} from 'lucide-react'
import { cn } from '@/services/utils'

// Setup the localizer
const localizer = momentLocalizer(moment)

interface ContentEvent {
  id: string
  title: string
  start: Date
  end: Date
  platform: 'twitter' | 'linkedin' | 'instagram' | 'blog'
  status: 'draft' | 'scheduled' | 'published'
}

const MOCK_EVENTS: ContentEvent[] = [
  {
    id: '1',
    title: 'Announce v2.0 Launch',
    start: new Date(new Date().setHours(10, 0, 0, 0)),
    end: new Date(new Date().setHours(11, 0, 0, 0)),
    platform: 'twitter',
    status: 'scheduled'
  },
  {
    id: '2',
    title: 'How we built the OS',
    start: new Date(new Date().setHours(14, 0, 0, 0)),
    end: new Date(new Date().setHours(16, 0, 0, 0)),
    platform: 'blog',
    status: 'draft'
  },
  {
    id: '3',
    title: 'Feature Showcase: Vault',
    start: new Date(new Date().setDate(new Date().getDate() + 1)),
    end: new Date(new Date().setDate(new Date().getDate() + 1)),
    platform: 'linkedin',
    status: 'published'
  }
]

export function ContentCalendar() {
  const [events, setEvents] = useState<ContentEvent[]>(MOCK_EVENTS)
  const [view, setView] = useState<'month' | 'week' | 'day'>('month')
  const [date, setDate] = useState(new Date())

  const getPlatformIcon = (platform: string) => {
    switch(platform) {
        case 'twitter': return <Twitter className="h-3 w-3" />
        case 'linkedin': return <Linkedin className="h-3 w-3" />
        case 'instagram': return <Instagram className="h-3 w-3" />
        default: return <FileText className="h-3 w-3" />
    }
  }

  const getStatusColor = (status: string) => {
    switch(status) {
        case 'published': return 'bg-green-100 text-green-700 border-green-200'
        case 'scheduled': return 'bg-blue-100 text-blue-700 border-blue-200'
        default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

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
                <CalendarIcon className="h-6 w-6 text-purple-600" />
                Content Schedule
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
            <span className="text-lg font-medium text-slate-600">
                {moment(date).format('MMMM YYYY')}
            </span>
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
            <Button className="gap-2 bg-purple-600 hover:bg-purple-700 text-white">
                <Plus className="h-4 w-4" /> New Post
            </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 p-4 bg-slate-50/50">
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
            toolbar={false}
            components={{
                event: ({ event }: { event: ContentEvent }) => (
                    <div className={cn("flex items-center gap-1.5 px-2 py-1 h-full w-full rounded text-xs font-medium border", getStatusColor(event.status))}>
                        {getPlatformIcon(event.platform)}
                        <span className="truncate">{event.title}</span>
                    </div>
                )
            }}
        />
      </div>

      {/* Legend */}
      <div className="p-3 border-t border-slate-200 bg-white flex gap-6 text-xs text-slate-500">
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-gray-400" /> Draft
        </div>
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" /> Scheduled
        </div>
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" /> Published
        </div>
      </div>
    </div>
  )
}
