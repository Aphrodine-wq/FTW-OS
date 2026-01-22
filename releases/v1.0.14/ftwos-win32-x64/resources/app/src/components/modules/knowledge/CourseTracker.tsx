import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  GraduationCap, PlayCircle, CheckCircle2, 
  Clock, Plus
} from 'lucide-react'
import { cn } from '@/services/utils'

const COURSES = [
  { id: '1', title: 'Advanced React Patterns', platform: 'Frontend Masters', progress: 75, total: 24, completed: 18, status: 'In Progress' },
  { id: '2', title: 'Rust for Beginners', platform: 'Udemy', progress: 12, total: 50, completed: 6, status: 'In Progress' },
  { id: '3', title: 'System Design Interview', platform: 'Educative', progress: 100, total: 15, completed: 15, status: 'Completed' },
]

export function CourseTracker() {
  return (
    <div className="h-full flex flex-col gap-6 p-2 overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Course Tracker</h2>
          <p className="text-muted-foreground">Monitor your learning progress</p>
        </div>
        <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white">
            <Plus className="h-4 w-4" /> Add Course
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {COURSES.map(course => (
            <Card key={course.id} className="group">
                <CardContent className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                            <GraduationCap className="h-6 w-6" />
                        </div>
                        <span className={cn(
                            "text-xs font-bold px-2 py-1 rounded-full",
                            course.status === 'Completed' ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        )}>
                            {course.status}
                        </span>
                    </div>

                    <div>
                        <h3 className="font-bold text-lg leading-tight">{course.title}</h3>
                        <p className="text-sm text-slate-500 mt-1">{course.platform}</p>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium">
                            <span>{course.progress}% Complete</span>
                            <span>{course.completed}/{course.total} Lessons</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                            <div 
                                className="h-full bg-indigo-500 transition-all duration-500" 
                                style={{ width: `${course.progress}%` }}
                            />
                        </div>
                    </div>

                    <Button variant="outline" className="w-full gap-2">
                        {course.status === 'Completed' ? <CheckCircle2 className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
                        {course.status === 'Completed' ? 'View Certificate' : 'Continue Learning'}
                    </Button>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  )
}
