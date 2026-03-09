import { Dropdown, Spinner } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '@/context/useNotifications'
import { formatAmount } from '@/lib/formatters'

export default function NotificationBell() {
  const { notifications, hasUnread, loading, error, refresh } = useNotifications()
  const navigate = useNavigate()

  const handleSelect = (clientId: string) => {
    navigate(`/clients/${clientId}`)
  }

  return (
    <Dropdown
      align="end"
      autoClose="outside"
      onToggle={(isOpen) => {
        if (isOpen) refresh()
      }}
    >
      <Dropdown.Toggle
        id="notifications-toggle"
        className="btn btn-sm btn-outline-light rounded-pill d-inline-flex align-items-center position-relative header-icon-btn"
        aria-label="Notifiche"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
          <path d="M13.73 21a2 2 0 0 1-3.46 0" />
        </svg>
        {hasUnread && <span className="notif-dot" aria-hidden="true" />}
      </Dropdown.Toggle>

      <Dropdown.Menu className="notif-menu p-0">
        <div className="d-flex align-items-center justify-content-between px-3 py-2 border-bottom">
          <div>
            <div className="fw-semibold small mb-0">Notifiche</div>
            <div className="text-secondary small">Fatture e aggiornamenti cliente</div>
          </div>
          <button
            type="button"
            className="btn btn-link btn-sm text-decoration-none px-0"
            onClick={refresh}
            disabled={loading}
          >
            {loading ? <Spinner animation="border" size="sm" /> : 'Aggiorna'}
          </button>
        </div>

        {error && <div className="px-3 py-2 text-danger small">{error}</div>}
        {!error && notifications.length === 0 && !loading && (
          <div className="px-3 py-3 text-center text-secondary small">
            Nessuna nuova notifica.
          </div>
        )}
        {notifications.length > 0 && (
          <div className="notif-list">
            {notifications.map((n) => (
              <button
                key={n.id}
                type="button"
                className="notif-item text-start"
                onClick={() => handleSelect(n.clientId)}
              >
                <div className="fw-semibold">{n.clientName}</div>
                {n.kind === 'PAYMENT' && (
                  <>
                    <div className="notif-meta">
                      <span>{formatAmount(n.amount)} {n.currency}</span>
                      <span aria-hidden="true">â€¢</span>
                      <span>{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                    {n.invoiceNumber && (
                      <div className="text-muted small">Fattura {n.invoiceNumber}</div>
                    )}
                  </>
                )}
                {n.kind === 'CLIENT_UPDATE' && (
                  <div className="notif-meta">
                    <span>Dati contatto/fatturazione aggiornati</span>
                    <span aria-hidden="true">â€¢</span>
                    <span>{new Date(n.createdAt).toLocaleString()}</span>
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </Dropdown.Menu>
    </Dropdown>
  )
}

