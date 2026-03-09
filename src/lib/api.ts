import axios from 'axios'

const RAW_BASE = import.meta.env.VITE_API_BASE_URL
const PROD = import.meta.env.PROD

const BASE = (RAW_BASE ?? '').replace(/\/+$/, '')

if (!BASE && PROD) {
  throw new Error(
    '[config] VITE_API_BASE_URL is required in production builds for SuperUser FE',
  )
}

const baseURL = BASE || '/v1'

export const TOKEN_KEY = 'lmw_platform_token'

function getErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError<{ message?: string }>(err)) {
    return err.response?.data?.message || err.message || fallback
  }
  if (err instanceof Error && err.message) {
    return err.message
  }
  return fallback
}

export interface UserClaims {
  sub: string
  role: string
  aud: string
  email: string
  iat: number
  exp: number
}

export interface Subscription {
  id: string
  amount: number
  currency: string
  billingCycle: string
  contractTerm: string
  method?: string | null
  paymentMethod?: string
  payment?: { method?: string; paymentMethod?: string }
  payments?: { method?: string; paymentMethod?: string }[]
  lastPayment?: { method?: string; paymentMethod?: string } | null
  status: 'ACTIVE' | 'TRIALING' | 'PENDING_PAYMENT' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED'
  startsAt: string
  endsAt?: string
  nextBillingAt?: string | null
  trialEndsAt?: string
  canceledAt?: string
  createdAt: string
}

export interface Client {
  id: string
  companyName: string
  contactEmail: string
  status: string
  employeeRange: string
  createdAt: string
  invoiceStatus?: 'DA_FATTURARE' | 'FATTURATO'
  billingTaxId?: string
  billingEmail?: string
  billingPec?: string
  billingSdiCode?: string
  billingAddressLine1?: string
  billingZip?: string
  billingCity?: string
  billingProvince?: string
  billingCountry?: string
  subscriptions: Subscription[]
}

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'

export interface Invoice {
  id: string
  amount: number | string
  currency: string
  status: PaymentStatus
  paymentDate?: string | null
  dueDate?: string | null
  createdAt: string
  stripeInvoiceId?: string | null
  stripePaymentIntentId?: string | null
  stripeChargeId?: string | null
  invoicePdf?: string | null
  invoiceUrl?: string | null
  invoiceNumber?: string | null
  receiptUrl?: string | null
}

export type NotificationKind = 'PAYMENT' | 'CLIENT_UPDATE'

export interface NotificationItem {
  id: string
  kind: NotificationKind
  clientId: string
  clientName: string
  createdAt: string
  amount?: number
  currency?: string
  invoiceId?: string | null
  invoiceNumber?: string | null
  message?: string
}

export const api = axios.create({
  baseURL,
})


api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    config.headers = config.headers ?? {}
    config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

export async function login(params: {
  email: string
  password: string
  code: string
}): Promise<string> {
  try {
    const { data } = await api.post<{ accessToken: string }>(
      '/platform/auth/login',
      params,
    )
    const token = data.accessToken
    localStorage.setItem(TOKEN_KEY, token)
    return token
  } catch (err: unknown) {
    throw new Error(getErrorMessage(err, 'Errore login'))
  }
}

export async function me(): Promise<UserClaims> {
  try {
    const { data } = await api.get<{ user: UserClaims }>(`/platform/auth/me`)
    return data.user
  } catch (err: unknown) {
    throw new Error(getErrorMessage(err, 'Errore autenticazione'))
  }
}

export async function getClients(): Promise<Client[]> {
  const { data } = await api.get<Client[]>(`/platform/clients`)
  return data
}

export async function getClient(id: string): Promise<Client> {
  const { data } = await api.get<Client>(`/platform/clients/${id}`)
  return data
}

export async function getClientSubscriptions(clientId: string): Promise<Subscription[]> {
  try {
    const { data } = await api.get<Subscription[]>(
      `/platform/clients/${clientId}/subscriptions`,
    )
    return data.map((sub) => ({
      ...sub,
      amount: typeof sub.amount === 'string' ? parseFloat(sub.amount) : sub.amount,
    }))
  } catch (err: unknown) {
    throw new Error(getErrorMessage(err, 'Errore sottoscrizioni'))
  }
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

export async function getClientInvoices(clientId: string): Promise<Invoice[]> {
  try {
    const { data } = await api.get<Invoice[]>(
      `/platform/clients/${clientId}/invoices`,
    )
    return data.map((inv) => ({
      ...inv,
      amount:
        typeof inv.amount === 'string'
          ? parseFloat(inv.amount)
          : (inv.amount as number),
    }))
  } catch (err: unknown) {
    throw new Error(getErrorMessage(err, 'Errore fatture'))
  }
}

export async function getPaymentNotifications(limit = 10): Promise<NotificationItem[]> {
  try {
    const { data } = await api.get<NotificationItem[]>(
      '/platform/payments/notifications',
      { params: { limit } },
    )
    return data.map((n) => ({
      ...n,
      amount: typeof n.amount === 'string' ? parseFloat(n.amount) : n.amount,
      kind: n.kind || 'PAYMENT',
    }))
  } catch (err: unknown) {
    throw new Error(getErrorMessage(err, 'Errore notifiche'))
  }
}

