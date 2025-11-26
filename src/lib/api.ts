import axios from 'axios'

export const TOKEN_KEY = 'lmw_platform_token'

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
  method?: string
  paymentMethod?: string
  payment?: { method?: string; paymentMethod?: string }
  payments?: { method?: string; paymentMethod?: string }[]
  status: 'ACTIVE' | 'TRIALING' | 'PENDING_PAYMENT' | 'PAST_DUE' | 'CANCELED' | 'EXPIRED'
  startsAt: string
  endsAt?: string
  nextBillingAt?: string
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

export const api = axios.create({
  baseURL: '/v1',
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
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || 'Errore login'
    throw new Error(msg)
  }
}

export async function me(): Promise<UserClaims> {
  try {
    const { data } = await api.get<{ user: UserClaims }>(`/platform/auth/me`)
    return data.user
  } catch (err: any) {
    const msg = err?.response?.data?.message || 'Errore autenticazione'
    throw new Error(msg)
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
  } catch (err: any) {
    const msg = err?.response?.data?.message || err?.message || 'Errore fatture'
    throw new Error(msg)
  }
}

