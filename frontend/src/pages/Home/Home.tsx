import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';
import BurgerMenu from '../../components/BurgerMenu/BurgerMenu';
import FilterPanel, { type Filters } from '../../components/FilterPanel/FilterPanel';
import OfferModal from '../../components/Offermodal/OfferModal';

interface Offer {
  id: string;
  title: string;
  smallCompany?: { companyName: string; seoAlias?: string };
  companyId?: string;
  formattedPlaces?: string[];
  contractTypes?: string[];
  details?: {
    salary?: { min: number; max: number; recurrence?: string };
    remotePolicy?: { frequency: string; daysPerWeek?: number };
    requiredExperience?: number;
  };
  descriptionPreview?: string;
  publishDate?: number;
  profession?: {
    langContent?: { fr?: { displayName: string } };
  };
  skillsList?: { name: string; value: number }[];
  seoAlias?: string;
}

const PAGE_SIZE = 20;

const formatContract = (contract: string) => {
  const map: Record<string, string> = {
    permanent: 'CDI',
    internship: 'Stage',
    alternance: 'Alternance',
    freelance: 'Freelance',
    contract: 'CDD',
  };
  return map[contract] ?? contract;
};

const formatRemote = (remote: string) => {
  const map: Record<string, string> = {
    hybrid: 'Hybride',
    remote: 'Full remote',
    onsite: 'Présentiel',
  };
  return map[remote] ?? remote;
};

export default function Home() {
  const navigate = useNavigate();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [filtered, setFiltered] = useState<Offer[]>([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Filters>({ contractTypes: [], remote: [], salaryMin: null });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);
    const params = new URLSearchParams({
      page: String(page),
      size: String(PAGE_SIZE),
    });
    if (search) params.append('q', search);

    fetch(`http://localhost:4000/api/offers/jobs?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        const list = data.values ?? [];
        setOffers(list);
        setFiltered(list);
        setTotal(data.totalCount ?? 0);
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch(() => {
        setError('Impossible de charger les offres');
        setLoading(false);
      });
  }, [navigate, page, search]);

  useEffect(() => {
    setFiltered(
      offers.filter((o) => {
        const matchContract =
          filters.contractTypes.length === 0 ||
          o.contractTypes?.some((c) => filters.contractTypes.includes(c));

        const matchRemote =
          filters.remote.length === 0 ||
          filters.remote.includes(o.details?.remotePolicy?.frequency ?? '');

        const matchSalary =
          !filters.salaryMin ||
          (o.details?.salary?.min ?? 0) >= filters.salaryMin;

        return matchContract && matchRemote && matchSalary;
      })
    );
  }, [filters, offers]);

  const formatSalary = (offer: Offer) => {
    const s = offer.details?.salary;
    if (!s) return null;
    if (s.min && s.max) return `${s.min}k – ${s.max}k €`;
    if (s.min) return `À partir de ${s.min}k €`;
    return null;
  };

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '';
    return new Date(timestamp / 1000).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getCompany = (offer: Offer) =>
    offer.smallCompany?.companyName ?? offer.companyId ?? 'Entreprise';

  const getLocation = (offer: Offer) =>
    offer.formattedPlaces?.[0] ?? 'Non précisé';

  const getContract = (offer: Offer) =>
    offer.contractTypes?.[0] ?? null;

  const getPageNumbers = () => {
    const pages: (number | '...')[] = [];
    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      pages.push(0);
      if (page > 3) pages.push('...');
      for (let i = Math.max(1, page - 2); i <= Math.min(totalPages - 2, page + 2); i++) {
        pages.push(i);
      }
      if (page < totalPages - 4) pages.push('...');
      pages.push(totalPages - 1);
    }
    return pages;
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <span className={styles.logoMark}>JA</span>
            <span className={styles.logoText}>Job Aggregator</span>
          </div>
          <BurgerMenu />
        </div>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <span className={styles.heroLabel}>Propulsé par WeLoveDevs</span>
          <h1 className={styles.heroTitle}>
            Trouvez votre <em>prochaine</em> opportunité
          </h1>
          <div className={styles.searchRow}>
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
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
              />
              {search && (
                <button className={styles.clearBtn} onClick={() => { setSearch(''); setPage(0); }}>
                  ✕
                </button>
              )}
            </div>
            <FilterPanel onFiltersChange={setFilters} />
          </div>
          <p className={styles.resultCount}>
            {loading
              ? 'Chargement...'
              : `${filtered.length} offre${filtered.length > 1 ? 's' : ''} affichée${filtered.length > 1 ? 's' : ''} sur ${total} disponibles`}
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
          <>
            <div className={styles.grid}>
              {filtered.length === 0 ? (
                <div className={styles.empty}>
                  <p>Aucune offre ne correspond à votre recherche.</p>
                </div>
              ) : (
                filtered.map((offer, index) => (
                  <article key={`${offer.id}-${index}`} className={styles.card}>
                    <div className={styles.cardTop}>
                      <div className={styles.companyBadge}>
                        {getCompany(offer).charAt(0).toUpperCase()}
                      </div>
                      <div className={styles.cardMeta}>
                        <span className={styles.company}>{getCompany(offer)}</span>
                        <span className={styles.date}>{formatDate(offer.publishDate)}</span>
                      </div>
                    </div>

                    <h2 className={styles.title}>{offer.title}</h2>

                    {offer.profession?.langContent?.fr?.displayName && (
                      <span className={styles.profession}>
                        {offer.profession.langContent.fr.displayName}
                      </span>
                    )}

                    {offer.descriptionPreview && (
                      <p className={styles.description}>
                        {offer.descriptionPreview.slice(0, 120)}...
                      </p>
                    )}

                    <div className={styles.tags}>
                      {getLocation(offer) && (
                        <span className={styles.tag}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="12" height="12">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          {getLocation(offer)}
                        </span>
                      )}
                      {getContract(offer) && (
                        <span className={`${styles.tag} ${styles.tagContract}`}>
                          {formatContract(getContract(offer)!)}
                        </span>
                      )}
                      {formatSalary(offer) && (
                        <span className={`${styles.tag} ${styles.tagSalary}`}>
                          {formatSalary(offer)}
                        </span>
                      )}
                      {offer.details?.remotePolicy?.frequency && (
                        <span className={`${styles.tag} ${styles.tagRemote}`}>
                          {formatRemote(offer.details.remotePolicy.frequency)}
                        </span>
                      )}
                    </div>

                    <button
                      className={styles.cardBtn}
                      onClick={() => setSelectedOffer(offer)}
                    >
                      Voir l'offre →
                    </button>
                  </article>
                ))
              )}
            </div>

            {totalPages > 1 && (
              <div className={styles.pagination}>
                <button
                  className={styles.pageBtn}
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  ←
                </button>

                {getPageNumbers().map((p, i) =>
                  p === '...' ? (
                    <span key={`dots-${i}`} className={styles.pageDots}>…</span>
                  ) : (
                    <button
                      key={`page-${p}`}
                      className={`${styles.pageBtn} ${page === p ? styles.pageBtnActive : ''}`}
                      onClick={() => setPage(p as number)}
                    >
                      {(p as number) + 1}
                    </button>
                  )
                )}

                <button
                  className={styles.pageBtn}
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page === totalPages - 1}
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {selectedOffer && (
        <OfferModal offer={selectedOffer} onClose={() => setSelectedOffer(null)} />
      )}
    </div>
  );
}