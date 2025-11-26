import { useEffect, useState } from 'react'
import { Alert, Button, Card, Col, Dropdown, Row, Spinner, Table } from 'react-bootstrap'
import { useNavigate, useParams } from 'react-router-dom'
import Header from '../components/Header'
import StatusBadge from '../components/StatusBadge'
import { getClient, getClientInvoices } from '../lib/api'
import { formatAmount, formatContractTerm, formatEmployeeRange, formatPaymentMethod, formatPaymentStatus, resolveSubscriptionMethod } from '../lib/formatters'
import type { Client, Invoice, Subscription } from '../lib/api'

export default function ClientDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loadingInvoices, setLoadingInvoices] = useState(true)
  const [invoiceError, setInvoiceError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    setError(null)
    getClient(id)
      .then(setClient)
      .catch((e) => setError(e?.message || 'Errore caricamento'))
      .finally(() => setLoading(false))
  }, [id])

  useEffect(() => {
    if (!id) return
    setInvoiceError(null)
    setLoadingInvoices(true)
    getClientInvoices(id)
      .then(setInvoices)
      .catch((e) => setInvoiceError(e?.message || 'Errore fatture'))
      .finally(() => setLoadingInvoices(false))
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
                  <Dropdown align="end">
                    <Dropdown.Toggle variant="light" className="rounded-pill shadow-sm d-flex align-items-center gap-2">
                      <span>Documenti Stripe</span>
                    </Dropdown.Toggle>
                    <Dropdown.Menu className="p-0" style={{ minWidth: 320 }}>
                      <div className="px-3 py-2 border-bottom">
                        <div className="fw-semibold">Fatture e ricevute</div>
                        <div className="text-secondary small">
                          Collegate al tenant via Stripe
                        </div>
                      </div>
                      {loadingInvoices && (
                        <div className="px-3 py-2 d-flex align-items-center gap-2">
                          <Spinner animation="border" size="sm" />
                          <span className="small">Caricamento documenti...</span>
                        </div>
                      )}
                      {invoiceError && (
                        <div className="px-3 py-2 text-danger small">
                          {invoiceError}
                        </div>
                      )}
                      {!loadingInvoices && !invoiceError && invoices.length === 0 && (
                        <div className="px-3 py-2 text-secondary small">
                          Nessuna fattura o ricevuta disponibile.
                        </div>
                      )}
                      {!loadingInvoices && !invoiceError && invoices.length > 0 && (
                        <div style={{ maxHeight: 360, overflowY: 'auto' }}>
                          {invoices.map((inv) => (
                            <div key={inv.id} className="px-3 py-2 border-bottom">
                              <div className="d-flex justify-content-between align-items-center">
                                <div className="fw-semibold small">
                                  {inv.invoiceNumber || inv.stripeInvoiceId || inv.id}
                                </div>
                                <div className="text-secondary small">
                                  {new Date(inv.paymentDate || inv.createdAt).toLocaleDateString()}
                                </div>
                              </div>
                              <div className="d-flex flex-wrap align-items-center gap-2 mt-1 small">
                                <span className="badge bg-light text-dark border">
                                  {formatAmount(inv.amount as number)} {inv.currency}
                                </span>
                                {inv.invoicePdf && (
                                  <a href={inv.invoicePdf} target="_blank" rel="noreferrer" className="link-primary">
                                    PDF fattura
                                  </a>
                                )}
                                {inv.invoiceUrl && (
                                  <a href={inv.invoiceUrl} target="_blank" rel="noreferrer" className="link-primary">
                                    Pagina fattura
                                  </a>
                                )}
                                {inv.receiptUrl && (
                                  <a href={inv.receiptUrl} target="_blank" rel="noreferrer" className="link-primary">
                                    Ricevuta
                                  </a>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </Dropdown.Menu>
                  </Dropdown>
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
                        <Col sm={12}>
                          <strong>Stato cliente:</strong> {client.status}
                        </Col>
                        <Col sm={12}>
                          <strong>Dipendenti:</strong> {formatEmployeeRange(client.employeeRange)}
                        </Col>
                        <Col sm={12}>
                          <strong>Creato il:</strong> {new Date(client.createdAt).toLocaleDateString()}
                        </Col>
                        <Col sm={12}>
                          <strong>ID cliente:</strong> {client.id}
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="info-card h-100">
                    <Card.Body>
                      <Card.Title className="h6 mb-3">Fatturazione</Card.Title>
                      <Row className="gy-2 gx-3">
                        <Col sm={12}>
                          <strong>P. IVA:</strong> {client.billingTaxId || '-'}
                        </Col>
                        <Col sm={12}>
                          <strong>Email fatturazione:</strong> {client.billingEmail || '-'}
                        </Col>
                        <Col sm={12}>
                          <strong>Indirizzo:</strong> {client.billingAddressLine1 || '-'}
                        </Col>
                        <Col sm={12}>
                          <strong>Paese:</strong> {client.billingCountry || '-'}
                        </Col>
                        <Col sm={6}>
                          <strong>PEC:</strong> {client.billingPec || '-'}
                        </Col>
                        <Col sm={6}>
                          <strong>Codice SDI:</strong> {client.billingSdiCode || '-'}
                        </Col>
                        <Col sm={4}>
                          <strong>CAP:</strong> {client.billingZip || '-'}
                        </Col>
                        <Col sm={4}>
                          <strong>Citta:</strong> {client.billingCity || '-'}
                        </Col>
                        <Col sm={4}>
                          <strong>Provincia:</strong> {client.billingProvince || '-'}
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

              <Card className="table-card mt-3 border-0">
                <Card.Body className="p-0">
                  <div className="d-flex align-items-center justify-content-between px-3 pt-3">
                    <div>
                      <div className="eyebrow mb-1">Fatture e ricevute</div>
                      <h6 className="mb-0">Documenti Stripe per questo tenant</h6>
                    </div>
                    {loadingInvoices && (
                      <div className="d-flex align-items-center gap-2 px-1">
                        <Spinner animation="border" size="sm" />
                        <span className="small">Aggiornamento...</span>
                      </div>
                    )}
                  </div>
                  {invoiceError && (
                    <div className="px-3 py-2 text-danger small">{invoiceError}</div>
                  )}
                  {!invoiceError && invoices.length === 0 && !loadingInvoices && (
                    <div className="px-3 py-2 text-secondary small">
                      Nessun documento trovato per questo tenant.
                    </div>
                  )}
                  {invoices.length > 0 && (
                    <div className="table-responsive p-3">
                      <InvoicesTable invoices={invoices} />
                    </div>
                  )}
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
          <th>Contratto</th>
          <th>Metodo</th>
          <th>Stato</th>
          <th>Inizio Contratto</th>
          <th>Fine contratto</th>
          <th>Creato il</th>
        </tr>
      </thead>
      <tbody>
        {subs.map((s) => (
          <tr key={s.id}>
            <td>{s.id}</td>
            <td>{formatAmount(s.amount)}</td>
            <td>{s.currency}</td>
            <td>{formatContractTerm(s.contractTerm)}</td>
            <td>{formatPaymentMethod(resolveSubscriptionMethod(s))}</td>
            <td><StatusBadge status={s.status} /></td>
            <td>{new Date(s.startsAt).toLocaleDateString()}</td>
            <td>{s.endsAt ? new Date(s.endsAt).toLocaleDateString() : '-'}</td>
            <td>{new Date(s.createdAt).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

function InvoicesTable({ invoices }: { invoices: Invoice[] }) {
  return (
    <Table bordered responsive striped className="align-middle mb-0">
      <thead className="table-light">
        <tr>
          <th>Numero</th>
          <th>Importo</th>
          <th>Stato</th>
          <th>Data pagamento</th>
          <th>Link</th>
        </tr>
      </thead>
      <tbody>
        {invoices.map((inv) => (
          <tr key={inv.id}>
            <td>{inv.invoiceNumber || inv.stripeInvoiceId || inv.id}</td>
            <td>{formatAmount(inv.amount as number)} {inv.currency}</td>
            <td>
              <span className="badge bg-light text-dark border">
                {formatPaymentStatus(inv.status)}
              </span>
            </td>
            <td>{new Date(inv.paymentDate || inv.createdAt).toLocaleDateString()}</td>
            <td className="d-flex flex-wrap gap-2">
              {inv.invoicePdf && (
                <a href={inv.invoicePdf} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-dark rounded-pill">
                  PDF
                </a>
              )}
              {inv.invoiceUrl && (
                <a href={inv.invoiceUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-dark rounded-pill">
                  Fattura
                </a>
              )}
              {inv.receiptUrl && (
                <a href={inv.receiptUrl} target="_blank" rel="noreferrer" className="btn btn-sm btn-outline-dark rounded-pill">
                  Ricevuta
                </a>
              )}
              {!inv.invoicePdf && !inv.invoiceUrl && !inv.receiptUrl && (
                <span className="text-secondary small">Nessun link</span>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}
