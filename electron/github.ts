import { ipcMain } from 'electron'

export function setupGithubHandlers() {
  ipcMain.handle('github:user', async (_, token: string) => {
    try {
      // Dynamic import for Octokit
      const { Octokit } = await import('@octokit/rest')
      const octokit = new Octokit({ auth: token })
      const { data } = await octokit.users.getAuthenticated()
      return data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch GitHub user'
      console.error('GitHub User Error:', error)
      throw new Error(errorMessage)
    }
  })

  ipcMain.handle('github:repos', async (_, token: string) => {
    try {
      // Dynamic import for Octokit
      const { Octokit } = await import('@octokit/rest')
      const octokit = new Octokit({ auth: token })
      const { data } = await octokit.repos.listForAuthenticatedUser({
        sort: 'updated',
        per_page: 50,
        visibility: 'all'
      })
      return data
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to fetch repositories'
      console.error('GitHub Repos Error:', error)
      throw new Error(errorMessage)
    }
  })

  ipcMain.handle('github:repo-stats', async (_, { token, owner, repo }: { token: string; owner: string; repo: string }) => {
    try {
      // Dynamic import for Octokit
      const { Octokit } = await import('@octokit/rest')
      const octokit = new Octokit({ auth: token })
      const { data } = await octokit.repos.listLanguages({ owner, repo })
      return data
    } catch (error) {
        // Don't throw for stats, just return empty
        const errorMessage = error instanceof Error ? error.message : String(error)
        console.warn(`Failed to fetch stats for ${owner}/${repo}:`, errorMessage)
        return {}
    }
  })

  ipcMain.handle('github:notifications', async (_, token: string) => {
    try {
      // Dynamic import for Octokit
      const { Octokit } = await import('@octokit/rest')
      const octokit = new Octokit({ auth: token })
      const { data } = await octokit.activity.listNotificationsForAuthenticatedUser({
        all: false, // only unread
        participating: true
      })
      return data
    } catch (error) {
      console.error('GitHub Notifications Error:', error)
      return []
    }
  })
}