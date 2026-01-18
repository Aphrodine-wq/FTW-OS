/**
 * Lazy-loaded component imports
 * Centralized lazy loading for all application modules and components
 */

import React from 'react'

// Lazy Load Core Layout Components
export const PhotonNav = React.lazy(() => import('@/components/layout/PhotonNav').then(m => ({ default: m.PhotonNav })))
export const LoginScreen = React.lazy(() => import('@/components/modules/auth/LoginScreen').then(m => ({ default: m.LoginScreen })))
export const CommandPalette = React.lazy(() => import('@/components/layout/CommandPalette').then(m => ({ default: m.CommandPalette })))
export const TitleBar = React.lazy(() => import('@/components/ui/title-bar').then(m => ({ default: m.TitleBar })))

// Lazy Load Dashboard Modules
export const PulseDashboard = React.lazy(() => import('@/components/modules/dashboard/PulseDashboard').then(m => ({ default: m.PulseDashboard })))
export const Dashboard = React.lazy(() => import('@/components/modules/core/dashboard/Dashboard').then(m => ({ default: m.Dashboard })))
export const AnalyticsDashboard = React.lazy(() => import('@/components/modules/core/dashboard/AnalyticsDashboard').then(m => ({ default: m.AnalyticsDashboard })))

// Lazy Load Automation Modules
export const WorkflowEditor = React.lazy(() => import('@/components/modules/automation/WorkflowEditor').then(m => ({ default: m.WorkflowEditor })))
export const WebhookServer = React.lazy(() => import('@/components/modules/automation/WebhookServer').then(m => ({ default: m.WebhookServer })))

// Lazy Load Infrastructure Modules
export const ServerManager = React.lazy(() => import('@/components/modules/infra/ServerManager').then(m => ({ default: m.ServerManager })))
export const DockerPilot = React.lazy(() => import('@/components/modules/infra/DockerPilot').then(m => ({ default: m.DockerPilot })))
export const UptimeMonitor = React.lazy(() => import('@/components/modules/infra/UptimeMonitor').then(m => ({ default: m.UptimeMonitor })))

// Lazy Load Knowledge Modules
export const Brain = React.lazy(() => import('@/components/modules/knowledge/Brain').then(m => ({ default: m.Brain })))
export const CourseTracker = React.lazy(() => import('@/components/modules/knowledge/CourseTracker').then(m => ({ default: m.CourseTracker })))
export const SnippetLibrary = React.lazy(() => import('@/components/modules/knowledge/SnippetLibrary').then(m => ({ default: m.SnippetLibrary })))

// Lazy Load Finance Modules
export const DocumentBuilder = React.lazy(() => import('@/components/modules/finance/DocumentBuilder').then(m => ({ default: m.DocumentBuilder })))
export const ExpenseManager = React.lazy(() => import('@/components/modules/finance/expenses/ExpenseManagerEnhanced').then(m => ({ default: m.ExpenseManagerEnhanced })))
export const InvoiceHistory = React.lazy(() => import('@/components/modules/finance/invoices/history/InvoiceHistory').then(m => ({ default: m.InvoiceHistory })))
export const ProductManager = React.lazy(() => import('@/components/modules/finance/products/ProductManager').then(m => ({ default: m.ProductManager })))
export const TaxVault = React.lazy(() => import('@/components/modules/finance/TaxVault').then(m => ({ default: m.TaxVault })))

// Lazy Load CRM Modules
export const ClientManager = React.lazy(() => import('@/components/modules/crm/clients/ClientManager').then(m => ({ default: m.ClientManager })))
export const LeadsPipeline = React.lazy(() => import('@/components/modules/crm/pipeline/LeadsPipeline').then(m => ({ default: m.LeadsPipeline })))

// Lazy Load Communication Modules
export const EmailClient = React.lazy(() => import('@/components/modules/communication/EmailClient').then(m => ({ default: m.EmailClient })))

// Lazy Load Productivity Modules
export const ProjectHub = React.lazy(() => import('@/components/modules/productivity/ProjectHub').then(m => ({ default: m.ProjectHub })))
export const TaskList = React.lazy(() => import('@/components/modules/productivity/tasks/TaskListEnhanced').then(m => ({ default: m.TaskListEnhanced })))
export const TimeTracker = React.lazy(() => import('@/components/modules/productivity/tracker/TimeTracker').then(m => ({ default: m.TimeTracker })))
export const Calendar = React.lazy(() => import('@/components/modules/productivity/calendar/Calendar').then(m => ({ default: m.Calendar })))
export const DocumentHub = React.lazy(() => import('@/components/modules/productivity/documents/DocumentHub').then(m => ({ default: m.DocumentHub })))

// Lazy Load Legal Modules
export const ContractWizard = React.lazy(() => import('@/components/modules/legal/ContractWizard').then(m => ({ default: m.ContractWizard })))

// Lazy Load HR Modules
export const AssetInventory = React.lazy(() => import('@/components/modules/hr/AssetInventory').then(m => ({ default: m.AssetInventory })))
export const PayrollLite = React.lazy(() => import('@/components/modules/hr/PayrollLite').then(m => ({ default: m.PayrollLite })))

// Lazy Load Marketing Modules
export const MarketingDashboard = React.lazy(() => import('@/components/modules/marketing/MarketingDashboard').then(m => ({ default: m.MarketingDashboard })))
export const SEOToolkit = React.lazy(() => import('@/components/modules/marketing/SEOToolkit').then(m => ({ default: m.SEOToolkit })))
export const AdManager = React.lazy(() => import('@/components/modules/marketing/AdManager').then(m => ({ default: m.AdManager })))
export const NewsletterStudio = React.lazy(() => import('@/components/modules/marketing/NewsletterStudio').then(m => ({ default: m.NewsletterStudio })))

// Lazy Load Development Modules
export const DevHQ = React.lazy(() => import('@/components/modules/dev/DevHQ').then(m => ({ default: m.DevHQ })))
export const TraeCoder = React.lazy(() => import('@/components/modules/dev/TraeCoder').then(m => ({ default: m.TraeCoder })))

// Lazy Load AI Modules
export const ResearchAgent = React.lazy(() => import('@/components/modules/ai/ResearchAgent').then(m => ({ default: m.ResearchAgent })))
export const VoiceCommand = React.lazy(() => import('@/components/modules/ai/VoiceCommand').then(m => ({ default: m.VoiceCommand })))

// Lazy Load System Modules
export const SettingsPanel = React.lazy(() => import('@/components/modules/core/settings/SettingsPanel').then(m => ({ default: m.SettingsPanel })))
export const PasswordManager = React.lazy(() => import('@/components/modules/security/PasswordManager').then(m => ({ default: m.PasswordManager })))
export const SystemUpdate = React.lazy(() => import('@/components/modules/system/SystemUpdate').then(m => ({ default: m.SystemUpdate })))

