import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Calendar as CalendarIcon, CheckSquare } from 'lucide-react'

interface MondayBriefingProps {
  isOpen: boolean
  onClose: () => void
  onSave: (tasks: string[]) => void
}

export function MondayBriefingModal({ isOpen, onClose, onSave }: MondayBriefingProps) {
  const [tasks, setTasks] = useState<string[]>(['', '', ''])
  
  const handleTaskChange = (index: number, value: string) => {
    const newTasks = [...tasks]
    newTasks[index] = value
    setTasks(newTasks)
  }

  const handleSave = () => {
    const validTasks = tasks.filter(t => t.trim().length > 0)
    onSave(validTasks)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-blue-500" />
            Monday Morning Briefing
          </DialogTitle>
          <DialogDescription>
            Let's set your intentions for the week. What are your top 3 priorities?
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
            {tasks.map((task, idx) => (
                <div key={idx} className="flex items-center gap-2">
                    <div className="bg-slate-100 dark:bg-slate-800 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold opacity-50">
                        {idx + 1}
                    </div>
                    <Input 
                        placeholder={`Priority #${idx + 1}`}
                        value={task}
                        onChange={(e) => handleTaskChange(idx, e.target.value)}
                        autoFocus={idx === 0}
                    />
                </div>
            ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Skip</Button>
          <Button onClick={handleSave} className="gap-2">
            <CheckSquare className="h-4 w-4" />
            Set Priorities
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}