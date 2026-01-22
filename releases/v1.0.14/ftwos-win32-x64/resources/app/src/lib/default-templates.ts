/**
 * Default Templates
 * Pre-built templates for common use cases
 */

import { Template } from '@/types/template'

export const DEFAULT_TEMPLATES: Template[] = [
  {
    id: 'invoice-standard',
    name: 'Standard Invoice',
    category: 'Finance',
    type: 'invoice',
    content: {
      lineItems: [
        { description: '{{serviceName}}', quantity: 1, rate: 0, amount: 0 }
      ],
      dueDate: '{{dueDate}}',
      terms: 'Net 30',
      notes: 'Thank you for your business!'
    },
    variables: ['serviceName', 'dueDate'],
    tags: ['invoice', 'billing', 'standard']
  },
  {
    id: 'project-kickoff',
    name: 'Project Kickoff Tasks',
    category: 'Project',
    type: 'task-list',
    content: {
      tasks: [
        { title: 'Setup project repository', priority: 'high', status: 'todo' },
        { title: 'Schedule kickoff meeting', priority: 'high', status: 'todo' },
        { title: 'Create project roadmap', priority: 'medium', status: 'todo' },
        { title: 'Define success metrics', priority: 'medium', status: 'todo' },
        { title: 'Setup CI/CD pipeline', priority: 'low', status: 'todo' }
      ]
    },
    variables: [],
    tags: ['project', 'kickoff', 'tasks']
  },
  {
    id: 'client-welcome',
    name: 'Client Welcome Email',
    category: 'Communication',
    type: 'email',
    content: {
      subject: 'Welcome to {{companyName}} - Let\'s Get Started!',
      body: `Hi {{clientName}},

Thank you for choosing {{companyName}}. We're excited to work with you!

Here's what to expect:
- Initial consultation within 24 hours
- Project kickoff meeting scheduled
- Regular updates every {{updateFrequency}}

If you have any questions, feel free to reach out.

Best regards,
{{yourName}}`
    },
    variables: ['clientName', 'companyName', 'updateFrequency', 'yourName'],
    tags: ['email', 'onboarding', 'client']
  },
  {
    id: 'contract-standard',
    name: 'Standard Service Contract',
    category: 'Legal',
    type: 'contract',
    content: {
      title: 'Service Agreement',
      parties: {
        client: '{{clientName}}',
        provider: '{{companyName}}'
      },
      services: '{{serviceDescription}}',
      payment: {
        amount: '{{totalAmount}}',
        terms: '{{paymentTerms}}'
      },
      duration: '{{projectDuration}}',
      terms: [
        'Payment due within {{paymentTerms}}',
        'Work to be completed by {{completionDate}}',
        'Both parties agree to maintain confidentiality'
      ]
    },
    variables: ['clientName', 'companyName', 'serviceDescription', 'totalAmount', 'paymentTerms', 'projectDuration', 'completionDate'],
    tags: ['contract', 'legal', 'agreement']
  },
  {
    id: 'recurring-tasks',
    name: 'Recurring Task List',
    category: 'Productivity',
    type: 'task-list',
    content: {
      tasks: [
        { title: 'Weekly team standup', priority: 'high', recurrence: 'weekly', status: 'todo' },
        { title: 'Review and respond to emails', priority: 'medium', recurrence: 'daily', status: 'todo' },
        { title: 'Update project documentation', priority: 'medium', recurrence: 'weekly', status: 'todo' },
        { title: 'Backup important files', priority: 'low', recurrence: 'weekly', status: 'todo' }
      ]
    },
    variables: [],
    tags: ['tasks', 'recurring', 'productivity']
  }
]

