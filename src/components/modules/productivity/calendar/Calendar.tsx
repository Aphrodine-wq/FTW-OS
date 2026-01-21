import React, { useState } from 'react'
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import { Plus, ChevronLeft, ChevronRight, X, Clock, MapPin, AlignLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCalendarStore } from '@/stores/calendar-store'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { cn } from '@/services/utils'

const localizer = momentLocalizer(moment)

export function Calendar() {
  const { events, addEvent, removeEvent } = useCalendarStore()
  const [view, setView] = useState('month')
  const [date, setDate] = useState(new Date())
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false)
  const [newEvent, setNewEvent] = useState({ title: '', start: '', end: '', description: '' })
  const [selectedEvent, setSelectedEvent] = useState<any>(null)

  const handleNavigate = (action: 'PREV' | 'NEXT' | 'TODAY') => {
    const newDate = new Date(date)
    if (action === 'TODAY') {
      setDate(new Date())
      return
    }
    const amount = action === 'NEXT' ? 1 : -1
    if (view === 'month') newDate.setMonth(newDate.getMonth() + amount)
    else if (view === 'week') newDate.setDate(newDate.getDate() + amount * 7)
    else newDate.setDate(newDate.getDate() + amount)
    setDate(newDate)
  }

  const handleSaveEvent = () => {
    if (!newEvent.title || !newEvent.start || !newEvent.end) return

    addEvent({
      title: newEvent.title,
      start: new Date(newEvent.start),
      end: new Date(newEvent.end),
      description: newEvent.description,
      allDay: false
    })

    setIsEventDialogOpen(false)
    setNewEvent({ title: '', start: '', end: '', description: '' })
  }

  const handleDeleteEvent = () => {
    if (selectedEvent) {
      removeEvent(selectedEvent.id)
      setSelectedEvent(null)
    }
  }

  // Custom Toolbar
  const CustomToolbar = (toolbar: any) => {
    return (
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button onClick={() => handleNavigate('PREV')} className="p-1 hover:bg-white rounded transition-colors"><ChevronLeft className="h-4 w-4" /></button>
            <button onClick={() => handleNavigate('TODAY')} className="px-3 text-sm font-medium hover:bg-white rounded transition-colors">Today</button>
            <button onClick={() => handleNavigate('NEXT')} className="p-1 hover:bg-white rounded transition-colors"><ChevronRight className="h-4 w-4" /></button>
          </div>
          <h2 className="text-xl font-bold text-slate-800">
            {moment(date).format('MMMM YYYY')}
          </h2>
        </div>

        <div className="flex gap-4">
          <div className="flex bg-slate-100 p-1 rounded-lg">
            {['month', 'week', 'day'].map((v) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  "px-3 py-1 text-sm font-medium capitalize rounded transition-all",
                  view === v ? "bg-white shadow text-slate-900" : "text-slate-500 hover:text-slate-700"
                )}
              >
                {v}
              </button>
            ))}
          </div>
          <Button className="gap-2 bg-slate-900 text-white hover:bg-slate-800" onClick={() => setIsEventDialogOpen(true)}>
            <Plus className="h-4 w-4" /> New Event
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-hidden flex flex-col">
      <div className="flex-1 min-h-0">
        <BigCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          view={view as any}
          onView={(v) => setView(v)}
          date={date}
          onNavigate={(d) => setDate(d)}
          components={{ toolbar: CustomToolbar }}
          onSelectEvent={(event) => setSelectedEvent(event)}
          eventPropGetter={(event) => ({
            className: "bg-blue-100 text-blue-700 border-l-4 border-blue-500 text-xs font-semibold rounded-sm px-1.5 py-0.5"
          })}
        />
      </div>

      {/* New Event Dialog */}
      <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Event Title</Label>
              <Input id="title" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} placeholder="Meeting with team" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="start">Start Time</Label>
                <Input id="start" type="datetime-local" value={newEvent.start} onChange={e => setNewEvent({ ...newEvent, start: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end">End Time</Label>
                <Input id="end" type="datetime-local" value={newEvent.end} onChange={e => setNewEvent({ ...newEvent, end: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="desc">Description</Label>
              <Input id="desc" value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} placeholder="Details..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEventDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEvent}>Save Event</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Event Details Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={() => setSelectedEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4 text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>
                {selectedEvent && moment(selectedEvent.start).format('LLL')} - {selectedEvent && moment(selectedEvent.end).format('LT')}
              </span>
            </div>
            {selectedEvent?.description && (
              <div className="flex items-start gap-2">
                <AlignLeft className="h-4 w-4 mt-1" />
                <p>{selectedEvent.description}</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="destructive" onClick={handleDeleteEvent}>Delete Event</Button>
            <Button variant="outline" onClick={() => setSelectedEvent(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}
