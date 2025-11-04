import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import logo from '@/assets/logo-superuser.svg'

export default function Header() {
  const { user, logout } = useAuth()
  return (
    <header
      className="bg-white border-bottom position-sticky top-0"
      style={{ zIndex: 1030 }}
    >
      <div
        className="container d-flex align-items-center justify-content-between"
        style={{ minHeight: 76, paddingTop: 2, paddingBottom: 2 }}
      >
        <Link to="/clients" className="d-flex align-items-center text-decoration-none">
          <img
            src={logo}
            alt="LetMeKnow Superuser"
            width={40}
            height={40}
            className="me-2"
            style={{ display: 'block', objectFit: 'contain', borderRadius: 8 }}
          />
          <span className="fw-semibold text-dark">LetMeKnow • Superuser</span>
        </Link>

        <div className="d-flex align-items-center gap-3">
          <small className="text-muted">
            {user?.email} · {user?.role}
          </small>
          <button className="btn btn-sm btn-outline-secondary" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}
