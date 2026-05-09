import { useEffect, useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import styles from './profile.module.css';
import API, { updateProfile } from '../../services/authService';
import api from '../../services/api';
import BurgerMenu from '../../components/BurgerMenu/BurgerMenu';
import OfferModal from '../../components/Offermodal/OfferModal';

type User = {
      id: string;
      email: string;
      full_name: string;
};

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

export default function Profile() {
      const { theme, toggleTheme } = useTheme();
      const [activeView, setActiveView] = useState<'view' | 'edit' | 'favorites'>('view');
      const [isSettingsOpen, setIsSettingsOpen] = useState(false);
      const [user, setUser] = useState<User | null>(null);
      const [favorites, setFavorites] = useState<Offer[]>([]);
      const [selectedOffer, setSelectedOffer] = useState<Offer | null>(null);
      const [loadingFavs, setLoadingFavs] = useState(false);

      // form modif profil
      const [formData, setFormData] = useState({
            prenom: '',
            nom: '',
            email: '',
            password: '',
            confirmPassword: ''
      });
      const [message, setMessage] = useState({ type: '', text: '' });

      useEffect(() => {
            API.get('/users/me')
                  .then(res => {
                        setUser(res.data);
                        const [prenom, ...nomParts] = (res.data.full_name || '').split(' ');
                        setFormData({
                              prenom: prenom || '',
                              nom: nomParts.join(' ') || '',
                              email: res.data.email || '',
                              password: '',
                              confirmPassword: ''
                        });
                  })
                  .catch(() => {
                        localStorage.removeItem('token');
                        window.location.href = '/login';
                  });
            fetchFavorites();
      }, []);

      const fetchFavorites = () => {
            setLoadingFavs(true);
            api.get('/favorites')
                  .then(res => {
                        // Mappage des données DB vers le format attendu par OfferModal (similaire à Home.tsx)
                        const mappedFavs = res.data.map((row: any) => ({
                              id: row.id,
                              title: row.title,
                              smallCompany: { companyName: row.company },
                              formattedPlaces: row.location ? [row.location] : [],
                              contractTypes: [row.contract_type],
                              details: {
                                    salary: { min: row.salary_min, max: row.salary_max },
                                    remotePolicy: { frequency: row.remote ? 'remote' : 'onsite' }
                              },
                              descriptionPreview: row.description,
                              publishDate: row.fetched_at ? new Date(row.fetched_at).getTime() * 1000 : null,
                              seoAlias: row.source_url ? row.source_url.split('/').pop() : null,
                        }));
                        setFavorites(mappedFavs);
                  })
                  .catch(err => console.error('Error fetching favorites:', err))
                  .finally(() => setLoadingFavs(false));
      };

      const removeFavorite = async (e: React.MouseEvent, id: string) => {
            e.stopPropagation();
            try {
                  await api.delete(`/favorites/${id}`);
                  setFavorites(prev => prev.filter(f => String(f.id) !== String(id)));
            } catch (err) {
                  console.error('Error removing favorite:', err);
            }
      };

      const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            const { name, value } = e.target;
            setFormData(prev => ({ ...prev, [name]: value }));
      };

      // message succés ou d'erreur effacer apres 3sec
      useEffect(() => {
            if (message.text) {
                  const timer = setTimeout(() => {
                        setMessage({ type: '', text: '' });
                  }, 3000);
                  return () => clearTimeout(timer);
            }
      }, [message.text]);

      const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setMessage({ type: '', text: '' });

            if (formData.password && formData.password !== formData.confirmPassword) {
                  setMessage({ type: 'error', text: 'Les mots de passe ne correspondent pas' });
                  return;
            }

            try {
                  const res = await updateProfile({
                        prenom: formData.prenom,
                        nom: formData.nom,
                        email: formData.email,
                        password: formData.password || undefined
                  });
                  setUser(res.data);
                  setFormData(prev => ({ ...prev, password: '', confirmPassword: '' }));
                  setMessage({ type: 'success', text: 'Profil mis à jour avec succès' });
                  setActiveView('view');
            } catch (error: any) {
                  setMessage({ type: 'error', text: error.response?.data?.error || 'Erreur lors de la mise à jour' });
            }
      };

      return (
            <div className={styles.container}>
                  <div className={styles.topBar}>
                        <button
                              className={styles.iconButton}
                              onClick={toggleTheme}
                              aria-label="Changer de thème"
                        >
                              {theme === 'light' ? (
                                    <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="20"
                                          height="20"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                    >
                                          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                                    </svg>
                              ) : (
                                    <svg
                                          xmlns="http://www.w3.org/2000/svg"
                                          width="20"
                                          height="20"
                                          viewBox="0 0 24 24"
                                          fill="none"
                                          stroke="currentColor"
                                          strokeWidth="2"
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                    >
                                          <circle cx="12" cy="12" r="4" />
                                          <path d="M12 2v2" />
                                          <path d="M12 20v2" />
                                          <path d="m4.93 4.93 1.41 1.41" />
                                          <path d="m17.66 17.66 1.41 1.41" />
                                          <path d="M2 12h2" />
                                          <path d="M20 12h2" />
                                          <path d="m6.34 17.66-1.41 1.41" />
                                          <path d="m19.07 4.93-1.41 1.41" />
                                    </svg>
                              )}
                        </button>

                        <button
                              className={styles.iconButton}
                              aria-label="Paramètres"
                              onClick={() => setIsSettingsOpen(true)}
                        >
                              <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="20"
                                    height="20"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    className={styles.settingsIcon}
                              >
                                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                                    <circle cx="12" cy="12" r="3" />
                              </svg>
                        </button>
                        <BurgerMenu />
                  </div>

                  {isSettingsOpen && (
                        <div className={styles.modalOverlay} onClick={() => setIsSettingsOpen(false)}>
                              <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                                    <div className={styles.modalHeader}>
                                          <h2>Paramètres</h2>
                                          <button
                                                className={styles.closeButton}
                                                onClick={() => setIsSettingsOpen(false)}
                                          >
                                                &times;
                                          </button>
                                    </div>
                                    <div className={styles.modalBody}>
                                          <div className={styles.settingItem}>
                                                <label>Notifications</label>
                                                <input type="checkbox" defaultChecked />
                                          </div>
                                          <div className={styles.settingItem}>
                                                <label>Accessibilité</label>
                                                <button className={styles.actionButton}>Gérer</button>
                                          </div>
                                          <div className={styles.settingItem}>
                                                <label>Confidentialité</label>
                                                <button className={styles.actionButton}>Gérer</button>
                                          </div>
                                          <div className={styles.settingItem}>
                                                <label>Mentions légales</label>
                                                <button className={styles.actionButton}>Voir</button>
                                          </div>
                                    </div>
                                    <div className={styles.modalFooter}>
                                          <button className={styles.deleteButton}>
                                                Supprimer le compte
                                          </button>
                                          <button className={styles.logoutButton}>
                                                Déconnexion
                                          </button>
                                    </div>
                              </div>
                        </div>
                  )}

                  <h1 className={styles.pageTitle}>Mon profil</h1>

                  {message.text && (
                        <div className={`${styles.message} ${styles[message.type]}`}>
                              {message.text}
                        </div>
                  )}

                  <div className={styles.tabNavigation}>
                        <button 
                              className={`${styles.navItem} ${activeView === 'view' ? styles.activeNav : ''}`}
                              onClick={() => setActiveView('view')}
                        >
                              Profil
                        </button>
                        <button 
                              className={`${styles.navItem} ${activeView === 'edit' ? styles.activeNav : ''}`}
                              onClick={() => setActiveView('edit')}
                        >
                              Modifier le profil
                        </button>
                        <button 
                              className={`${styles.navItem} ${activeView === 'favorites' ? styles.activeNav : ''}`}
                              onClick={() => setActiveView('favorites')}
                        >
                              Mes favoris
                        </button>
                  </div>

                  <div className={styles.singleViewContainer}>
                        {/* Bloc Profil */}
                        {activeView === 'view' && (
                              <div className={styles.card}>
                                    <h2 className={styles.cardTitle}>Profil</h2>
                                    <div className={styles.cardContent}>
                                          <form className={styles.profileForm}>
                                                <div className={styles.formGroup}>
                                                      <label>Prénom</label>
                                                      <input type="text" value={user?.full_name?.split(' ')[0] || ''} readOnly />
                                                </div>
                                                <div className={styles.formGroup}>
                                                      <label>Nom</label>
                                                      <input type="text" value={user?.full_name?.split(' ').slice(1).join(' ') || ''} readOnly />
                                                </div>
                                                <div className={styles.formGroup}>
                                                      <label>Email</label>
                                                      <input type="email" value={user?.email || ''} readOnly />
                                                </div>
                                          </form>
                                    </div>
                              </div>
                        )}

                        {/* Bloc Modifier le profil */}
                        {activeView === 'edit' && (
                              <div className={styles.card}>
                                    <h2 className={styles.cardTitle}>Modifier le profil</h2>
                                    <div className={styles.cardContent}>
                                          <form className={styles.editForm} onSubmit={handleSubmit}>
                                                <div className={styles.formGroup}>
                                                      <label>Prénom</label>
                                                      <input
                                                            type="text"
                                                            name="prenom"
                                                            value={formData.prenom}
                                                            onChange={handleInputChange}
                                                      />
                                                </div>
                                                <div className={styles.formGroup}>
                                                      <label>Nom </label>
                                                      <input
                                                            type="text"
                                                            name="nom"
                                                            value={formData.nom}
                                                            onChange={handleInputChange}
                                                      />
                                                </div>
                                                <div className={styles.formGroup}>
                                                      <label>Email</label>
                                                      <input
                                                            type="email"
                                                            name="email"
                                                            value={formData.email}
                                                            onChange={handleInputChange}
                                                      />
                                                </div>
                                                <div className={styles.formGroup}>
                                                      <label>Nouveau mot de passe</label>
                                                      <input
                                                            type="password"
                                                            name="password"
                                                            placeholder="Entrez un nouveau mot de passe"
                                                            value={formData.password}
                                                            onChange={handleInputChange}
                                                      />
                                                </div>
                                                <div className={styles.formGroup}>
                                                      <label>Confirmer le mot de passe</label>
                                                      <input
                                                            type="password"
                                                            name="confirmPassword"
                                                            placeholder="Confirmez le mot de passe"
                                                            value={formData.confirmPassword}
                                                            onChange={handleInputChange}
                                                      />
                                                </div>
                                                <button
                                                      type="submit"
                                                      className={styles.saveButton}
                                                >
                                                      Enregistrer
                                                </button>
                                          </form>
                                    </div>
                              </div>
                        )}

                        {/* Bloc Mes favoris */}
                        {activeView === 'favorites' && (
                              <div className={styles.card}>
                                    <h2 className={styles.cardTitle}>Mes favoris</h2>
                                    <div className={styles.cardContent}>
                                          <div className={styles.favoritesList}>
                                                {loadingFavs ? (
                                                      <p className={styles.emptyMessage}>Chargement...</p>
                                                ) : favorites.length === 0 ? (
                                                      <p className={styles.emptyMessage}>Vous n'avez pas encore de favoris.</p>
                                                ) : (
                                                      favorites.map(offer => (
                                                            <div
                                                                  key={offer.id}
                                                                  className={styles.favoriteItem}
                                                                  onClick={() => setSelectedOffer(offer)}
                                                            >
                                                                  <div className={styles.favInfo}>
                                                                        <h3 className={styles.favTitle}>{offer.title}</h3>
                                                                        <p className={styles.favCompany}>{offer.smallCompany?.companyName}</p>
                                                                        <div className={styles.favTags}>
                                                                              {offer.contractTypes?.[0] && (
                                                                                    <span className={styles.favTag}>
                                                                                          {formatContract(offer.contractTypes[0])}
                                                                                    </span>
                                                                              )}
                                                                              {offer.formattedPlaces?.[0] && (
                                                                                    <span className={styles.favTag}>
                                                                                          {offer.formattedPlaces[0]}
                                                                                    </span>
                                                                              )}
                                                                        </div>
                                                                  </div>
                                                                  <button
                                                                        className={styles.removeFav}
                                                                        onClick={(e) => removeFavorite(e, offer.id)}
                                                                        title="Retirer des favoris"
                                                                  >
                                                                        <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                                                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l8.88-8.88 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                                                                        </svg>
                                                                  </button>
                                                            </div>
                                                      ))
                                                )}
                                          </div>
                                    </div>
                              </div>
                        )}
                  </div>

                  {selectedOffer && (
                        <OfferModal 
                              offer={selectedOffer} 
                              onClose={() => setSelectedOffer(null)} 
                              onFavoriteToggle={(id, isFav) => {
                                    if (!isFav) {
                                          setFavorites(prev => prev.filter(f => String(f.id) !== String(id)));
                                    }
                              }}
                        />
                  )}
            </div>
      );
}
