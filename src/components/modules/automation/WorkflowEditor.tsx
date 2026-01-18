import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Zap, ArrowRight, Mail, Clock, CheckCircle, 
  Plus, Play, Settings, MoreHorizontal, MessageSquare,
  X, Edit
} from 'lucide-react'
import { cn } from '@/services/utils'
import { useWorkflowStore } from '@/stores/workflow-store'
import { WorkflowRule } from '@/types/workflow'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function WorkflowEditor() {
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowRule | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const workflows = useWorkflowStore(state => state.workflows)
  const toggleWorkflow = useWorkflowStore(state => state.toggleWorkflow)
  const deleteWorkflow = useWorkflowStore(state => state.deleteWorkflow)

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
    switch (trigger.type) {
      case 'schedule': return 'Time (Daily)'
      case 'invoice_created': return 'Invoice Created'
      case 'invoice_paid': return 'Invoice Paid'
      case 'invoice_overdue': return 'Invoice Overdue'
      case 'task_completed': return 'Task Completed'
      case 'task_created': return 'Task Created'
      case 'expense_submitted': return 'Expense Submitted'
      case 'time_tracked': return 'Time Tracked'
      default: return trigger.type
    }
  }

  return (
    <div className="h-full flex flex-col gap-6 p-2 overflow-y-auto">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Automation Foundry</h2>
          <p className="text-muted-foreground">Design workflows and connect your apps</p>
        </div>
        <Button 
          className="gap-2 bg-purple-600 hover:bg-purple-700 text-white"
          onClick={() => {
            const newWorkflow = createEmptyWorkflow()
            setSelectedWorkflow(newWorkflow)
            setIsEditing(true)
          }}
        >
          <Plus className="h-4 w-4" /> New Workflow
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Workflow list */}
        <div className="lg:col-span-2 space-y-4">
          {workflows.map(wf => (
            <Card 
              key={wf.id} 
              className={cn(
                "group hover:border-purple-500 transition-colors cursor-pointer",
                selectedWorkflow?.id === wf.id && "border-purple-500"
              )}
              onClick={() => setSelectedWorkflow(wf)}
            >
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-3 rounded-xl",
                    wf.enabled ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-500"
                  )}>
                    <Zap className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{wf.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Play className="h-3 w-3" /> {getTriggerLabel(wf.trigger)}
                      </span>
                      <span>•</span>
                      <span>{wf.actions.length} action{wf.actions.length !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
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
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Workflow details */}
        <div className="space-y-6">
          {selectedWorkflow ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedWorkflow.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="text-sm font-medium mb-2">Trigger</div>
                  <div className="text-sm text-muted-foreground">
                    {getTriggerLabel(selectedWorkflow.trigger)}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">Conditions</div>
                  <div className="text-sm text-muted-foreground">
                    {selectedWorkflow.conditions.length > 0
                      ? `${selectedWorkflow.conditions.length} condition(s)`
                      : 'No conditions'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-2">Actions</div>
                  <div className="space-y-1">
                    {selectedWorkflow.actions.map((action, idx) => (
                      <div key={idx} className="text-sm text-muted-foreground">
                        • {action.type.replace('_', ' ')}
                      </div>
                    ))}
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Workflow
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64 text-muted-foreground">
                Select a workflow to view details
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { time: '2m ago', msg: 'Invoice reminder sent', icon: Mail },
                { time: '15m ago', msg: 'Expense auto-categorized', icon: CheckCircle },
                { time: '1h ago', msg: 'Task created from workflow', icon: Zap },
              ].map((log, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <log.icon className="h-4 w-4 mt-0.5 text-slate-400" />
                  <div>
                    <p className="font-medium">{log.msg}</p>
                    <p className="text-xs text-muted-foreground">{log.time}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Dialog */}
      {isEditing && selectedWorkflow && (
        <WorkflowEditDialog
          workflow={selectedWorkflow}
          onClose={() => setIsEditing(false)}
          onSave={(updated) => {
            useWorkflowStore.getState().updateWorkflow(selectedWorkflow.id, updated)
            setIsEditing(false)
            setSelectedWorkflow({ ...selectedWorkflow, ...updated })
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
  const [triggerType, setTriggerType] = useState(workflow.trigger.type)

  const handleSave = () => {
    onSave({
      name,
      trigger: { type: triggerType, config: workflow.trigger.config }
    })
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Workflow</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Workflow Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="trigger">Trigger Type</Label>
            <Select value={triggerType} onValueChange={(v: any) => setTriggerType(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="invoice_created">Invoice Created</SelectItem>
                <SelectItem value="invoice_paid">Invoice Paid</SelectItem>
                <SelectItem value="invoice_overdue">Invoice Overdue</SelectItem>
                <SelectItem value="task_created">Task Created</SelectItem>
                <SelectItem value="task_completed">Task Completed</SelectItem>
                <SelectItem value="expense_submitted">Expense Submitted</SelectItem>
                <SelectItem value="time_tracked">Time Tracked</SelectItem>
                <SelectItem value="schedule">Schedule (Daily)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
