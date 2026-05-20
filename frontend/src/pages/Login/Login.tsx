import { useState } from 'react';
import { loginUser } from '../../services/authService';
import { useNavigate, Link } from 'react-router-dom';
import type { LoginData } from '../../types/auth';
import AccessibilityTrigger from '../../components/AccessibilityWidget/AccessibilityTrigger';
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
    const formEl = e.currentTarget as HTMLFormElement;
    const formData = new FormData(formEl);
    const email = String(formData.get('email') || '').trim().toLowerCase();
    const password = String(formData.get('password') || '').trim();

    if (!email || !password) {
      alert('Tous les champs sont requis');
      return;
    }
    try {
      const res = await loginUser({
        email,
        password,
      });
      const { token, role } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);

      if (role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/home');
      }
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
      <AccessibilityTrigger className={styles.a11yBtn} />
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
              value={form.email}
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
              value={form.password}
              onChange={handleChange}
            />
          </div>
          <button className={styles.button} type="submit">
            Se connecter
          </button>
        </form>
        <p className={styles.footer}>
          Pas encore de compte ? <Link to="/register">S'inscrire</Link>
        </p>
      </div>
    </div>
  );
}
