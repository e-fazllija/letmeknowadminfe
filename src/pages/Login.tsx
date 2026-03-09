import { useState } from 'react'
import { Alert, Button, Card, Col, Container, Form, Row } from 'react-bootstrap'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth'
import logo from '@/assets/Logo_Letmeknow_Scuro.png'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email.trim(), password, code.trim())
      navigate('/clients', { replace: true })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Credenziali non valide')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-hero">
      <Container>
        <Row className="justify-content-center">
          <Col lg={10}>
            <Card className="auth-shell border-0">
              <Row className="g-0 h-100">
                <Col lg={5} className="d-none d-lg-flex flex-column justify-content-between auth-hero-pane h-100">
                  <div>
                    <img src={logo} alt="LetMeKnow" className="auth-logo mb-4" />
                    <p className="mb-3">
                      Gestisci clienti e abbonamenti in un&apos;unica console sicura.
                    </p>
                    <div className="auth-bullet">
                      <span aria-hidden="true" />
                      Visibilita immediata sugli abbonamenti
                    </div>
                    <div className="auth-bullet">
                      <span aria-hidden="true" />
                      Accesso protetto con codice TOTP
                    </div> 
                    <div className="auth-bullet">
                      <span aria-hidden="true" />
                      Controllo rapido degli account aziendali
                    </div>
                  </div>
                  <div className="badge-soft mt-4">
                    <img src={logo} alt="Superuser" width={20} height={20} />
                    <span>LetMeKnow Superuser</span>
                  </div>
                </Col>
                <Col lg={7} className="p-4 p-lg-5">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <span className="badge-soft">Console</span>
                    <span className="label-muted">Login</span>
                  </div>
                  <h2 className="auth-card-title mb-1">Bentornato!</h2>
                  <p className="text-secondary mb-4">
                    Inserisci credenziali e codice TOTP per continuare.
                  </p>
                  {error && (
                    <Alert variant="danger" className="py-2">
                      {error}
                    </Alert>
                  )}
                  <Form onSubmit={onSubmit} className="text-start">
                    <Form.Group className="mb-3" controlId="email">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        placeholder="nome@azienda.it"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoFocus
                      />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="password">
                      <Form.Label>Password</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="********"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </Form.Group>
                    <Form.Group className="mb-4" controlId="code">
                      <Form.Label>Codice TOTP</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="000000"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        required
                      />
                    </Form.Group>
                    <div className="d-grid gap-2">
                      <Button type="submit" variant="dark" disabled={loading} className="py-2 rounded-pill">
                        {loading ? 'Accesso in corso...' : 'Accedi'}
                      </Button>
                    </div>
                  </Form>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  )
}
