import { Fragment, useEffect, useMemo, useState } from 'react'
import { Alert, Button, Col, Form, Row, Spinner, Table } from 'react-bootstrap'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import StatusBadge from '../components/StatusBadge'
import { getClients } from '../lib/api'
import type { Client, Subscription } from '../lib/api'
import logo from '@/assets/logo-superuser.svg'

type StatusFilter = 'ALL' | Subscription['status']

export default function Clients() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<StatusFilter>('ALL')
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  useEffect(() => {
    getClients()
      .then((data) => setClients(data))
      .catch((e) => setError(e?.message || 'Errore caricamento'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return clients.filter((c) => {
      const textMatch =
        !q ||
        c.companyName.toLowerCase().includes(q) ||
        c.contactEmail.toLowerCase().includes(q)
      const statusMatch =
        status === 'ALL' || c.subscriptions.some((s) => s.status === status)
      return textMatch && statusMatch
    })
  }, [clients, query, status])

  const summary = useMemo(() => {
    const total = clients.length
    const active = clients.filter((c) => c.subscriptions.some((s) => s.status === 'ACTIVE')).length
    const trialing = clients.filter((c) => c.subscriptions.some((s) => s.status === 'TRIALING')).length
    return { total, active, trialing }
  }, [clients])

  const toggle = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }))

  return (
    <>
      <Header />
      <div className="page-shell">
        <div className="container">
          <div className="page-hero mb-3">
            <div className="d-flex align-items-start justify-content-between gap-3 flex-wrap">
              <div>
                <div className="eyebrow">Superuser</div>
                <h3 className="fw-bold">Clienti e abbonamenti</h3>
                <p className="mb-0 text-secondary">
                  Panoramica aziende con filtri rapidi e focus sulle sottoscrizioni.
                </p>
              </div>
              <div className="d-flex align-items-center gap-2 flex-wrap">
                <div className="metric-pill">
                  <img src={logo} alt="Clienti" width={18} height={18} />
                  <span>Clienti</span>
                  <strong>{summary.total}</strong>
                </div>
                <div className="metric-pill">
                  <span className="text-success">●</span>
                  <span>Attivi</span>
                  <strong>{summary.active}</strong>
                </div>
                <div className="metric-pill">
                  <span className="text-primary">●</span>
                  <span>In prova</span>
                  <strong>{summary.trialing}</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="filter-card mb-3">
            <Row className="g-3 align-items-end">
              <Col md={6}>
                <Form.Group controlId="search">
                  <Form.Label className="mb-1">Ricerca</Form.Label>
                  <Form.Control
                    size="sm"
                    placeholder="Cerca per azienda o email"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4} lg={3}>
                <Form.Group controlId="status">
                  <Form.Label className="mb-1">Stato abbonamento</Form.Label>
                  <Form.Select
                    size="sm"
                    value={status}
                    onChange={(e) => setStatus(e.target.value as StatusFilter)}
                  >
                    <option value="ALL">Tutti</option>
                    <option value="ACTIVE">Attivo</option>
                    <option value="TRIALING">In prova</option>
                    <option value="PAST_DUE">In ritardo</option>
                    <option value="CANCELED">Cancellato</option>
                    <option value="EXPIRED">Terminato</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2} className="d-none d-md-flex align-items-end">
                <div className="badge-soft">Filtri rapidi</div>
              </Col>
            </Row>
          </div>

          {loading && (
            <div className="d-flex align-items-center gap-2 px-1">
              <Spinner animation="border" size="sm" />
              <span>Caricamento clienti...</span>
            </div>
          )}
          {error && <Alert variant="danger" className="px-3">{error}</Alert>}

          {!loading && !error && filtered.length === 0 && (
            <div className="table-card text-center py-4">
              <p className="mb-1 fw-semibold">Nessun risultato</p>
              <p className="text-secondary mb-0">Prova a cambiare i filtri di ricerca.</p>
            </div>
          )}

          {!loading && !error && filtered.length > 0 && (
            <div className="table-card">
              <div className="table-responsive">
                <Table hover striped className="align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Azienda</th>
                      <th>Email</th>
                      <th>Stato</th>
                      <th>Dipendenti</th>
                      <th>Creato il</th>
                      <th className="text-end">Azioni</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c) => (
                      <Fragment key={c.id}>
                        <tr>
                          <td>
                            <Button
                              size="sm"
                              variant="outline-dark"
                              className="me-2 rounded-circle"
                              onClick={() => toggle(c.id)}
                              aria-label="Espandi sottoscrizioni"
                              aria-expanded={!!expanded[c.id]}
                            >
                              {expanded[c.id] ? '-' : '+'}
                            </Button>
                            {c.companyName}
                          </td>
                          <td>{c.contactEmail}</td>
                          <td>
                            {uniqueStatuses(c.subscriptions).map((s) => (
                              <span key={s} className="me-1">
                                <StatusBadge status={s} />
                              </span>
                            ))}
                          </td>
                          <td>{c.employeeRange}</td>
                          <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                          <td className="text-end">
                            <Link to={`/clients/${c.id}`} className="btn btn-sm btn-dark rounded-pill px-3">
                              Dettagli
                            </Link>
                          </td>
                        </tr>
                        {expanded[c.id] && (
                          <tr>
                            <td colSpan={6} className="bg-body-tertiary">
                              <SubscriptionsTable subs={c.subscriptions} />
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

function uniqueStatuses(subs: Subscription[]): Subscription['status'][] {
  return Array.from(new Set(subs.map((s) => s.status)))
}

function SubscriptionsTable({ subs }: { subs: Subscription[] }) {
  if (!subs || subs.length === 0) return <em>Nessuna sottoscrizione</em>
  return (
    <Table size="sm" bordered className="mb-0 table-sm align-middle">
      <thead className="table-light">
        <tr>
          <th>Importo</th>
          <th>Valuta</th>
          <th>Frequenza</th>
          <th>Metodo</th>
          <th>Stato</th>
          <th>Inizio</th>
          <th>Prossima fatturazione</th>
        </tr>
      </thead>
      <tbody>
        {subs.map((s) => (
          <tr key={s.id}>
            <td>{(s.amount / 100).toFixed(2)}</td>
            <td>{s.currency}</td>
            <td>{s.billingCycle} / {s.contractTerm}</td>
            <td>{s.method}</td>
            <td><StatusBadge status={s.status} /></td>
            <td>{new Date(s.startsAt).toLocaleDateString()}</td>
            <td>{s.nextBillingAt ? new Date(s.nextBillingAt).toLocaleDateString() : '-'}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}
