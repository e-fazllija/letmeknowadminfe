import { useEffect, useMemo, useState } from 'react'
import { Alert, Button, Col, Form, Row, Spinner, Table } from 'react-bootstrap'
import { getClients } from '../lib/api'
import type { Client, Subscription } from '../lib/api'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import StatusBadge from '../components/StatusBadge'

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
      const textMatch = !q ||
        c.companyName.toLowerCase().includes(q) ||
        c.contactEmail.toLowerCase().includes(q)
      const statusMatch =
        status === 'ALL' || c.subscriptions.some((s) => s.status === status)
      return textMatch && statusMatch
    })
  }, [clients, query, status])

  const toggle = (id: string) => setExpanded((p) => ({ ...p, [id]: !p[id] }))

  return (
    <>
      <Header />
      <div className="container" style={{ paddingTop: 20 }}>
        <div style={{ fontSize: '0.95rem' }}>
          <Row className="g-2 align-items-end mb-3 px-1">
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
            <Col md={3}>
              <Form.Group controlId="status">
                <Form.Label className="mb-1">Stato abbonamento</Form.Label>
                <Form.Select size="sm" value={status} onChange={(e) => setStatus(e.target.value as StatusFilter)}>
                  <option value="ALL">Tutti</option>
                  <option value="ACTIVE">Attivo</option>
                  <option value="TRIALING">In prova</option>
                  <option value="PAST_DUE">In ritardo</option>
                  <option value="CANCELED">Cancellato</option>
                  <option value="EXPIRED">Terminato</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          {loading && (
            <div className="d-flex align-items-center gap-2 px-1">
              <Spinner animation="border" size="sm" />
              <span>Caricamento clienti…</span>
            </div>
          )}
          {error && <Alert variant="danger" className="px-3">{error}</Alert>}

          {!loading && !error && (
            <div className="table-responsive px-1">
              <Table hover striped className="align-middle">
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
                    <>
                      <tr key={c.id}>
                        <td>
                          <Button
                            size="sm"
                            variant="outline-secondary"
                            className="me-2"
                            onClick={() => toggle(c.id)}
                            aria-label="Espandi sottoscrizioni"
                          >
                            {expanded[c.id] ? '−' : '+'}
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
                          <Link to={`/clients/${c.id}`} className="btn btn-sm btn-dark">
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
                    </>
                  ))}
                </tbody>
              </Table>
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
    <Table size="sm" bordered className="mb-0 table-sm">
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
