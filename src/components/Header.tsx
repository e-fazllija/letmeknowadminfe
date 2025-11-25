import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import logo from '@/assets/logo-superuser.svg'

export default function Header() {
  const { user, logout } = useAuth()

  return (
    <header className="app-header">
      <div className="container header-bar">
        <Link to="/clients" className="brand-link">
          <div className="brand-avatar">
            <img
              src={logo}
              alt="LetMeKnow Superuser"
              width={28}
              height={28}
              style={{ display: 'block', objectFit: 'contain' }}
            />
          </div>
          <div className="lh-sm">
            <div className="brand-eyebrow">Intent</div>
            <div className="brand-title">LetMeKnow</div>
          </div>
        </Link>

        <div className="d-flex align-items-center gap-3">
          <div className="user-chip">
            <span className="user-dot" aria-hidden="true" />
            <div className="lh-sm">
              <div className="label-muted">Connesso</div>
              <div className="fw-semibold">{user?.email || 'Utente'}</div>
              <small className="text-muted text-uppercase">{user?.role || 'Role'}</small>
            </div>
          </div>
          <button className="btn btn-sm btn-dark rounded-pill px-3" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
