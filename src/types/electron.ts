/**
 * Electron IPC type definitions
 */

/**
 * IPC channel names
 */
export type IPCChannel = 
  | 'storage:get'
  | 'storage:set'
  | 'storage:remove'
  | 'storage:clear'
  | 'system:info'
  | 'system:platform'
  | 'files:read'
  | 'files:write'
  | 'files:exists'
  | 'files:list'
  | 'vault:get'
  | 'vault:set'
  | 'vault:remove'
  | 'mail:send'
  | 'mail:receive'
  | 'terminal:execute'
  | 'github:getRepos'
  | 'github:getCommits'
  | 'window:minimize'
  | 'window:maximize'
  | 'window:close'
  | 'tracker:start-session'
  | 'tracker:stop-session'
  | 'tracker:get-current'
  | 'tracker:get-sessions'
  | 'tracker:save-manual'
  | 'dialog:open-directory-legacy'

/**
 * IPC request payload
 */
export interface IPCRequest<T = unknown> {
  channel: IPCChannel
  data?: T
  id?: string
}

/**
 * IPC response payload
 */
export interface IPCResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  id?: string
}

/**
 * Storage operations
 */
export interface StorageGetRequest {
  key: string
}

export interface StorageSetRequest {
  key: string
  value: unknown
}

export interface StorageRemoveRequest {
  key: string
}

/**
 * File operations
 */
export interface FileReadRequest {
  path: string
}

export interface FileWriteRequest {
  path: string
  content: string
  encoding?: 'utf8' | 'base64'
}

export interface FileExistsRequest {
  path: string
}

export interface FileListRequest {
  path: string
  recursive?: boolean
}

/**
 * Vault operations
 */
export interface VaultGetRequest {
  key: string
}

export interface VaultSetRequest {
  key: string
  value: string
  encrypted?: boolean
}

export interface VaultRemoveRequest {
  key: string
}

/**
 * System info
 */
export interface SystemInfo {
  platform: NodeJS.Platform
  arch: string
  version: string
  hostname: string
  uptime: number
}

/**
 * Window control operations
 */
export interface WindowControlRequest {
  action: 'minimize' | 'maximize' | 'close' | 'restore'
}

/**
 * Terminal execute request
 */
export interface TerminalExecuteRequest {
  command: string
  cwd?: string
  env?: Record<string, string>
}

/**
 * Terminal execute response
 */
export interface TerminalExecuteResponse {
  stdout: string
  stderr: string
  exitCode: number
}

/**
 * GitHub operations
 */
export interface GitHubGetReposRequest {
  owner: string
  type?: 'all' | 'owner' | 'member'
  sort?: 'created' | 'updated' | 'pushed' | 'full_name'
  direction?: 'asc' | 'desc'
}

export interface GitHubRepo {
  id: number
  name: string
  full_name: string
  description: string | null
  private: boolean
  html_url: string
  created_at: string
  updated_at: string
  pushed_at: string
  stargazers_count: number
  watchers_count: number
  language: string | null
}

export interface GitHubGetCommitsRequest {
  owner: string
  repo: string
  sha?: string
  path?: string
  since?: string
  until?: string
  per_page?: number
  page?: number
}

export interface GitHubCommit {
  sha: string
  commit: {
    message: string
    author: {
      name: string
      email: string
      date: string
    }
  }
  author: {
    login: string
    avatar_url: string
  }
  html_url: string
}

/**
 * Tracker operations
 */
export interface TrackerStartSessionRequest {
  projectId: string
  path: string
}

export interface TrackerSession {
  id: string
  projectId: string
  path: string
  startTime: number
  endTime?: number
  duration?: number
}

/**
 * Mail operations
 */
export interface MailSendRequest {
  to: string | string[]
  subject: string
  body: string
  html?: boolean
  attachments?: Array<{
    filename: string
    path: string
  }>
}

export interface MailReceiveRequest {
  limit?: number
  since?: string
}

export interface MailMessage {
  id: string
  from: string
  to: string
  subject: string
  body: string
  date: string
  attachments?: Array<{
    filename: string
    size: number
  }>
}



