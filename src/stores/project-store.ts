import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Project } from '@/types/invoice'

interface ProjectState {
  projects: Project[]
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  removeProject: (id: string) => void
  importFromGithub: (repoUrl: string) => Promise<void>
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      
      addProject: (project) => set((state) => ({
        projects: [
          ...state.projects,
          {
            ...project,
            id: Math.random().toString(36).substr(2, 9),
            createdAt: new Date(),
            updatedAt: new Date()
          }
        ]
      })),

      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map(p => 
          p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
        )
      })),

      removeProject: (id) => set((state) => ({
        projects: state.projects.filter(p => p.id !== id)
      })),

      importFromGithub: async (repoUrl) => {
        // Parse owner/repo from URL
        // e.g. https://github.com/owner/repo
        const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/)
        if (!match) throw new Error('Invalid GitHub URL')
        
        const [_, owner, repo] = match
        
        // Use existing IPC we built
        // We'll just add the project shell for now, and let DevHQ handle the stats later
        set((state) => ({
            projects: [
                ...state.projects,
                {
                    id: Math.random().toString(36).substr(2, 9),
                    name: repo,
                    description: `Imported from ${owner}/${repo}`,
                    status: 'active',
                    githubRepo: repoUrl,
                    progress: 0,
                    createdAt: new Date(),
                    updatedAt: new Date()
                }
            ]
        }))
      }
    }),
    {
      name: 'ftw-projects-storage',
    }
  )
)