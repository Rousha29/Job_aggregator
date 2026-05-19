import { registerUser, loginUser, createVerificationToken, verifyEmailToken } from '../services/authService.js';
import { checkPassword } from '../services/hibp.js';
import { sendVerificationEmail } from '../services/emailService.js';

export const register = async (req, res) => {
  try {
    const { nom, prenom, mail, password, confirmation } = req.body;

    if (!nom || !prenom || !mail || !password || !confirmation) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    if (password !== confirmation) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const isPwned = await checkPassword(password);
    if (isPwned > 0) {
      return res.status(400).json({ error: 'Password has been compromised' });
    }

    const user = await registerUser({
      email: mail,
      password,
      full_name: `${prenom} ${nom}`
    });

    const token = await createVerificationToken(user.id);
    await sendVerificationEmail(user.email, token);

    res.status(201).json({ message: 'Compte créé. Vérifiez votre email pour activer votre compte.' });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(400).json({ error: err?.message || 'Registration failed' });
  }
};

export const verifyEmail = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: 'Token manquant' });
  }

  try {
    await verifyEmailToken(token);
    res.status(200).json({ message: 'Email vérifié avec succès' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { token, role } = await loginUser(req.body);
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000 // 1 jour en ms
    });
    res.status(200).json({ role });
  } catch (err) {
    if (err.message === 'Email non vérifié') {
      return res.status(403).json({ error: 'Email non vérifié. Vérifiez votre boîte mail.' });
    }
    res.status(401).json({ error: 'Invalid credentials' });
  }
};