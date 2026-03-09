import { createContext } from 'react'
import type { NotificationItem } from '@/lib/api'

export type NotificationContextValue = {
  notifications: NotificationItem[]
  hasUnread: boolean
  seenNotificationIds: Set<string>
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  markNotificationsRead: (ids: string[]) => void
  markAllRead: () => void
}

export const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)
