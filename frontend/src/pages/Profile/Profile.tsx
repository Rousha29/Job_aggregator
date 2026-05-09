import { useEffect, useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import styles from './profile.module.css';
import API, { updateProfile } from '../../services/authService';
import BurgerMenu from '../../components/BurgerMenu/BurgerMenu';

type User = {
  id: string;
  email: string;
  full_name: string;
};

export default function Profile() {
      const { theme, toggleTheme } = useTheme();
      const [activeView, setActiveView] = useState<'view' | 'edit' | 'favorites'>('view');
      const [isSettingsOpen, setIsSettingsOpen] = useState(false);
      const [user, setUser] = useState<User | null>(null);

      // form modif profil
      const [formData, setFormData] = useState({
            prenom: '',
            nom: '',
            email: '',
            password: '',
            confirmPassword: ''
      });
      const [message, setMessage] = useState({ type: '', text: '' });

      // message succés ou d'erreur effacer apres 3sec
      useEffect(() => {
            if (message.text) {
                  const timer = setTimeout(() => {
                        setMessage({ type: '', text: '' });
                  }, 3000);
                  return () => clearTimeout(timer);
            }
      }, [message.text]);

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
}, []);

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
};

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

                  <div className={styles.tripleLayout}>
                        {/* Bloc Profil */}
                        <div className={`${styles.card} ${activeView === 'view' ? styles.activeCard : ''}`}>
                              <button
                                    className={`${styles.tabLink} ${activeView === 'view' ? styles.activeTab : ''}`}
                                    onClick={() => setActiveView('view')}
                              >
                                    Profil
                              </button>
                              {activeView === 'view' && (
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
                              )}
                        </div>

                        {/* Bloc Modifier le profil */}
                        <div className={`${styles.card} ${activeView === 'edit' ? styles.activeCard : ''}`}>
                              <button
                                    className={`${styles.tabLink} ${activeView === 'edit' ? styles.activeTab : ''}`}
                                    onClick={() => setActiveView('edit')}
                              >
                                    Modifier le profil
                              </button>
                              {activeView === 'edit' && (
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
                              )}
                        </div>

                        {/* Bloc Mes favoris */}
                        <div className={`${styles.card} ${activeView === 'favorites' ? styles.activeCard : ''}`}>
                              <button
                                    className={`${styles.tabLink} ${activeView === 'favorites' ? styles.activeTab : ''}`}
                                    onClick={() => setActiveView('favorites')}
                              >
                                    Mes favoris
                              </button>
                              {activeView === 'favorites' && (
                                    <div className={styles.cardContent}>
                                          <div className={styles.favoritesList}>
                                                <p className={styles.emptyMessage}>Vous n'avez pas encore de favoris.</p>
                                          </div>
                                    </div>
                              )}
                        </div>
                  </div>
            </div>
      );
}
