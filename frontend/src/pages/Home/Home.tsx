import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';
import BurgerMenu from '../../components/BurgerMenu/BurgerMenu';
import FilterPanel, { type Filters } from '../../components/FilterPanel/FilterPanel';
import OfferModal from '../../components/Offermodal/OfferModal';
import ThemeToggleButton from '../../components/ThemeToggleButton/ThemeToggleButton';
import api from '../../services/api';

interface Offer {
  id: string;
  title: string;
  source?: string;
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

const CONTRACT_TYPE_MAP: Record<string, string> = {
  permanent: 'CDI',
  internship: 'stage',
  alternance: 'alternance',
  freelance: 'freelance',
  contract: 'CDD',
};

const formatContract = (contract: string) => {
  const map: Record<string, string> = {
    permanent: 'CDI',
    internship: 'Stage',
    alternance: 'Alternance',
    freelance: 'Freelance',
    contract: 'CDD',
    other: 'Autres',
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

const stripHtml = (html: string) =>
  html.replace(/<[^>]*>/g, '').replace(/\*\*/g, '').trim();

export default function Home() {
  const navigate = useNavigate();
  const [filtered, setFiltered] = useState<Offer[]>([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Filters>({ contractTypes: [], remote: [], salaryMin: null, skills: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);

  const totalPages = Math.ceil(total / PAGE_SIZE);

  const handleFiltersChange = (newFilters: Filters) => {
    setPage(0);
    setFilters(newFilters);
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    setLoading(true);

    const mappedContractTypes = filters.contractTypes.map(
      (c) => CONTRACT_TYPE_MAP[c] ?? c
    );

    api.get('/offers/jobs', {
      params: {
        page,
        size: PAGE_SIZE,
        q: search || undefined,
        contractTypes: mappedContractTypes.length > 0 ? mappedContractTypes : undefined,
        remote: filters.remote.length > 0 ? filters.remote : undefined,
        salaryMin: filters.salaryMin ?? undefined,
        skills: filters.skills.length > 0 ? filters.skills : undefined,
      }
    })
      .then((res) => {
        const data = res.data;
        const list = data.values ?? [];
        setFiltered(list);
        setTotal(data.totalCount ?? 0);
        setLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      })
      .catch((err) => {
        console.error('Error fetching jobs:', err);
        setError('Impossible de charger les offres');
        setLoading(false);
      });
  }, [navigate, page, search, filters]);

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
          <div className={styles.headerActions}>
            <ThemeToggleButton className={styles.themeToggle} />
            <BurgerMenu />
          </div>
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
            <FilterPanel onFiltersChange={handleFiltersChange} />
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
                        {offer.source === 'local' && (
                          <span className={styles.sourceBadge}>Source locale</span>
                        )}
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
                        {stripHtml(offer.descriptionPreview).slice(0, 200)}
                        {stripHtml(offer.descriptionPreview).length > 200 ? '...' : ''}
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

                    {/* {offer.skillsList && offer.skillsList.length > 0 && (
                      <div className={styles.skills}>
                        {offer.skillsList.slice(0, 4).map((s) => (
                          <span key={s.name} className={styles.skillTag}>{s.name}</span>
                        ))}
                        {offer.skillsList.length > 4 && (
                          <span className={styles.skillTag}>+{offer.skillsList.length - 4}</span>
                        )}
                      </div>
                    )} */}

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