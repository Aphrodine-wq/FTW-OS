/**
 * Smart Notification Engine
 * Intelligent notification batching and digest system
 */

import React from 'react'
import { toast } from '@/components/ui/use-toast'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  priority: 'critical' | 'high' | 'normal'
  timestamp: Date
  link?: string
}

export class SmartNotificationEngine {
  private queue: Notification[] = []
  private digestTimer: NodeJS.Timeout | null = null
  private batchTimer: NodeJS.Timeout | null = null

  /**
   * Notify with intelligent batching
   */
  notify(notification: Notification) {
    const priority = this.calculatePriority(notification)

    if (priority === 'critical') {
      // Show immediately
      this.showNotification(notification)
    } else if (priority === 'high') {
      // Show after short delay (batch similar)
      this.queue.push(notification)
      this.scheduleBatch(5000) // 5 seconds
    } else {
      // Add to digest
      this.queue.push(notification)
      this.scheduleBatch(300000) // 5 minutes
    }
  }

  /**
   * Calculate notification priority
   */
  private calculatePriority(n: Notification): 'critical' | 'high' | 'normal' {
    // Critical: payment failures, security alerts
    if (n.type === 'security' || n.type === 'payment_failed') {
      return 'critical'
    }

    // High: task deadlines, client messages
    if (n.type === 'deadline' || n.type === 'client_message') {
      return 'high'
    }

    return 'normal'
  }

  /**
   * Schedule batch notification
   */
  private scheduleBatch(delay: number) {
    if (this.batchTimer) return

    this.batchTimer = setTimeout(() => {
      if (this.queue.length > 0) {
        this.showDigest()
        this.queue = []
      }
      this.batchTimer = null
    }, delay)
  }

  /**
   * Show individual notification
   */
  private showNotification(notification: Notification) {
    toast({
      title: notification.title,
      description: notification.message,
      variant: notification.priority === 'critical' ? 'destructive' : 'default'
    })
  }

  /**
   * Show digest of batched notifications
   */
  private showDigest() {
    if (this.queue.length === 0) return

    const grouped = this.groupNotifications(this.queue)

    toast.custom((t) => (
      <Card className="w-96">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>📬 {this.queue.length} Update{this.queue.length !== 1 ? 's' : ''}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={() => toast.dismiss(t)}
            >
              <X className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {Object.entries(grouped).map(([type, notifications]) => (
            <div key={type}>
              <div className="font-medium text-sm capitalize mb-1">
                {type.replace('_', ' ')}
              </div>
              {notifications.map((n, i) => (
                <div key={i} className="text-sm text-muted-foreground pl-2">
                  • {n.message}
                </div>
              ))}
            </div>
          ))}
        </CardContent>
      </Card>
    ))
  }

  /**
   * Group notifications by type
   */
  private groupNotifications(notifications: Notification[]) {
    return notifications.reduce((acc, n) => {
      if (!acc[n.type]) acc[n.type] = []
      acc[n.type].push(n)
      return acc
    }, {} as Record<string, Notification[]>)
  }

  /**
   * Clear queue
   */
  clearQueue() {
    this.queue = []
    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
      this.batchTimer = null
    }
    if (this.digestTimer) {
      clearTimeout(this.digestTimer)
      this.digestTimer = null
    }
  }
}

export const notificationEngine = new SmartNotificationEngine()


















