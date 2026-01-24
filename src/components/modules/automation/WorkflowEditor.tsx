import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { 
  Zap, ArrowRight, 
  Plus, Play, 
  X, Edit, Trash2, Copy, History, Search,
  AlertCircle, TrendingUp, Activity, Layers, Sparkles
} from 'lucide-react'
import { cn } from '@/services/utils'
import { useWorkflowStore } from '@/stores/workflow-store'
import { WorkflowRule, TriggerType, ActionType } from '@/types/workflow'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { WORKFLOW_TEMPLATES } from '@/lib/workflow-templates'
import { motion, AnimatePresence } from 'framer-motion'
import { ScrollArea } from '@/components/ui/scroll-area'

interface WorkflowExecution {
  id: string
  workflowId: string
  workflowName: string
  status: 'success' | 'error' | 'skipped'
  executedAt: Date
  duration?: number
  error?: string
  data?: any
}

export function WorkflowEditor() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowRule | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<'all' | 'enabled' | 'disabled'>('all')
  const [activeTab, setActiveTab] = useState<'workflows' | 'templates' | 'history'>('workflows')
  const [executions, setExecutions] = useState<WorkflowExecution[]>([])
  
  const workflows = useWorkflowStore(state => state.workflows)
  const toggleWorkflow = useWorkflowStore(state => state.toggleWorkflow)
  const deleteWorkflow = useWorkflowStore(state => state.deleteWorkflow)
  const addWorkflow = useWorkflowStore(state => state.addWorkflow)
  const updateWorkflow = useWorkflowStore(state => state.updateWorkflow)

  // Filter workflows
  const filteredWorkflows = useMemo(() => {
    return workflows.filter(wf => {
      const matchesSearch = wf.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesFilter = filterStatus === 'all' || 
        (filterStatus === 'enabled' && wf.enabled) ||
        (filterStatus === 'disabled' && !wf.enabled)
      return matchesSearch && matchesFilter
    })
  }, [workflows, searchQuery, filterStatus])

  // Stats
  const stats = useMemo(() => {
    return {
      total: workflows.length,
      enabled: workflows.filter(w => w.enabled).length,
      disabled: workflows.filter(w => !w.enabled).length,
      recentExecutions: executions.filter(e => {
        const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
        return new Date(e.executedAt) > dayAgo
      }).length
    }
  }, [workflows, executions])

  const createEmptyWorkflow = (): WorkflowRule => ({
    id: Math.random().toString(36).substr(2, 9),
    name: 'New Workflow',
    enabled: true,
    trigger: { type: 'task_created', config: {} },
    conditions: [],
    actions: [{ type: 'notify', config: { message: 'Workflow executed' } }],
    createdAt: new Date(),
    updatedAt: new Date()
  })

  const getTriggerLabel = (trigger: WorkflowRule['trigger']) => {
    const labels: Record<TriggerType, string> = {
      schedule: '⏰ Scheduled',
      invoice_created: '📄 Invoice Created',
      invoice_paid: '💰 Invoice Paid',
      invoice_overdue: '⚠️ Invoice Overdue',
      task_completed: '✅ Task Completed',
      task_created: '📝 Task Created',
      expense_submitted: '💳 Expense Submitted',
      time_tracked: '⏱️ Time Tracked'
    }
    return labels[trigger.type] || trigger.type
  }

  const getActionLabel = (action: WorkflowRule['actions'][0]) => {
    const labels: Record<ActionType, string> = {
      send_email: '📧 Send Email',
      create_task: '📝 Create Task',
      update_status: '🔄 Update Status',
      notify: '🔔 Notify',
      webhook: '🔗 Webhook',
      update_invoice: '📄 Update Invoice',
      create_invoice: '📋 Create Invoice'
    }
    return labels[action.type] || action.type
  }

  const handleTemplateSelect = (template: WorkflowRule) => {
    const newWorkflow: WorkflowRule = {
      ...template,
      id: Math.random().toString(36).substr(2, 9),
      name: `${template.name} (Copy)`,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    addWorkflow(newWorkflow)
    setSelectedWorkflow(newWorkflow)
    setShowTemplates(false)
    setActiveTab('workflows')
  }

  return (
    <div className="h-full flex flex-col gap-6 p-2 overflow-y-auto">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Automation Foundry</h2>
          <p className="text-muted-foreground">Design workflows and automate your business</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={() => setShowTemplates(true)}
            className="gap-2"
          >
            <Sparkles className="h-4 w-4" /> Templates
          </Button>
          <Button 
            className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => {
              const newWorkflow = createEmptyWorkflow()
              addWorkflow(newWorkflow)
              setSelectedWorkflow(newWorkflow)
              setIsEditing(true)
            }}
          >
            <Plus className="h-4 w-4" /> New Workflow
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Workflows</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Layers className="h-8 w-8 text-purple-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active</p>
                <p className="text-2xl font-bold text-green-600">{stats.enabled}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Disabled</p>
                <p className="text-2xl font-bold text-gray-500">{stats.disabled}</p>
              </div>
              <X className="h-8 w-8 text-gray-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Executions (24h)</p>
                <p className="text-2xl font-bold text-blue-600">{stats.recentExecutions}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="history">Execution History</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="flex-1 flex gap-6 mt-6">
          {/* Workflow List */}
          <div className="flex-1 space-y-4">
            {/* Search and Filter */}
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search workflows..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterStatus} onValueChange={(v: any) => setFilterStatus(v)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="enabled">Enabled Only</SelectItem>
                  <SelectItem value="disabled">Disabled Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Workflow Cards */}
            <ScrollArea className="h-[600px]">
              <div className="space-y-3">
                <AnimatePresence>
                  {filteredWorkflows.map(wf => (
                    <motion.div
                      key={wf.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                    >
                      <Card 
                        className={cn(
                          "group hover:border-purple-500 transition-all cursor-pointer",
                          selectedWorkflow?.id === wf.id && "border-purple-500 shadow-lg"
                        )}
                        onClick={() => setSelectedWorkflow(wf)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <div className={cn(
                                  "p-2 rounded-lg",
                                  wf.enabled ? "bg-green-100 text-green-600 dark:bg-green-900/20" : "bg-gray-100 text-gray-500 dark:bg-gray-800"
                                )}>
                                  <Zap className={cn("h-5 w-5", wf.enabled && "animate-pulse")} />
                                </div>
                                <div className="flex-1">
                                  <h3 className="font-bold text-lg">{wf.name}</h3>
                                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                                    <span className="flex items-center gap-1">
                                      <Play className="h-3 w-3" /> {getTriggerLabel(wf.trigger)}
                                    </span>
                                    {wf.conditions.length > 0 && (
                                      <>
                                        <span>•</span>
                                        <span>{wf.conditions.length} condition{wf.conditions.length !== 1 ? 's' : ''}</span>
                                      </>
                                    )}
                                    <span>•</span>
                                    <span>{wf.actions.length} action{wf.actions.length !== 1 ? 's' : ''}</span>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Actions Preview */}
                              <div className="flex flex-wrap gap-2 mt-3">
                                {wf.actions.slice(0, 3).map((action, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {getActionLabel(action)}
                                  </Badge>
                                ))}
                                {wf.actions.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{wf.actions.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={wf.enabled}
                                onCheckedChange={() => toggleWorkflow(wf.id)}
                                onClick={(e) => e.stopPropagation()}
                              />
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedWorkflow(wf)
                                  setIsEditing(true)
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  if (confirm('Delete this workflow?')) {
                                    deleteWorkflow(wf.id)
                                    if (selectedWorkflow?.id === wf.id) {
                                      setSelectedWorkflow(null)
                                    }
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {filteredWorkflows.length === 0 && (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Zap className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                      <p className="text-muted-foreground">
                        {searchQuery ? 'No workflows match your search' : 'No workflows yet. Create one to get started!'}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Workflow Details Sidebar */}
          <div className="w-96 space-y-4">
            {selectedWorkflow ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{selectedWorkflow.name}</CardTitle>
                    <Badge variant={selectedWorkflow.enabled ? "default" : "secondary"}>
                      {selectedWorkflow.enabled ? 'Active' : 'Disabled'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Trigger */}
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">Trigger</Label>
                    <div className="p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                      <div className="flex items-center gap-2">
                        <Play className="h-4 w-4 text-purple-600" />
                        <span className="text-sm font-medium">{getTriggerLabel(selectedWorkflow.trigger)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Conditions */}
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">
                      Conditions {selectedWorkflow.conditions.length > 0 && `(${selectedWorkflow.conditions.length})`}
                    </Label>
                    {selectedWorkflow.conditions.length > 0 ? (
                      <div className="space-y-2">
                        {selectedWorkflow.conditions.map((condition, idx) => (
                          <div key={idx} className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-sm">
                            <span className="font-medium">{condition.field}</span>
                            <span className="mx-2 text-muted-foreground">{condition.operator}</span>
                            <span className="font-mono">{String(condition.value)}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-900/20 border border-gray-200 dark:border-gray-800 text-sm text-muted-foreground text-center">
                        No conditions (runs always)
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div>
                    <Label className="text-sm font-semibold mb-2 block">
                      Actions ({selectedWorkflow.actions.length})
                    </Label>
                    <div className="space-y-2">
                      {selectedWorkflow.actions.map((action, idx) => (
                        <div key={idx} className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                          <div className="flex items-center gap-2 mb-1">
                            <ArrowRight className="h-4 w-4 text-green-600" />
                            <span className="text-sm font-medium">{getActionLabel(action)}</span>
                          </div>
                          {action.config && Object.keys(action.config).length > 0 && (
                            <div className="text-xs text-muted-foreground mt-1 ml-6">
                              {JSON.stringify(action.config, null, 2).slice(0, 50)}...
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setIsEditing(true)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        const copy: WorkflowRule = {
                          ...selectedWorkflow,
                          id: Math.random().toString(36).substr(2, 9),
                          name: `${selectedWorkflow.name} (Copy)`,
                          createdAt: new Date(),
                          updatedAt: new Date()
                        }
                        addWorkflow(copy)
                        setSelectedWorkflow(copy)
                      }}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-64 text-muted-foreground text-center">
                  <div>
                    <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Select a workflow to view details</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Last 7 days</span>
                  <span className="font-medium">{executions.filter(e => {
                    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                    return new Date(e.executedAt) > weekAgo
                  }).length} executions</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Success rate</span>
                  <span className="font-medium text-green-600">
                    {executions.length > 0 
                      ? Math.round((executions.filter(e => e.status === 'success').length / executions.length) * 100)
                      : 0}%
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {WORKFLOW_TEMPLATES.map(template => (
              <Card 
                key={template.id}
                className="hover:border-purple-500 transition-colors cursor-pointer"
                onClick={() => handleTemplateSelect(template)}
              >
                <CardHeader>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {getTriggerLabel(template.trigger)} → {template.actions.length} action{template.actions.length !== 1 ? 's' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-xs text-muted-foreground">
                      <strong>Trigger:</strong> {getTriggerLabel(template.trigger)}
                    </div>
                    {template.conditions.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        <strong>Conditions:</strong> {template.conditions.length}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground">
                      <strong>Actions:</strong>
                      <div className="mt-1 space-y-1">
                        {template.actions.map((action, idx) => (
                          <div key={idx} className="ml-2">• {getActionLabel(action)}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant="outline">
                    <Copy className="h-4 w-4 mr-2" /> Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Execution History</CardTitle>
              <CardDescription>Recent workflow executions and their results</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                {executions.length > 0 ? (
                  <div className="space-y-3">
                    {executions.map(exec => (
                      <div 
                        key={exec.id}
                        className="p-4 rounded-lg border flex items-start justify-between gap-4"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={exec.status === 'success' ? 'default' : exec.status === 'error' ? 'destructive' : 'secondary'}>
                              {exec.status}
                            </Badge>
                            <span className="font-medium">{exec.workflowName}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(exec.executedAt).toLocaleString()}
                            {exec.duration && ` • ${exec.duration}ms`}
                          </div>
                          {exec.error && (
                            <div className="mt-2 p-2 rounded bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-600">
                              <AlertCircle className="h-4 w-4 inline mr-2" />
                              {exec.error}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No execution history yet</p>
                    <p className="text-xs mt-2">Workflow executions will appear here</p>
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      {isEditing && selectedWorkflow && (
        <WorkflowEditDialog
          workflow={selectedWorkflow}
          onClose={() => setIsEditing(false)}
          onSave={(updated) => {
            updateWorkflow(selectedWorkflow.id, updated)
            setIsEditing(false)
            setSelectedWorkflow({ ...selectedWorkflow, ...updated, updatedAt: new Date() })
          }}
        />
      )}
    </div>
  )
}

function WorkflowEditDialog({
  workflow,
  onClose,
  onSave
}: {
  workflow: WorkflowRule
  onClose: () => void
  onSave: (updates: Partial<WorkflowRule>) => void
}) {
  const [name, setName] = useState(workflow.name)
  const [triggerType, setTriggerType] = useState<TriggerType>(workflow.trigger.type)
  const [enabled, setEnabled] = useState(workflow.enabled)
  const [conditions, setConditions] = useState(workflow.conditions)
  const [actions, setActions] = useState(workflow.actions)

  const handleSave = () => {
    onSave({
      name,
      enabled,
      trigger: { type: triggerType, config: workflow.trigger.config },
      conditions,
      actions
    })
  }

  const addCondition = () => {
    setConditions([...conditions, { field: '', operator: 'equals', value: '' }])
  }

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index))
  }

  const addAction = () => {
    setActions([...actions, { type: 'notify', config: {} }])
  }

  const removeAction = (index: number) => {
    setActions(actions.filter((_, i) => i !== index))
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Workflow</DialogTitle>
          <DialogDescription>
            Configure triggers, conditions, and actions for your automation
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Workflow Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Awesome Workflow"
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch
                checked={enabled}
                onCheckedChange={setEnabled}
              />
              <Label>Enable this workflow</Label>
            </div>
          </div>

          {/* Trigger */}
          <div>
            <Label>Trigger</Label>
            <Select value={triggerType} onValueChange={(v: TriggerType) => setTriggerType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="invoice_created">📄 Invoice Created</SelectItem>
                <SelectItem value="invoice_paid">💰 Invoice Paid</SelectItem>
                <SelectItem value="invoice_overdue">⚠️ Invoice Overdue</SelectItem>
                <SelectItem value="task_created">📝 Task Created</SelectItem>
                <SelectItem value="task_completed">✅ Task Completed</SelectItem>
                <SelectItem value="expense_submitted">💳 Expense Submitted</SelectItem>
                <SelectItem value="time_tracked">⏱️ Time Tracked</SelectItem>
                <SelectItem value="schedule">⏰ Schedule (Daily)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Conditions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Conditions (Optional)</Label>
              <Button variant="outline" size="sm" onClick={addCondition}>
                <Plus className="h-4 w-4 mr-1" /> Add Condition
              </Button>
            </div>
            <div className="space-y-2">
              {conditions.map((condition, idx) => (
                <div key={idx} className="flex gap-2 items-center p-3 border rounded-lg">
                  <Input
                    placeholder="Field"
                    value={condition.field}
                    onChange={(e) => {
                      const updated = [...conditions]
                      updated[idx].field = e.target.value
                      setConditions(updated)
                    }}
                    className="flex-1"
                  />
                  <Select
                    value={condition.operator}
                    onValueChange={(v: any) => {
                      const updated = [...conditions]
                      updated[idx].operator = v
                      setConditions(updated)
                    }}
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equals">Equals</SelectItem>
                      <SelectItem value="not_equals">Not Equals</SelectItem>
                      <SelectItem value="contains">Contains</SelectItem>
                      <SelectItem value="greater_than">Greater Than</SelectItem>
                      <SelectItem value="less_than">Less Than</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Value"
                    value={condition.value}
                    onChange={(e) => {
                      const updated = [...conditions]
                      updated[idx].value = e.target.value
                      setConditions(updated)
                    }}
                    className="flex-1"
                  />
                  <Button variant="ghost" size="icon" onClick={() => removeCondition(idx)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {conditions.length === 0 && (
                <div className="p-4 border border-dashed rounded-lg text-center text-sm text-muted-foreground">
                  No conditions - workflow will run on every trigger
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Actions</Label>
              <Button variant="outline" size="sm" onClick={addAction}>
                <Plus className="h-4 w-4 mr-1" /> Add Action
              </Button>
            </div>
            <div className="space-y-2">
              {actions.map((action, idx) => (
                <div key={idx} className="p-3 border rounded-lg space-y-2">
                  <div className="flex gap-2 items-center">
                    <Select
                      value={action.type}
                      onValueChange={(v: ActionType) => {
                        const updated = [...actions]
                        updated[idx].type = v
                        setActions(updated)
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="send_email">📧 Send Email</SelectItem>
                        <SelectItem value="create_task">📝 Create Task</SelectItem>
                        <SelectItem value="update_status">🔄 Update Status</SelectItem>
                        <SelectItem value="notify">🔔 Notify</SelectItem>
                        <SelectItem value="webhook">🔗 Webhook</SelectItem>
                        <SelectItem value="update_invoice">📄 Update Invoice</SelectItem>
                        <SelectItem value="create_invoice">📋 Create Invoice</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="ghost" size="icon" onClick={() => removeAction(idx)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    placeholder="Configuration (JSON)"
                    value={JSON.stringify(action.config || {})}
                    onChange={(e) => {
                      try {
                        const config = JSON.parse(e.target.value)
                        const updated = [...actions]
                        updated[idx].config = config
                        setActions(updated)
                      } catch {
                        // Invalid JSON, ignore
                      }
                    }}
                    className="font-mono text-xs"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Workflow
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
