/**
 * Template Manager Component
 * Browse, select, and create from templates
 */

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useTemplateStore } from '@/stores/template-store'
import { Template as WorkflowTemplate } from '@/types/template'
import { FileText, Mail, FileCheck, CheckSquare, Target, Plus } from 'lucide-react'
import { toast } from '@/components/ui/use-toast'

interface TemplateManagerProps {
  onTemplateSelected?: (templateId: string) => void
  trigger?: React.ReactNode
}

const TEMPLATE_ICONS: Record<WorkflowTemplate['type'], React.ComponentType<{ className?: string }>> = {
  invoice: FileText,
  email: Mail,
  contract: FileCheck,
  'task-list': CheckSquare,
  project: Target
}

export function TemplateManager({ onTemplateSelected, trigger }: TemplateManagerProps) {
  const [open, setOpen] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<WorkflowTemplate | null>(null)
  const [variables, setVariables] = useState<Record<string, string>>({})

  const { workflowTemplates, createFromTemplate } = useTemplateStore()

  const handleSelectTemplate = (template: WorkflowTemplate) => {
    setSelectedTemplate(template)
    // Initialize variables with empty values
    const vars: Record<string, string> = {}
    template.variables.forEach(v => {
      vars[v] = ''
    })
    setVariables(vars)
  }

  const handleCreateFromTemplate = async () => {
    if (!selectedTemplate) return

    try {
      await createFromTemplate(selectedTemplate.id, variables)
      toast({
        title: 'Created from template',
        description: `Created ${selectedTemplate.name} successfully.`
      })
      setOpen(false)
      setSelectedTemplate(null)
      setVariables({})
      onTemplateSelected?.(selectedTemplate.id)
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create from template.',
        variant: 'destructive'
      })
    }
  }

  const groupedTemplates = workflowTemplates.reduce((acc, template) => {
    if (!acc[template.category]) {
      acc[template.category] = []
    }
    acc[template.category].push(template)
    return acc
  }, {} as Record<string, WorkflowTemplate[]>)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            Use Template
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Templates</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-4">
          {/* Template list */}
          <div className="space-y-4">
            <ScrollArea className="h-[500px]">
              {Object.entries(groupedTemplates).map(([category, templates]) => (
                <div key={category} className="mb-6">
                  <h3 className="text-sm font-semibold mb-2 text-muted-foreground uppercase">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {templates.map((template) => {
                      const Icon = TEMPLATE_ICONS[template.type]
                      const isSelected = selectedTemplate?.id === template.id
                      return (
                        <Card
                          key={template.id}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                          }`}
                          onClick={() => handleSelectTemplate(template)}
                        >
                          <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              <CardTitle className="text-sm">{template.name}</CardTitle>
                            </div>
                            <CardDescription className="text-xs">
                              {template.tags.join(', ')}
                            </CardDescription>
                          </CardHeader>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              ))}
            </ScrollArea>
          </div>

          {/* Variable input */}
          <div className="space-y-4">
            {selectedTemplate ? (
              <>
                <div>
                  <h3 className="font-semibold mb-2">{selectedTemplate.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Fill in the variables to create from this template
                  </p>
                </div>

                <div className="space-y-3">
                  {selectedTemplate.variables.map((variable) => (
                    <div key={variable}>
                      <Label htmlFor={variable}>
                        {variable.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                      <Input
                        id={variable}
                        value={variables[variable] || ''}
                        onChange={(e) =>
                          setVariables({ ...variables, [variable]: e.target.value })
                        }
                        placeholder={`Enter ${variable}`}
                      />
                    </div>
                  ))}
                </div>

                <Button onClick={handleCreateFromTemplate} className="w-full">
                  Create from Template
                </Button>
              </>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Select a template to continue
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

