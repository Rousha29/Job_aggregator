import { Link } from 'react-router-dom'
import './admin.css'

function AdminUsers() {
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
              <th>ID</th>
              <th>Nom Prénom</th>
              <th>E-mail</th>
              <th>Date d'inscription</th>
              <th>Rôle</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>Jean Dupont</td>
              <td>jean.dupont@example.com</td>
              <td>2024-05-15</td>
              <td>Utilisateur</td>
              <td>
                <button className="btn-edit">Modifier</button>
                <button className="btn-delete">Supprimer</button>
              </td>
            </tr>
            <tr>
              <td>2</td>
              <td>Marie Curie</td>
              <td>marie.curie@example.com</td>
              <td>2024-05-20</td>
              <td>Administrateur</td>
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

  

export default AdminUsers