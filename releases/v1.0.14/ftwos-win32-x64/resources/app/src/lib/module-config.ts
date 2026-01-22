/**
 * Module configuration and metadata
 * Centralized configuration for all application modules
 */

export interface ModuleConfig {
  id: string
  name: string
  category?: string
}

/**
 * Module name mapping for display purposes
 */
export const MODULE_NAMES: Record<string, string> = {
  dashboard: 'Dashboard',
  pulse: 'Pulse Dashboard',
  analytics: 'Analytics Dashboard',
  workflows: 'Workflow Editor',
  webhooks: 'Webhook Server',
  servers: 'Server Manager',
  docker: 'Docker Pilot',
  uptime: 'Uptime Monitor',
  brain: 'Knowledge Base',
  courses: 'Course Tracker',
  snippets: 'Snippet Library',
  finance: 'Document Builder',
  expenses: 'Expense Manager',
  history: 'Invoice History',
  products: 'Product Manager',
  taxes: 'Tax Vault',
  crm: 'Client Manager',
  pipeline: 'Leads Pipeline',
  mail: 'Email Client',
  projects: 'Project Hub',
  tasks: 'Task Manager',
  tracker: 'Time Tracker',
  calendar: 'Calendar',
  documents: 'Document Hub',
  contracts: 'Contract Wizard',
  assets: 'Asset Inventory',
  payroll: 'Payroll System',
  marketing: 'Marketing Dashboard',
  seo: 'SEO Toolkit',
  ads: 'Ad Manager',
  newsletter: 'Newsletter Studio',
  dev: 'DevHQ',
  trae: 'TraeCoder',
  research: 'Research Agent',
  voice: 'Voice Command',
  settings: 'Settings Panel',
  vault: 'Password Manager',
  update: 'System Update'
}

/**
 * Get module display name by ID
 */
export const getModuleName = (moduleId: string): string => {
  return MODULE_NAMES[moduleId] || 'Dashboard'
}

