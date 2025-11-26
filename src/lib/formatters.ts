const CONTRACT_TERM_LABELS: Record<string, string> = {
  ONE_YEAR: 'Annuale',
}

export function formatContractTerm(term?: string) {
  if (!term) return '-'
  const normalized = term.trim()
  if (!normalized) return '-'
  const mapped = CONTRACT_TERM_LABELS[normalized]
  if (mapped) return mapped
  const readable = normalized.replace(/_/g, ' ').toLowerCase()
  return readable ? readable.charAt(0).toUpperCase() + readable.slice(1) : normalized
}

export function formatAmount(amount?: number) {
  if (amount === undefined || amount === null || Number.isNaN(amount)) return '-'
  return amount.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const METHOD_LABELS: Record<string, string> = {
  CARD: 'Carta di credito',
  CREDIT_CARD: 'Carta di credito',
  BANK_TRANSFER: 'Bonifico',
  WIRE_TRANSFER: 'Bonifico',
  SEPA: 'SEPA',
  CASH: 'Contanti',
  PAYPAL: 'PayPal',
  CARTA: 'Carta',
}

export function formatPaymentMethod(method?: string) {
  if (!method) return '-'
  const normalized = method.trim()
  if (!normalized) return '-'
  const mapped = METHOD_LABELS[normalized.toUpperCase()]
  if (mapped) return mapped
  const readable = normalized.replace(/_/g, ' ').toLowerCase()
  return readable ? readable.charAt(0).toUpperCase() + readable.slice(1) : normalized
}

export function resolveSubscriptionMethod(sub: {
  method?: string
  paymentMethod?: string
  payment?: { method?: string; paymentMethod?: string }
  payments?: { method?: string; paymentMethod?: string }[]
}) {
  return (
    sub.paymentMethod ||
    sub.method ||
    sub.payment?.paymentMethod ||
    sub.payment?.method ||
    sub.payments?.find((p) => p.paymentMethod || p.method)?.paymentMethod ||
    sub.payments?.find((p) => p.paymentMethod || p.method)?.method
  )
}

export function formatEmployeeRange(range?: string) {
  if (!range) return '-'
  const match = /^DA_(\d+)_A_(\d+)$/i.exec(range)
  if (match) return `${match[1]}/${match[2]}`
  return range.replace(/_/g, ' ')
}

export function formatPaymentStatus(status?: string) {
  if (!status) return '-'
  const normalized = status.trim().toUpperCase()
  if (normalized === 'COMPLETED') return 'Pagato'
  if (normalized === 'FAILED') return 'Fallito'
  if (normalized === 'REFUNDED') return 'Rimborsato'
  if (normalized === 'PENDING') return 'In sospeso'
  const readable = normalized.replace(/_/g, ' ').toLowerCase()
  return readable ? readable.charAt(0).toUpperCase() + readable.slice(1) : status
}
