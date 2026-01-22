import { describe, it, expect, vi, beforeEach } from 'vitest'
import { useProjectStore } from './project-store'

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
  }
}))

describe('ProjectStore', () => {
  beforeEach(() => {
    useProjectStore.setState({ projects: [] })
    vi.clearAllMocks()
  })

  it('should add a project', () => {
    const project = {
      name: 'Test Project',
      description: 'Test Description',
      status: 'active' as const,
      progress: 0
    }

    useProjectStore.getState().addProject(project)

    const projects = useProjectStore.getState().projects
    expect(projects).toHaveLength(1)
    expect(projects[0]).toMatchObject(project)
    expect(projects[0].id).toBeDefined()
  })

  it('should update a project', () => {
    const project = {
      name: 'Test Project',
      status: 'active' as const,
      progress: 0
    }
    useProjectStore.getState().addProject(project)
    const id = useProjectStore.getState().projects[0].id

    useProjectStore.getState().updateProject(id, { name: 'Updated Project' })

    const projects = useProjectStore.getState().projects
    expect(projects[0].name).toBe('Updated Project')
  })

  it('should remove a project', () => {
    const project = {
      name: 'Test Project',
      status: 'active' as const,
      progress: 0
    }
    useProjectStore.getState().addProject(project)
    const id = useProjectStore.getState().projects[0].id

    useProjectStore.getState().removeProject(id)

    const projects = useProjectStore.getState().projects
    expect(projects).toHaveLength(0)
  })

  it('should import from github', async () => {
    const repoUrl = 'https://github.com/owner/repo'
    await useProjectStore.getState().importFromGithub(repoUrl)

    const projects = useProjectStore.getState().projects
    expect(projects).toHaveLength(1)
    expect(projects[0].name).toBe('repo')
    expect(projects[0].githubRepo).toBe(repoUrl)
  })

  it('should throw error for invalid github url', async () => {
    const repoUrl = 'https://invalid-url.com'
    await expect(useProjectStore.getState().importFromGithub(repoUrl)).rejects.toThrow('Invalid GitHub URL')
  })
})
