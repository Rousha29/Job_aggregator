import { useState } from 'react';
import { login } from '../../services/authService';
import { useNavigate, Link } from 'react-router-dom';
import type { LoginData } from '../../types/auth';
import styles from './Login.module.css';

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState<LoginData>({ email: '', password: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      alert('Tous les champs sont requis');
      return;
    }
    try {
      const res = await login(form);
      const token = res.data.token;
      localStorage.setItem('token', token);
      alert('Connecté !');
      navigate('/profile');
    } catch (err: unknown) {
      const message =
        typeof err === 'object' && err !== null && 'response' in err
          ? (err as { response?: { data?: { error?: string } } }).response?.data?.error
          : undefined;

      alert(message || 'Identifiants invalides');
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.label}>Job Aggregator</span>
          <h1 className={styles.title}>Connexion</h1>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Email</label>
            <input
              className={styles.input}
              name="email"
              type="email"
              placeholder="vous@exemple.com"
              onChange={handleChange}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.fieldLabel}>Mot de passe</label>
            <input
              className={styles.input}
              name="password"
              type="password"
              placeholder="••••••••"
              onChange={handleChange}
            />
          </div>
          <button className={styles.button} type="submit">
            Se connecter
          </button>
        </form>
        <p className={styles.footer}>
          Pas encore de compte ? <Link to="/register">S'inscrire</Link>
          <br />
          <Link to="/profile">Accès direct Profil (test)</Link>
        </p>
      </div>
    </div>
  );
}