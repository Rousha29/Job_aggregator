import { useEffect, useState } from 'react';
import { getUsers, changeUserRole, deleteUser } from '../../services/adminService';
import BurgerMenu from '../../components/BurgerMenu/BurgerMenu';
import './admin.css';

type User = {
  id: string;
  email: string;
  full_name: string;
  created_at: string;
  role: string;
};

function AdminUsers() {
  const [users, setUsers] = useState<User[]>([]);

  const load = () => getUsers().then(res => setUsers(res.data));

  useEffect(() => { load(); }, []);

  const handleRole = async (id: string, current: string) => {
    const newRole = current === 'admin' ? 'user' : 'admin';
    await changeUserRole(id, newRole);
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    await deleteUser(id);
    load();
  };

  return (
    <div className="admin-layout">
      <BurgerMenu isAdmin={true} />
      <main className="admin-main">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Date d'inscription</th>
              <th>Rôle</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.full_name}</td>
                <td>{user.email}</td>
                <td>{new Date(user.created_at).toLocaleDateString('fr-FR')}</td>
                <td>{user.role}</td>
                <td>
                  <button
                    className="btn-edit"
                    onClick={() => handleRole(user.id, user.role)}
                  >
                    {user.role === 'admin' ? 'Rétrograder' : 'Promouvoir admin'}
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(user.id)}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </main>
    </div>
  );
}

export default AdminUsers;