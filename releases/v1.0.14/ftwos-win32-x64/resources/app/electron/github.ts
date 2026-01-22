import { ipcMain } from 'electron'

export function setupGithubHandlers() {
  ipcMain.handle('github:user', async (_, token) => {
    try {
      // Use eval to bypass TypeScript CommonJS transformation of dynamic imports
      // @ts-ignore
      const { Octokit } = await (eval('import("@octokit/rest")') as Promise<typeof import("@octokit/rest")>)
      const octokit = new Octokit({ auth: token })
      const { data } = await octokit.users.getAuthenticated()
      return data
    } catch (error: any) {
      console.error('GitHub User Error:', error)
      throw new Error(error.message || 'Failed to fetch GitHub user')
    }
  })

  ipcMain.handle('github:repos', async (_, token) => {
    try {
      // Use eval to bypass TypeScript CommonJS transformation of dynamic imports
      // @ts-ignore
      const { Octokit } = await (eval('import("@octokit/rest")') as Promise<typeof import("@octokit/rest")>)
      const octokit = new Octokit({ auth: token })
      const { data } = await octokit.repos.listForAuthenticatedUser({
        sort: 'updated',
        per_page: 50,
        visibility: 'all'
      })
      return data
    } catch (error: any) {
      console.error('GitHub Repos Error:', error)
      throw new Error(error.message || 'Failed to fetch repositories')
    }
  })

  ipcMain.handle('github:repo-stats', async (_, { token, owner, repo }) => {
    try {
      // Use eval to bypass TypeScript CommonJS transformation of dynamic imports
      // @ts-ignore
      const { Octokit } = await (eval('import("@octokit/rest")') as Promise<typeof import("@octokit/rest")>)
      const octokit = new Octokit({ auth: token })
      const { data } = await octokit.repos.listLanguages({ owner, repo })
      return data
    } catch (error: any) {
        // Don't throw for stats, just return empty
        console.warn(`Failed to fetch stats for ${owner}/${repo}:`, error.message)
        return {}
    }
  })

  ipcMain.handle('github:notifications', async (_, token) => {
    try {
      // Use eval to bypass TypeScript CommonJS transformation of dynamic imports
      // @ts-ignore
      const { Octokit } = await (eval('import("@octokit/rest")') as Promise<typeof import("@octokit/rest")>)
      const octokit = new Octokit({ auth: token })
      const { data } = await octokit.activity.listNotificationsForAuthenticatedUser({
        all: false, // only unread
        participating: true
      })
      return data
    } catch (error: any) {
      console.error('GitHub Notifications Error:', error)
      return []
    }
  })
}