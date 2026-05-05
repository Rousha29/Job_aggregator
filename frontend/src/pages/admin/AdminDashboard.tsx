import { Link } from 'react-router-dom'
import './admin.css'

function AdminDashboard() {
  return (
    <div className="admin-layout">

      <aside className="admin-sidebar">
        <h2>Admin</h2>
        <nav>
          <Link to="/admin">Dashboard</Link>
          <Link to="/admin/offers">Gestion des offres</Link>
          <Link to="/admin/users">Gestion des utilisateurs</Link>
        </nav>
      </aside>

      <main className="admin-main">
        <div className="admin-stats">
          <div className="stat-card">
            <span className="stat-number">—</span>
            <span className="stat-label">Offres ingérées</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">—</span>
            <span className="stat-label">Utilisateurs</span>
          </div>
        </div>

        <div className="ingestion-card">
          <p>Dernière ingestion : <strong>—</strong></p>
          <button className="btn-ingest">Lancer l'ingestion</button>
        </div>
      </main>

    </div>
  )
}

export default AdminDashboard
