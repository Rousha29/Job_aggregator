import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

interface Offer {
  id: string;
  title: string;
  company: string;
  location: string;
  contract_type: string;
  salary_min?: number;
  salary_max?: number;
  fetched_at: string;
  description?: string;
}

export default function Home() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [filtered, setFiltered] = useState<Offer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    fetch('http://localhost:4000/api/offers', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data.offers ?? [];
        setOffers(list);
        setFiltered(list);
        setLoading(false);
      })
      .catch(() => {
        setError('Impossible de charger les offres');
        setLoading(false);
      });
  }, [navigate]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      offers.filter(
        (o) =>
          o.title?.toLowerCase().includes(q) ||
          o.company?.toLowerCase().includes(q) ||
          o.location?.toLowerCase().includes(q)
      )
    );
  }, [search, offers]);

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return null;
    if (min && max) return `${min / 1000}k – ${max / 1000}k €`;
    if (min) return `À partir de ${min / 1000}k €`;
    return null;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>JA</span>
            <span className={styles.logoText}>Job Aggregator</span>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Déconnexion
          </button>
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <span className={styles.heroLabel}>Propulsé par WeLoveDevs</span>
          <h1 className={styles.heroTitle}>Trouvez votre <em>prochaine</em> opportunité</h1>
          <div className={styles.searchBar}>
            <svg className={styles.searchIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Titre, entreprise, ville..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className={styles.clearBtn} onClick={() => setSearch('')}>
                ✕
              </button>
            )}
          </div>
          <p className={styles.resultCount}>
            {loading ? 'Chargement...' : `${filtered.length} offre${filtered.length > 1 ? 's' : ''} disponible${filtered.length > 1 ? 's' : ''}`}
          </p>
        </section>

        {error && <p className={styles.error}>{error}</p>}

        {loading ? (
          <div className={styles.grid}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className={styles.skeleton} />
            ))}
          </div>
        ) : (
          <div className={styles.grid}>
            {filtered.length === 0 ? (
              <div className={styles.empty}>
                <p>Aucune offre ne correspond à votre recherche.</p>
              </div>
            ) : (
              filtered.map((offer) => (
                <article key={offer.id} className={styles.card}>
                  <div className={styles.cardTop}>
                    <div className={styles.companyBadge}>
                      {offer.company?.charAt(0).toUpperCase() ?? '?'}
                    </div>
                    <div className={styles.cardMeta}>
                      <span className={styles.company}>{offer.company ?? 'Entreprise'}</span>
                      <span className={styles.date}>{formatDate(offer.fetched_at)}</span>
                    </div>
                  </div>

                  <h2 className={styles.title}>{offer.title}</h2>

                  {offer.description && (
                    <p className={styles.description}>
                      {offer.description.slice(0, 120)}...
                    </p>
                  )}

                  <div className={styles.tags}>
                    {offer.location && (
                      <span className={styles.tag}>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        {offer.location}
                      </span>
                    )}
                    {offer.contract_type && (
                      <span className={`${styles.tag} ${styles.tagContract}`}>
                        {offer.contract_type}
                      </span>
                    )}
                    {formatSalary(offer.salary_min, offer.salary_max) && (
                      <span className={`${styles.tag} ${styles.tagSalary}`}>
                        {formatSalary(offer.salary_min, offer.salary_max)}
                      </span>
                    )}
                  </div>

                  <button className={styles.cardBtn}>Voir l'offre →</button>
                </article>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}