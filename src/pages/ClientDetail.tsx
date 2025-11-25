import { useEffect, useState } from 'react'
import { Alert, Button, Card, Col, Row, Spinner, Table } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header'
import StatusBadge from '../components/StatusBadge'
import { getClient } from '../lib/api'
import type { Client, Subscription } from '../lib/api'

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

  const mainStatus = client?.subscriptions?.[0]?.status

  return (
    <>
      <Header />
      <div className="page-shell">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <Button variant="outline-dark" className="rounded-pill" onClick={() => navigate('/clients')}>
              {'<'} Indietro
            </Button>
          </div>

          {loading && (
            <div className="d-flex align-items-center gap-2 px-1">
              <Spinner animation="border" size="sm" />
              <span>Caricamento cliente...</span>
            </div>
          )}
          {error && <Alert variant="danger" className="px-3">{error}</Alert>}

          {client && (
            <>
              <div className="page-hero mb-3">
                <div className="d-flex align-items-start justify-content-between flex-wrap gap-3">
                  <div>
                    <div className="eyebrow">Scheda cliente</div>
                    <h3 className="fw-bold mb-1">{client.companyName}</h3>
                    <div className="d-flex align-items-center flex-wrap gap-2">
                      {mainStatus && <StatusBadge status={mainStatus} />}
                      <span className="badge-soft">ID {client.id}</span>
                      <span className="text-secondary small">
                        Creato il {new Date(client.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <Row className="g-3">
                <Col md={6}>
                  <Card className="info-card h-100">
                    <Card.Body>
                      <Card.Title className="h6 mb-3">Contatti</Card.Title>
                      <Row className="gy-2">
                        <Col sm={12}>
                          <strong>Email contatto:</strong> {client.contactEmail}
                        </Col>
                        <Col sm={6}>
                          <strong>Stato cliente:</strong> {client.status}
                        </Col>
                        <Col sm={6}>
                          <strong>Dipendenti:</strong> {client.employeeRange}
                        </Col>
                        <Col sm={6}>
                          <strong>Creato il:</strong> {new Date(client.createdAt).toLocaleDateString()}
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="info-card h-100">
                    <Card.Body>
                      <Card.Title className="h6 mb-3">Fatturazione</Card.Title>
                      <Row className="gy-2">
                        <Col sm={6}>
                          <strong>P. IVA:</strong> {client.billingTaxId || '-'}
                        </Col>
                        <Col sm={6}>
                          <strong>Email fatturazione:</strong> {client.billingEmail || '-'}
                        </Col>
                        <Col sm={12}>
                          <strong>Localita:</strong> {client.billingCity || '-'} {client.billingCountry || ''}
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Card className="table-card mt-3 border-0">
                <Card.Body className="p-0">
                  <div className="d-flex align-items-center justify-content-between px-3 pt-3">
                    <div>
                      <div className="eyebrow mb-1">Sottoscrizioni</div>
                      <h6 className="mb-0">Dettagli pagamenti e rinnovi</h6>
                    </div>
                  </div>
                  <div className="table-responsive p-3">
                    <SubscriptionsTable subs={client.subscriptions} />
                  </div>
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
    <Table bordered responsive striped className="align-middle mb-0">
      <thead className="table-light">
        <tr>
          <th>ID</th>
          <th>Importo</th>
          <th>Valuta</th>
          <th>Termini</th>
          <th>Metodo</th>
          <th>Stato</th>
          <th>Inizio</th>
          <th>Fine</th>
          <th>Creato il</th>
        </tr>
      </thead>
      <tbody>
        {subs.map((s) => (
          <tr key={s.id}>
            <td>{s.id}</td>
            <td>{(s.amount / 100).toFixed(2)}</td>
            <td>{s.currency}</td>
            <td>{s.contractTerm}</td>
            <td>{s.method}</td>
            <td><StatusBadge status={s.status} /></td>
            <td>{new Date(s.startsAt).toLocaleDateString()}</td>
            <td>{s.nextBillingAt ? new Date(s.nextBillingAt).toLocaleDateString() : '-'}</td>
            <td>{new Date(s.createdAt).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}
