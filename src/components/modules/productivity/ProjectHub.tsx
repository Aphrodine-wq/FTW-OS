import React, { useState } from 'react'
import { useProjectStore } from '@/stores/project-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Plus, Github, Search, Filter,
    MoreHorizontal, Folder, ExternalLink,
    Clock, CheckCircle2, Circle
} from 'lucide-react'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog'
import { cn } from '@/services/utils'

export function ProjectHub() {
    const { projects, addProject, importFromGithub, removeProject, addLocalProject } = useProjectStore()
    const [search, setSearch] = useState('')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [newProject, setNewProject] = useState({ name: '', repo: '', localPath: '' })

    const filteredProjects = projects.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase())
    )

    const handleAddProject = async () => {
        if (newProject.repo) {
            try {
                await importFromGithub(newProject.repo)
            } catch (e) {
                alert('Invalid GitHub URL')
                return
            }
        } else if (newProject.localPath) {
            addLocalProject(newProject.name, newProject.localPath)
        } else {
            addProject({
                name: newProject.name,
                status: 'active',
                progress: 0
            })
        }
        setNewProject({ name: '', repo: '', localPath: '' })
        setIsDialogOpen(false)
    }

    return (
        <div className="h-full flex flex-col gap-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
                    <p className="text-muted-foreground">Manage development and client work</p>
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4" /> New Project
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Create New Project</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Project Name</label>
                                <Input
                                    value={newProject.name}
                                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                                    placeholder="e.g. Website Redesign"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Folder className="h-4 w-4" /> Local Path (Optional)
                                </label>
                                <Input
                                    value={newProject.localPath}
                                    onChange={(e) => setNewProject({ ...newProject, localPath: e.target.value })}
                                    placeholder="C:\Projects\MyProject"
                                />
                            </div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">Or Import</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium flex items-center gap-2">
                                    <Github className="h-4 w-4" /> GitHub Repository
                                </label>
                                <Input
                                    value={newProject.repo}
                                    onChange={(e) => setNewProject({ ...newProject, repo: e.target.value })}
                                    placeholder="https://github.com/owner/repo"
                                />
                                <p className="text-xs text-muted-foreground">We'll auto-fill details from the repository.</p>
                            </div>

                            <Button className="w-full" onClick={handleAddProject}>
                                Create Project
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Toolbar */}
            <div className="flex gap-4">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search projects..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Button variant="outline" className="gap-2">
                    <Filter className="h-4 w-4" /> Filter
                </Button>
            </div>

            {/* Grid */}
            {filteredProjects.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center border-2 border-dashed rounded-xl p-12 bg-muted/10">
                    <div className="p-4 bg-muted/20 rounded-full mb-4">
                        <Folder className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">No projects found</h3>
                    <p className="text-muted-foreground mb-4 max-w-sm">
                        Get started by creating a new project or importing one from GitHub.
                    </p>
                    <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                        Create First Project
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map(project => (
                        <Card key={project.id} className="group hover:border-blue-500/50 transition-all">
                            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                                <div className="space-y-1">
                                    <CardTitle className="text-base font-semibold flex items-center gap-2">
                                        {project.name}
                                        {project.githubRepo && <Github className="h-3 w-3 text-muted-foreground" />}
                                    </CardTitle>
                                    <p className="text-xs text-muted-foreground line-clamp-1">{project.description || 'No description'}</p>
                                </div>
                                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2" onClick={() => removeProject(project.id)}>
                                    <MoreHorizontal className="h-4 w-4" />
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className={cn(
                                            "px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1",
                                            project.status === 'active' ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-700"
                                        )}>
                                            {project.status === 'active' ? <Clock className="h-3 w-3" /> : <CheckCircle2 className="h-3 w-3" />}
                                            {project.status.toUpperCase()}
                                        </span>
                                        <span className="text-muted-foreground">{project.progress}%</span>
                                    </div>

                                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-600 transition-all"
                                            style={{ width: `${project.progress}%` }}
                                        />
                                    </div>

                                    {project.githubRepo && (
                                        <Button variant="outline" size="sm" className="w-full gap-2 mt-2" onClick={() => window.open(project.githubRepo, '_blank')}>
                                            <ExternalLink className="h-3 w-3" /> Open Repository
                                        </Button>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}