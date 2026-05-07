import { useState } from 'react';
import { useTheme } from '../../hooks/useTheme';
import styles from './profile.module.css';

export default function Profile() {
      const { theme, toggleTheme } = useTheme();
      const [activeView, setActiveView] = useState<'view' | 'edit'>('view');

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

                        <button className={styles.iconButton} aria-label="Paramètres">
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
                  </div>

                  <div className={styles.doubleLayout}>
                        {/* Bloc Profil */}
                        <div className={styles.card}>
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
                                                      <input type="text" value="John" readOnly />
                                                </div>
                                                <div className={styles.formGroup}>
                                                      <label>Nom</label>
                                                      <input type="text" value="Doe" readOnly />
                                                </div>
                                                <div className={styles.formGroup}>
                                                      <label>Email</label>
                                                      <input type="email" value="john.doe@example.com" readOnly />
                                                </div>
                                          </form>
                                    </div>
                              )}
                        </div>

                        {/* Bloc Modifier le profil */}
                        <div className={styles.card}>
                              <button
                                    className={`${styles.tabLink} ${activeView === 'edit' ? styles.activeTab : ''}`}
                                    onClick={() => setActiveView('edit')}
                              >
                                    Modifier le profil
                              </button>
                              {activeView === 'edit' && (
                                    <div className={styles.cardContent}>
                                          <form className={styles.editForm}>
                                                <div className={styles.formGroup}>
                                                      <label>Prénom</label>
                                                      <input type="text" placeholder="John" />
                                                </div>
                                                <div className={styles.formGroup}>
                                                      <label>Nom </label>
                                                      <input type="text" placeholder="Doe" />
                                                </div>
                                                <div className={styles.formGroup}>
                                                      <label>Email</label>
                                                      <input type="email" placeholder="john.doe@example.com" />
                                                </div>
                                                <button
                                                      type="submit"
                                                      className={styles.saveButton}
                                                      onClick={(e) => {
                                                            e.preventDefault();
                                                            setActiveView('view');
                                                      }}
                                                >
                                                      Enregistrer
                                                </button>
                                          </form>
                                    </div>
                              )}
                        </div>
                  </div>
            </div>
      );
}
