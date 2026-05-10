import { useEffect, useState } from 'react';
import { getStats, triggerIngestion, importLocalJSON } from '../../services/adminService';
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
  const [localLoading, setLocalLoading] = useState(false);
  const [localMessage, setLocalMessage] = useState('');

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

  const handleLocalImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLocalLoading(true);
    setLocalMessage('');
    try {
      const text = await file.text();
      const jsonData = JSON.parse(text);

      const res = await importLocalJSON(jsonData);
      setLocalMessage(`✅ Import local terminé : ${res.data.synced} offres ingérées`);
      const updated = await getStats();
      setStats(updated.data);
    } catch (err) {
      setLocalMessage(`❌ Erreur : ${err instanceof Error ? err.message : 'Import échoué'}`);
    } finally {
      setLocalLoading(false);
      e.target.value = '';
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

        <div className="ingestion-card">
          <h3>Import JSON Local</h3>
          <label htmlFor="json-upload" className="btn-ingest">
            {localLoading ? 'Import en cours...' : 'Charger un fichier JSON'}
          </label>
          <input
            id="json-upload"
            type="file"
            accept=".json"
            onChange={handleLocalImport}
            disabled={localLoading}
            style={{ display: 'none' }}
          />
          {localMessage && <p>{localMessage}</p>}
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
