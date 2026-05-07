import { registerUser, loginUser } from '../services/authService.js';

export const register = async (req, res) => {
  try {
    const { nom, prenom, mail, password, confirmation } = req.body;

    // 1. validation basique
    if (!nom || !prenom || !mail || !password || !confirmation) {
      return res.status(400).json({ error: 'Missing fields' });
    }

    if (password !== confirmation) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    // 2. mapping vers ton service
    const user = await registerUser({
      email: mail,
      password,
      full_name: `${prenom} ${nom}`
    });

    res.status(201).json({
      message: 'User created',
      user
    });

  } catch (err) {
    res.status(400).json({ error: err.message || 'Registration failed' });
  }
};

export const login = async (req, res) => {
  try {
    const token = await loginUser(req.body);

    res.status(200).json({ token });

    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    res.status(401).json({ error: 'Invalid credentials' });
  }
};