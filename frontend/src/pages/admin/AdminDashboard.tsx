import { useEffect, useState } from 'react';
import { getStats, triggerIngestion } from '../../services/adminService';
import BurgerMenu from '../../components/BurgerMenu/BurgerMenu';
import './admin.css';

type Stats = {
  offers: number;
  users: number;
  last_ingestion: string | null;
};

function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getStats().then(res => setStats(res.data));
  }, []);

  const handleIngestion = async () => {
    setLoading(true);
    setMessage('');
    try {
      const res = await triggerIngestion();
      setMessage(`✅ Ingestion terminée : ${res.data.welovedevs?.synced ?? 0} offres WeLoveDevs`);
      const updated = await getStats();
      setStats(updated.data);
    } catch {
      setMessage('❌ Erreur lors de l\'ingestion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-layout">
      <BurgerMenu isAdmin={true} />
      <main className="admin-main">
        <div className="admin-stats">
          <div className="stat-card">
            <span className="stat-number">{stats?.offers ?? '—'}</span>
            <span className="stat-label">Offres ingérées</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{stats?.users ?? '—'}</span>
            <span className="stat-label">Utilisateurs</span>
          </div>
        </div>

        <div className="ingestion-card">
          <p>Dernière ingestion : <strong>
            {stats?.last_ingestion
              ? new Date(stats.last_ingestion).toLocaleString('fr-FR')
              : '—'}
          </strong></p>
          <button className="btn-ingest" onClick={handleIngestion} disabled={loading}>
            {loading ? 'En cours...' : "Lancer l'ingestion"}
          </button>
          {message && <p>{message}</p>}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
