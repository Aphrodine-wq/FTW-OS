import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProjectStore } from '@/stores/project-store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Plus, Github, Search, Filter, MoreHorizontal, Folder, ExternalLink,
    Clock, CheckCircle2, Circle, X, Trash2, FolderOpen, Link as LinkIcon
} from 'lucide-react'
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog'
import { cn } from '@/services/utils'

export function ProjectHub() {
    const { projects, addProject, importFromGithub, removeProject, addLocalProject } = useProjectStore()
    const [search, setSearch] = useState('')
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedProject, setSelectedProject] = useState<typeof projects[0] | null>(null)
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

    const handleDelete = (e: React.MouseEvent, projectId: string, projectName: string) => {
        e.stopPropagation()
        if (confirm(`Delete "${projectName}"?`)) {
            removeProject(projectId)
            if (selectedProject?.id === projectId) {
                setSelectedProject(null)
            }
        }
    }

    const openFolder = async (path: string) => {
        try {
            if (window.ipcRenderer) {
                const result = await window.ipcRenderer.invoke('system:open-path', path)
                if (!result.success) {
                    alert(`Failed to open folder: ${result.error || 'Unknown error'}`)
                }
            }
        } catch (error: any) {
            alert(`Error: ${error.message}`)
        }
    }

    const openRepo = async (url: string) => {
        try {
            if (window.ipcRenderer) {
                await window.ipcRenderer.invoke('system:open-url', url)
            } else {
                window.open(url, '_blank')
            }
        } catch (error) {
            console.error('Failed to open repo:', error)
        }
    }

    return (
        <div className="h-full flex flex-col gap-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold">Project Hub</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage all your projects in one place</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-blue-600 hover:bg-blue-700">
                            <Plus className="h-4 w-4" /> New Project
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add New Project</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 pt-4">
                            <div>
                                <label className="text-sm font-medium">Project Name</label>
                                <Input
                                    value={newProject.name}
                                    onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                                    placeholder="My Awesome Project"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">GitHub Repo (Optional)</label>
                                <Input
                                    value={newProject.repo}
                                    onChange={(e) => setNewProject({ ...newProject, repo: e.target.value })}
                                    placeholder="https://github.com/user/repo"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium">Local Path (Optional)</label>
                                <Input
                                    value={newProject.localPath}
                                    onChange={(e) => setNewProject({ ...newProject, localPath: e.target.value })}
                                    placeholder="C:/Projects/my-project"
                                />
                            </div>
                            <div className="flex gap-2 pt-2">
                                <Button onClick={handleAddProject} className="flex-1">
                                    Add Project
                                </Button>
                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search & Filter */}
            <div className="flex gap-4">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search projects..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9"
                    />
                </div>
            </div>

            {/* Projects Grid */}
            {filteredProjects.length === 0 ? (
                <Card className="border-dashed flex-1 flex items-center justify-center">
                    <CardContent className="py-16 text-center">
                        <Folder className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-20" />
                        <h3 className="text-lg font-semibold mb-2">No Projects Yet</h3>
                        <p className="text-muted-foreground mb-4 max-w-sm">
                            Get started by creating a new project or importing one from GitHub.
                        </p>
                        <Button variant="outline" onClick={() => setIsDialogOpen(true)}>
                            Create First Project
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredProjects.map(project => (
                        <motion.div
                            key={project.id}
                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                            className="relative group cursor-pointer"
                            onClick={() => setSelectedProject(project)}
                        >
                            <Card className="h-full border-blue-500/10 group-hover:border-blue-500/50 transition-all bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm overflow-hidden">
                                <CardHeader className="pb-3">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                {project.name}
                                                {project.githubRepo && <Github className="h-3 w-3 text-muted-foreground" />}
                                            </CardTitle>
                                            <p className="text-xs text-muted-foreground line-clamp-1">{project.description || 'No description'}</p>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 -mr-2 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30"
                                            onClick={(e) => handleDelete(e, project.id, project.name)}
                                            title="Delete Project"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {/* Status */}
                                        <div className="flex items-center gap-2 text-sm">
                                            {project.status === 'active' ? (
                                                <>
                                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                                    <span className="text-green-600 font-medium">Active</span>
                                                </>
                                            ) : project.status === 'pending' ? (
                                                <>
                                                    <Clock className="h-4 w-4 text-yellow-500" />
                                                    <span className="text-yellow-600 font-medium">Pending</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Circle className="h-4 w-4 text-gray-400" />
                                                    <span className="text-gray-600 font-medium">Inactive</span>
                                                </>
                                            )}
                                        </div>

                                        {/* Progress Bar */}
                                        {project.progress !== undefined && (
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-muted-foreground">Progress</span>
                                                    <span className="font-medium">{project.progress}%</span>
                                                </div>
                                                <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-blue-600 transition-all"
                                                        style={{ width: `${project.progress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        {/* Quick Actions */}
                                        <div className="flex gap-2 pt-2 border-t opacity-0 group-hover:opacity-100 transition-opacity">
                                            {project.localPath && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex-1"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        openFolder(project.localPath!)
                                                    }}
                                                >
                                                    <FolderOpen className="h-3 w-3 mr-1" />
                                                    Folder
                                                </Button>
                                            )}
                                            {project.githubRepo && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="flex-1"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        openRepo(project.githubRepo!)
                                                    }}
                                                >
                                                    <ExternalLink className="h-3 w-3 mr-1" />
                                                    Repo
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Project Detail Modal */}
            <Dialog open={!!selectedProject} onOpenChange={() => setSelectedProject(null)}>
                <DialogContent className="max-w-2xl">
                    {selectedProject && (
                        <>
                            <DialogHeader>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <DialogTitle className="text-2xl">{selectedProject.name}</DialogTitle>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {selectedProject.description || 'No description provided'}
                                        </p>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setSelectedProject(null)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            </DialogHeader>
                            <div className="space-y-6 pt-4">
                                {/* Project Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <Card>
                                        <CardContent className="p-4">
                                            <p className="text-sm text-muted-foreground mb-1">Status</p>
                                            <div className="flex items-center gap-2">
                                                {selectedProject.status === 'active' ? (
                                                    <><CheckCircle2 className="h-4 w-4 text-green-500" /><span className="font-semibold">Active</span></>
                                                ) : (
                                                    <><Clock className="h-4 w-4 text-yellow-500" /><span className="font-semibold">Pending</span></>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                    <Card>
                                        <CardContent className="p-4">
                                            <p className="text-sm text-muted-foreground mb-1">Progress</p>
                                            <p className="text-2xl font-bold">{selectedProject.progress || 0}%</p>
                                        </CardContent>
                                    </Card>
                                </div>

                                {/* Links */}
                                {(selectedProject.localPath || selectedProject.githubRepo) && (
                                    <div className="space-y-2">
                                        <h3 className="font-semibold">Quick Access</h3>
                                        <div className="flex gap-2">
                                            {selectedProject.localPath && (
                                                <Button
                                                    variant="outline"
                                                    className="flex-1"
                                                    onClick={() => openFolder(selectedProject.localPath!)}
                                                >
                                                    <FolderOpen className="h-4 w-4 mr-2" />
                                                    Open Folder
                                                </Button>
                                            )}
                                            {selectedProject.githubRepo && (
                                                <Button
                                                    variant="outline"
                                                    className="flex-1"
                                                    onClick={() => openRepo(selectedProject.githubRepo!)}
                                                >
                                                    <Github className="h-4 w-4 mr-2" />
                                                    View on GitHub
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-2 pt-4 border-t">
                                    <Button
                                        variant="destructive"
                                        className="gap-2"
                                        onClick={(e) => handleDelete(e as any, selectedProject.id, selectedProject.name)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Delete Project
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setSelectedProject(null)}
                                    >
                                        Close
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}