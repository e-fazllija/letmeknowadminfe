import type { Subscription } from '../lib/api'

export default function StatusBadge({ status }: { status: Subscription['status'] }) {
  const variant =
    status === 'ACTIVE' ? 'success' :
    status === 'PENDING_PAYMENT' ? 'warning' :
    status === 'TRIALING' ? 'primary' :
    status === 'PAST_DUE' ? 'warning' :
    'secondary'

  const label =
    status === 'ACTIVE' ? 'Attivo' :
    status === 'PENDING_PAYMENT' ? 'Pendente' :
    status === 'TRIALING' ? 'Prova' :
    status === 'PAST_DUE' ? 'Scaduto' :
    status

  return <span className={`status-pill status-pill-${variant}`}>{label}</span>
}
