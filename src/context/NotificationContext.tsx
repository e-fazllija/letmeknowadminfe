import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import axios from 'axios'
import {
  getClientInvoices,
  getClients,
  getPaymentNotifications,
  type Client,
  type NotificationItem,
} from '@/lib/api'
import { NotificationContext } from './notification-context'
import { useAuth } from './useAuth'
const LAST_SEEN_KEY = 'lmw_payment_notifications_seen'
const SEEN_NOTIFICATIONS_KEY = 'lmw_seen_notifications'
const LEGACY_SEEN_INVOICES_KEY = 'lmw_seen_invoices'
const CLIENT_SNAPSHOT_KEY = 'lmw_client_contact_snapshot'

function readLastSeen(): number {
  try {
    const raw = localStorage.getItem(LAST_SEEN_KEY)
    if (!raw) return 0
    const ts = parseInt(raw, 10)
    return Number.isFinite(ts) ? ts : 0
  } catch {
    return 0
  }
}

function readSeenNotifications(): Set<string> {
  try {
    const rawNew = localStorage.getItem(SEEN_NOTIFICATIONS_KEY)
    const rawLegacy = localStorage.getItem(LEGACY_SEEN_INVOICES_KEY)
    const parsedNew = rawNew ? JSON.parse(rawNew) : []
    const parsedLegacy = rawLegacy ? JSON.parse(rawLegacy) : []
    const merged = []
    if (Array.isArray(parsedNew)) merged.push(...parsedNew)
    if (Array.isArray(parsedLegacy)) merged.push(...parsedLegacy)
    return new Set(merged.filter((x) => typeof x === 'string'))
  } catch {
    return new Set()
  }
}

function readClientSnapshot(): Record<string, string> {
  try {
    const raw = localStorage.getItem(CLIENT_SNAPSHOT_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}
    return parsed as Record<string, string>
  } catch {
    return {}
  }
}

function persistSnapshot(snapshot: Record<string, string>) {
  try {
    localStorage.setItem(CLIENT_SNAPSHOT_KEY, JSON.stringify(snapshot))
  } catch {
    // ignore storage errors
  }
}

function getErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError<{ message?: string }>(err)) {
    return err.response?.data?.message || err.message || fallback
  }
  if (err instanceof Error && err.message) {
    return err.message
  }
  return fallback
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, loading: authLoading } = useAuth()
  const seenRef = useRef<Set<string>>(readSeenNotifications())
  const lastRefreshRef = useRef<number>(0)
  const loadingRef = useRef(false)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [, setLastSeenAt] = useState<number>(readLastSeen)
  const [useInvoiceFallback, setUseInvoiceFallback] = useState(false)
  const [seenNotificationIds, setSeenNotificationIds] = useState<Set<string>>(seenRef.current)
  const [clientSnapshot, setClientSnapshot] = useState<Record<string, string>>(readClientSnapshot)

  const fetchNotifications = useCallback(async () => {
    if (useInvoiceFallback) return await fallbackFromInvoices()
    try {
      return await getPaymentNotifications()
    } catch (err: unknown) {
      const status = axios.isAxiosError(err) ? err.response?.status : undefined
      const msg = getErrorMessage(err, '')
      if (status === 404 || msg.includes('Cannot GET')) {
        setUseInvoiceFallback(true)
        return await fallbackFromInvoices()
      }
      throw err
    }
  }, [useInvoiceFallback])

  const markNotificationsRead = useCallback((ids: string[]) => {
    if (!ids || ids.length === 0) return
    setSeenNotificationIds((prev) => {
      const next = new Set(prev)
      ids.forEach((id) => next.add(id))
      seenRef.current = next
      try {
        localStorage.setItem(SEEN_NOTIFICATIONS_KEY, JSON.stringify(Array.from(next)))
      } catch {
        // ignore storage errors
      }
      return next
    })
    setNotifications((prev) =>
      prev.filter((n) => {
        const nid = n.id
        return nid ? !ids.includes(nid) : true
      }),
    )
  }, [])

  const refresh = useCallback(async () => {
    if (!isAuthenticated || authLoading) return
    const now = Date.now()
    if (loadingRef.current || now - lastRefreshRef.current < 30000) return
    lastRefreshRef.current = now
    loadingRef.current = true
    setLoading(true)
    try {
      const data = await fetchNotifications()
      const clients = await getClients()
      const { updates, snapshot } = detectClientUpdates(clients, clientSnapshot)
      setClientSnapshot(snapshot)
      persistSnapshot(snapshot)
      const normalized = [...data, ...updates].map((n) => ({
        ...n,
        id: n.id || n.invoiceId || `${n.kind}-${n.clientId}-${n.createdAt}`,
        kind: n.kind || 'PAYMENT',
      }))
      const unseen = normalized.filter((n) => (n.id ? !seenRef.current.has(n.id) : true))
      setNotifications((prev) => dedupeById([...prev, ...unseen]))
      setError(null)
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Errore notifiche'))
    } finally {
      loadingRef.current = false
      setLoading(false)
    }
  }, [authLoading, isAuthenticated, fetchNotifications, clientSnapshot])

  useEffect(() => {
    if (!isAuthenticated || authLoading) {
      setNotifications([])
      return
    }

    refresh()
    const timer = setInterval(refresh, 30000)
    return () => {
      clearInterval(timer)
    }
  }, [refresh, isAuthenticated, authLoading])

  const markAllRead = useCallback(() => {
    const notifIds = notifications
      .map((n) => n.id)
      .filter((x): x is string => !!x)
    if (notifIds.length) {
      markNotificationsRead(notifIds)
    }
    const newest = notifications.reduce(
      (max, n) => Math.max(max, new Date(n.createdAt).getTime()),
      0,
    )
    const ts = newest || Date.now()
    setLastSeenAt(ts)
    try {
      localStorage.setItem(LAST_SEEN_KEY, ts.toString())
    } catch {
      // ignore storage write errors
    }
  }, [notifications, markNotificationsRead])

  const hasUnread = useMemo(() => {
    return notifications.length > 0
  }, [notifications])

  const value = useMemo(
    () => ({
      notifications,
      hasUnread,
      seenNotificationIds,
      loading,
      error,
      refresh,
      markNotificationsRead,
      markAllRead,
    }),
    [notifications, hasUnread, seenNotificationIds, loading, error, refresh, markNotificationsRead, markAllRead],
  )

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>
}

async function fallbackFromInvoices(limit = 10): Promise<NotificationItem[]> {
  const clients: Client[] = await getClients()
  const perClient = await Promise.all(
    clients.map(async (c) => {
      try {
        const invoices = await getClientInvoices(c.id)
        return invoices.map((inv) => ({
          id: `${inv.id}-${c.id}`,
          kind: 'PAYMENT' as const,
          clientId: c.id,
          clientName: c.companyName,
          amount: typeof inv.amount === 'string' ? parseFloat(inv.amount as string) : (inv.amount as number),
          currency: inv.currency,
          invoiceId: inv.id,
          invoiceNumber: inv.invoiceNumber,
          createdAt: inv.paymentDate || inv.createdAt || new Date().toISOString(),
        }))
      } catch {
        return []
      }
    }),
  )
  return perClient
    .flat()
    .filter((n) => !!n.createdAt)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit)
}

function detectClientUpdates(clients: Client[], snapshot: Record<string, string>) {
  const nextSnapshot = { ...snapshot }
  const updates: NotificationItem[] = []
  const now = new Date().toISOString()

  clients.forEach((c) => {
    const signature = [
      c.contactEmail,
      c.billingTaxId,
      c.billingEmail,
      c.billingPec,
      c.billingSdiCode,
      c.billingAddressLine1,
      c.billingZip,
      c.billingCity,
      c.billingProvince,
      c.billingCountry,
    ]
      .map((v) => v || '')
      .join('|')

    const prev = snapshot[c.id]
    if (prev && prev !== signature) {
      updates.push({
        id: `client-update-${c.id}-${Date.now()}`,
        kind: 'CLIENT_UPDATE',
        clientId: c.id,
        clientName: c.companyName,
        createdAt: now,
        message: 'Dati contatto/fatturazione aggiornati',
      })
    }
    nextSnapshot[c.id] = signature
  })

  return { updates, snapshot: nextSnapshot }
}

function dedupeById(list: NotificationItem[]) {
  const seen = new Set<string>()
  const result: NotificationItem[] = []
  list.forEach((n) => {
    if (!n.id) return
    if (seen.has(n.id)) return
    seen.add(n.id)
    result.push(n)
  })
  return result
}
