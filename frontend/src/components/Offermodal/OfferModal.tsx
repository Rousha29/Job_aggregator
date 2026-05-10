import { useEffect, useState } from 'react';
import styles from './OfferModal.module.css';
import api from '../../services/api';

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
    professionId?: string;
  };
  descriptionPreview?: string;
  description?: string;
  publishDate?: number;
  profession?: {
    langContent?: { fr?: { displayName: string } };
  };
  skillsList?: { name: string; value: number }[];
  seoAlias?: string;
}

interface OfferModalProps {
  offer: Offer;
  onClose: () => void;
  onFavoriteToggle?: (id: string, isFav: boolean) => void;
}

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

export default function OfferModal({ offer, onClose, onFavoriteToggle }: OfferModalProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [loadingFav, setLoadingFav] = useState(false);

  // Ferme avec Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  // Vérifier si déjà en favoris
  useEffect(() => {
    api.get('/favorites')
      .then(res => {
        const favs = res.data;
        setIsFavorite(favs.some((f: any) => f.id === offer.id));
      })
      .catch(err => console.error('Error checking favorites', err));
  }, [offer.id]);

  const toggleFavorite = async () => {
    setLoadingFav(true);
    try {
      if (isFavorite) {
        await api.delete(`/favorites/${offer.id}`);
        setIsFavorite(false);
        if (onFavoriteToggle) onFavoriteToggle(offer.id, false);
      } else {
        await api.post(`/favorites/${offer.id}`);
        setIsFavorite(true);
        if (onFavoriteToggle) onFavoriteToggle(offer.id, true);
      }
    } catch (err) {
      console.error('Error toggling favorite', err);
    } finally {
      setLoadingFav(false);
    }
  };

  const company = offer.smallCompany?.companyName ?? offer.companyId ?? 'Entreprise';
  const location = offer.formattedPlaces?.[0] ?? 'Non précisé';
  const contract = offer.contractTypes?.[0];
  const salary = offer.details?.salary;
  const remote = offer.details?.remotePolicy;
  const experience = offer.details?.requiredExperience;
  const profession = offer.profession?.langContent?.fr?.displayName;
  const skills = offer.skillsList ?? [];
  const wldUrl = offer.seoAlias
    ? `https://welovedevs.com/app/jobs/${offer.seoAlias}`
    : null;

  const formatDate = (timestamp?: number) => {
    if (!timestamp) return '';
    return new Date(timestamp / 1000).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.companyBadge}>
            {company.charAt(0).toUpperCase()}
          </div>
          <div className={styles.headerInfo}>
            <span className={styles.company}>{company}</span>
            {profession && <span className={styles.profession}>{profession}</span>}
          </div>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Fermer">
            ✕
          </button>
        </div>

        {/* Title */}
        <div className={styles.titleSection}>
          <h2 className={styles.title}>{offer.title}</h2>
          <p className={styles.date}>Publié le {formatDate(offer.publishDate)}</p>
        </div>

        {/* Tags */}
        <div className={styles.tags}>
          <span className={styles.tag}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="13" height="13">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {location}
          </span>
          {contract && (
            <span className={`${styles.tag} ${styles.tagContract}`}>
              {formatContract(contract)}
            </span>
          )}
          {remote && (
            <span className={`${styles.tag} ${styles.tagRemote}`}>
              {formatRemote(remote.frequency)}
              {remote.daysPerWeek ? ` · ${remote.daysPerWeek}j/sem` : ''}
            </span>
          )}
          {salary && (
            <span className={`${styles.tag} ${styles.tagSalary}`}>
              💰 {salary.min}k – {salary.max}k €
            </span>
          )}
          {experience !== undefined && experience > 0 && (
            <span className={styles.tag}>
              {experience} an{experience > 1 ? 's' : ''} d'expérience
            </span>
          )}
        </div>

        {/* Skills */}
        {skills.length > 0 && (
          <div className={styles.section}>
            <h3 className={styles.sectionTitle}>Compétences</h3>
            <div className={styles.skills}>
              {skills.map((skill) => (
                <span key={skill.name} className={styles.skill}>
                  {skill.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Description */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Description</h3>
          <div className={styles.description}>
            {(offer.descriptionPreview ?? '').split('\n').map((line, i) => (
              <p key={i}>{line}</p>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        <div className={styles.footer}>
          {wldUrl ? (
            <a
              href={wldUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.applyBtn}
            >
              Voir l'offre sur WeLoveDevs →
            </a>
          ) : (
            <button className={styles.applyBtn}>Postuler</button>
          )}

          <button 
            className={`${styles.favBtn} ${isFavorite ? styles.favBtnActive : ''}`}
            onClick={toggleFavorite}
            disabled={loadingFav}
          >
            <svg viewBox="0 0 24 24" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" width="18" height="18">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.88-8.88 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
            {isFavorite ? 'Retirer des favoris' : 'Ajouter en favoris'}
          </button>

          <button className={styles.closeFooterBtn} onClick={onClose}>
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}