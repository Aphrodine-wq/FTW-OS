/**
 * Widget Customizer Component
 * Allows users to customize widget settings
 */

import React from 'react'
import { Settings } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

interface WidgetCustomizerProps {
  widgetId: string
  widgetName: string
  refreshInterval?: number
  size?: 'small' | 'medium' | 'large'
  onRefreshIntervalChange?: (interval: number) => void
  onSizeChange?: (size: 'small' | 'medium' | 'large') => void
  children?: React.ReactNode
}

export function WidgetCustomizer({
  widgetId,
  widgetName,
  refreshInterval = 60000,
  size = 'medium',
  onRefreshIntervalChange,
  onSizeChange,
  children
}: WidgetCustomizerProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Customize {widgetName}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Refresh interval */}
          <div className="space-y-2">
            <Label>Refresh Interval</Label>
            <Select
              value={refreshInterval.toString()}
              onValueChange={(value) => onRefreshIntervalChange?.(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="30000">30 seconds</SelectItem>
                <SelectItem value="60000">1 minute</SelectItem>
                <SelectItem value="300000">5 minutes</SelectItem>
                <SelectItem value="600000">10 minutes</SelectItem>
                <SelectItem value="3600000">1 hour</SelectItem>
                <SelectItem value="0">Manual refresh only</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Size */}
          <div className="space-y-2">
            <Label>Widget Size</Label>
            <RadioGroup
              value={size}
              onValueChange={(value) => onSizeChange?.(value as 'small' | 'medium' | 'large')}
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="small" id="small" />
                <Label htmlFor="small">Small</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="medium" id="medium" />
                <Label htmlFor="medium">Medium</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="large" id="large" />
                <Label htmlFor="large">Large</Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Widget-specific options */}
          {children}
        </div>
      </DialogContent>
    </Dialog>
  )
}

