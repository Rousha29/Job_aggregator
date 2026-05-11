import { useState } from 'react';
import { registerUser } from '../../services/authService';
import { useNavigate, Link } from 'react-router-dom';
import type { RegisterData } from '../../types/auth';
import styles from './Register.module.css';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState<RegisterData>({
    nom: '',
    prenom: '',
    mail: '',
    password: '',
    confirmation: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom || !form.prenom || !form.mail || !form.password) {
      alert('Tous les champs sont requis');
      return;
    }
    if (!form.mail.includes('@')) {
      alert('Email invalide');
      return;
    }
    if (form.password.length < 8) {
      alert('Mot de passe trop court');
      return;
    }
    if (form.password !== form.confirmation) {
      alert('Les mots de passe ne correspondent pas');
      return;
    }
    try {
      await registerUser(form);
      alert('Compte créé !');
      navigate('/login');
    } catch (err: unknown) {
      const responseError =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;

      alert(responseError || "Erreur lors de l'inscription");
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.label}>Job Aggregator</span>
          <h1 className={styles.title}>Créer un compte</h1>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.row}>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Nom</label>
              <input
                className={styles.input}
                name="nom"
                placeholder="Dupont"
                onChange={handleChange}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.fieldLabel}>Prénom</label>
              <input
                className={styles.input}
                name="prenom"
                placeholder="Jean"
                onChange={handleChange}
              />
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Email</label>
            <input
              className={styles.input}
              name="mail"
              type="email"
              placeholder="vous@exemple.com"
              onChange={handleChange}
            />
          </div>
          <div className={styles.divider} />
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Mot de passe</label>
            <input
              className={styles.input}
              name="password"
              type="password"
              placeholder="••••••••"
              onChange={handleChange}
            />
            <span className={styles.hint}>8 caractères minimum</span>
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Confirmation</label>
            <input
              className={styles.input}
              name="confirmation"
              type="password"
              placeholder="••••••••"
              onChange={handleChange}
            />
          </div>
          <button className={styles.button} type="submit">
            Créer un compte
          </button>
        </form>
        <p className={styles.footer}>
          Déjà un compte ? <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}