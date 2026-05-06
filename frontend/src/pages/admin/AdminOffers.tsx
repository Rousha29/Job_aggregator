import { Link } from 'react-router-dom'
import './admin.css'

function AdminOffers() {
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
        <table className="admin-table">
          <thead>
            <tr>
              <th>Intitulé de poste</th>
              <th>Entreprise</th>
              <th>Date de publication</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Développeur Frontend</td>
              <td>TechCorp</td>
              <td>2024-06-01</td>
              <td>Publié</td>
              <td>
                <button className="btn-edit">Modifier</button>
                <button className="btn-delete">Supprimer</button>
              </td>
            </tr>
            <tr>
              <td>Data Scientist</td>
              <td>DataSolutions</td>
              <td>2024-05-28</td>
              <td>Brouillon</td>
              <td>
                <button className="btn-edit">Modifier</button>
                <button className="btn-delete">Supprimer</button>
              </td>
            </tr>
          </tbody>
        </table>
      </main>

    </div>
  )
}

  

export default AdminOffers