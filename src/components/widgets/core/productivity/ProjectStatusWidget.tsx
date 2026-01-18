import React from 'react'
import { AppWidget } from '@/components/widgets/core/AppWidget'
import { Briefcase, CheckCircle2, Circle, Clock, Github } from 'lucide-react'
import { cn } from '@/services/utils'
import { useProjectStore } from '@/stores/project-store'

export function ProjectStatusWidget({ id, onRemove }: { id?: string, onRemove?: () => void }) {
  const { projects } = useProjectStore()
  
  // Show only active projects, max 4
  const activeProjects = projects
    .filter(p => p.status === 'active')
    .slice(0, 4)

  const handleNavigate = () => {
    // In a real app, this would use a router or context to switch tabs
    // For now, we'll try to find the setActiveTab function from context or props
    // But since this widget is isolated, we might need to dispatch a custom event
    window.dispatchEvent(new CustomEvent('navigate-to-tab', { detail: 'projects' }))
  }

  return (
    <AppWidget 
      title="Active Projects" 
      icon={Briefcase} 
      id={id || 'projects'} 
      onRemove={onRemove}
    >
      {activeProjects.length === 0 ? (
          <div 
            className="h-full flex flex-col items-center justify-center text-center p-4 opacity-60 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={handleNavigate}
          >
            <div className="p-3 bg-slate-500/10 rounded-full mb-3">
                <Briefcase className="h-6 w-6 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-[var(--text-main)]">No active projects</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Create a project in the Project Hub.</p>
          </div>
      ) : (
        <div className="h-full flex flex-col space-y-3 overflow-y-auto pr-1">
            {activeProjects.map(project => (
            <div 
                key={project.id} 
                onClick={handleNavigate}
                className="p-3 rounded-lg bg-[var(--bg-surface-hover)] border border-[var(--border-subtle)] hover:border-[var(--accent-primary)] transition-all group cursor-pointer"
            >
                <div className="flex justify-between items-start mb-2">
                <div>
                    <h4 className="text-xs font-bold text-[var(--text-main)] group-hover:text-[var(--accent-primary)] transition-colors flex items-center gap-1.5">
                    {project.name}
                    {project.githubRepo && <Github className="h-3 w-3 opacity-50" />}
                    </h4>
                    <p className="text-[10px] text-[var(--text-muted)] line-clamp-1">{project.description || 'No details'}</p>
                </div>
                <div className={cn(
                    "p-1 rounded-full",
                    project.status === 'active' ? "text-green-500 bg-green-500/10" :
                    project.status === 'completed' ? "text-blue-500 bg-blue-500/10" :
                    "text-yellow-500 bg-yellow-500/10"
                )}>
                    {project.status === 'active' && <Clock className="h-3 w-3" />}
                    {project.status === 'completed' && <CheckCircle2 className="h-3 w-3" />}
                    {project.status === 'hold' && <Circle className="h-3 w-3" />}
                </div>
                </div>

                <div className="space-y-1">
                <div className="flex justify-between text-[9px] text-[var(--text-muted)] uppercase font-bold">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                </div>
                <div className="h-1.5 bg-[var(--bg-surface)] rounded-full overflow-hidden">
                    <div 
                    className="h-full bg-blue-500 rounded-full transition-all duration-500"
                    style={{ width: `${project.progress}%` }}
                    />
                </div>
                </div>
            </div>
            ))}
        </div>
      )}
    </AppWidget>
  )
}
