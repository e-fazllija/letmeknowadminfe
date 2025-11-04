import { useEffect, useState } from 'react'
import { Alert, Button, Card, Col, Row, Spinner, Table } from 'react-bootstrap'
import { getClient } from '../lib/api'
import type { Client, Subscription } from '../lib/api'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header'
import StatusBadge from '../components/StatusBadge'

export default function ClientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    getClient(id)
      .then(setClient)
      .catch((e) => setError(e?.message || 'Errore caricamento'))
      .finally(() => setLoading(false))
  }, [id])

  return (
    <>
      <Header />
      <div className="container" style={{ paddingTop: 20 }}>
        <div style={{ fontSize: '0.95rem' }}>
          <div className="d-flex justify-content-between align-items-center mb-3 px-1">
            <Button variant="outline-dark" onClick={() => navigate('/clients')}>← Indietro</Button>
            <div></div>
          </div>

          {loading && (
            <div className="d-flex align-items-center gap-2 px-1">
              <Spinner animation="border" size="sm" />
              <span>Caricamento cliente…</span>
            </div>
          )}
          {error && <Alert variant="danger" className="px-3">{error}</Alert>}

          {client && (
            <>
              <h4 className="fw-semibold mb-3 px-1">{client.companyName}</h4>

              <Row className="g-3 px-1">
                <Col md={6}>
                  <Card className="shadow-sm">
                    <Card.Body>
                      <Card.Title className="h6 mb-3">Contatti</Card.Title>
                      <Row>
                        <Col sm={12} className="mb-2">
                          <strong>Email contatto:</strong> {client.contactEmail}
                        </Col>
                        <Col sm={6} className="mb-2">
                          <strong>Stato:</strong> {client.status}
                        </Col>
                        <Col sm={6} className="mb-2">
                          <strong>Dipendenti:</strong> {client.employeeRange}
                        </Col>
                        <Col sm={6} className="mb-2">
                          <strong>Creato il:</strong> {new Date(client.createdAt).toLocaleDateString()}
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="shadow-sm">
                    <Card.Body>
                      <Card.Title className="h6 mb-3">Fatturazione</Card.Title>
                      <Row>
                        <Col sm={6} className="mb-2">
                          <strong>P. IVA:</strong> {client.billingTaxId || '-'}
                        </Col>
                        <Col sm={6} className="mb-2">
                          <strong>Email fatturazione:</strong> {client.billingEmail || '-'}
                        </Col>
                        <Col sm={12} className="mb-2">
                          <strong>Località:</strong> {client.billingCity || '-'} {client.billingCountry || ''}
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Card className="mt-3 px-1 border-0">
                <Card.Body className="p-0">
                  <h6 className="mb-3">Sottoscrizioni</h6>
                  <SubscriptionsTable subs={client.subscriptions} />
                </Card.Body>
              </Card>
            </>
          )}
        </div>
      </div>
    </>
  )
}

function SubscriptionsTable({ subs }: { subs: Subscription[] }) {
  if (!subs || subs.length === 0) return <em>Nessuna sottoscrizione</em>
  return (
    <Table bordered responsive striped className="align-middle">
      <thead className="table-light">
        <tr>
          <th>ID</th>
          <th>Importo</th>
          <th>Valuta</th>
          <th>Frequenza</th>
          <th>Termini</th>
          <th>Metodo</th>
          <th>Stato</th>
          <th>Inizio</th>
          <th>Prossima fatturazione</th>
          <th>Fine prova</th>
          <th>Annullato il</th>
          <th>Creato il</th>
        </tr>
      </thead>
      <tbody>
        {subs.map((s) => (
          <tr key={s.id}>
            <td>{s.id}</td>
            <td>{(s.amount / 100).toFixed(2)}</td>
            <td>{s.currency}</td>
            <td>{s.billingCycle}</td>
            <td>{s.contractTerm}</td>
            <td>{s.method}</td>
            <td><StatusBadge status={s.status} /></td>
            <td>{new Date(s.startsAt).toLocaleDateString()}</td>
            <td>{s.nextBillingAt ? new Date(s.nextBillingAt).toLocaleDateString() : '-'}</td>
            <td>{s.trialEndsAt ? new Date(s.trialEndsAt).toLocaleDateString() : '-'}</td>
            <td>{s.canceledAt ? new Date(s.canceledAt).toLocaleDateString() : '-'}</td>
            <td>{new Date(s.createdAt).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}
