import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { Project } from '@/types/invoice'
import { logger } from '@/lib/logger'

interface ProjectState {
  projects: Project[]
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateProject: (id: string, updates: Partial<Project>) => void
  removeProject: (id: string) => void
  importFromGithub: (repoUrl: string) => Promise<void>
  addLocalProject: (name: string, path: string) => void
}

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],

      addProject: (project) => {
        try {
          set((state) => ({
            projects: [
              ...state.projects,
              {
                ...project,
                id: Math.random().toString(36).substr(2, 9),
                createdAt: new Date(),
                updatedAt: new Date()
              }
            ]
          }))
          logger.info('Project added', { name: project.name })
        } catch (error) {
          logger.error('Failed to add project', error)
        }
      },

      updateProject: (id, updates) => {
        try {
          set((state) => ({
            projects: state.projects.map(p =>
              p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
            )
          }))
          logger.info('Project updated', { id })
        } catch (error) {
          logger.error('Failed to update project', error)
        }
      },

      removeProject: (id) => {
        try {
          set((state) => ({
            projects: state.projects.filter(p => p.id !== id)
          }))
          logger.info('Project removed', { id })
        } catch (error) {
          logger.error('Failed to remove project', error)
        }
      },

      importFromGithub: async (repoUrl) => {
        try {
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
          logger.info('Project imported from GitHub', { repoUrl })
        } catch (error) {
          logger.error('Failed to import project from GitHub', error)
          throw error // Re-throw to let UI handle it if needed
        }
      },

      addLocalProject: (name, path) => {
        try {
          set((state) => ({
            projects: [
              ...state.projects,
              {
                id: Math.random().toString(36).substr(2, 9),
                name: name,
                description: `Local project at ${path}`,
                status: 'active',
                progress: 0,
                localPath: path,
                createdAt: new Date(),
                updatedAt: new Date()
              }
            ]
          }))
          logger.info('Local project added', { name, path })
        } catch (error) {
          logger.error('Failed to add local project', error)
        }
      }
    }),
    {
      name: 'ftw-projects-storage',
    }
  )
)