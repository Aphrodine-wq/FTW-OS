/**
 * Notification Center Component
 * Displays and manages application notifications
 */

import React from 'react'
import { Bell, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useNotificationStore, AppNotification } from '@/stores/notification-store'
import { formatDistanceToNow } from 'date-fns'

function NotificationItem({ notification }: { notification: AppNotification }) {
  const markAsRead = useNotificationStore(state => state.markAsRead)
  
  return (
    <div
      className={`p-3 rounded-lg border transition-colors ${
        notification.read ? 'bg-gray-50' : 'bg-white border-blue-200'
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">{notification.title}</p>
          <p className="text-xs text-gray-500 mt-1">{notification.content}</p>
          <p className="text-xs text-gray-400 mt-1">
            {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
          </p>
        </div>
        {!notification.read && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={() => markAsRead(notification.id)}
          >
            <Check className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  )
}

export function NotificationCenter() {
  const notifications = useNotificationStore(state => state.notifications)
  const clearAll = useNotificationStore(state => state.clearAll)
  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            {notifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="h-7 text-xs"
              >
                Clear all
              </Button>
            )}
          </div>
        </div>
        
        <ScrollArea className="h-96">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No notifications</p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {notifications.map(notification => (
                <NotificationItem key={notification.id} notification={notification} />
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

