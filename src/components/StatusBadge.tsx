import type { Subscription } from '../lib/api'

export default function StatusBadge({ status }: { status: Subscription['status'] }) {
  const variant =
    status === 'ACTIVE' ? 'success' :
    status === 'TRIALING' ? 'primary' :
    status === 'PAST_DUE' ? 'warning' :
    'secondary'

  const label =
    status === 'ACTIVE' ? 'ACTIVE' :
    status === 'TRIALING' ? 'TRIALING' :
    status === 'PAST_DUE' ? 'PAST_DUE' :
    status

  return <span className={`badge text-bg-${variant}`}>{label}</span>
}

