import { registerUser, loginUser } from '../services/authService.js';

export const register = async (req, res) => {
  try {
    const { nom, prenom, mail, password, confirmation } = req.body;

    if (!nom || !prenom || !mail || !password || !confirmation) {
      return res.status(400).json({ error: 'Missing fields' });
    }
    if (password !== confirmation) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    const user = await registerUser({
      email: mail,
      password,
      full_name: `${prenom} ${nom}`
    });

    res.status(201).json({ message: 'User created', user });

<<<<<<< HEAD
  } catch (err) {
    res.status(400).json({ error: err.message || 'Registration failed' });
  }
=======
} catch (err) {
  console.error('Registration error:', err);
  console.error('Type:', typeof err);
  console.error('Message:', err?.message);
  console.error('Stack:', err?.stack);
  res.status(400).json({ error: err?.message || JSON.stringify(err) });
}
>>>>>>> feature/home
};

export const login = async (req, res) => {
  try {
    const token = await loginUser(req.body);
    res.status(200).json({ token });
<<<<<<< HEAD

    // eslint-disable-next-line no-unused-vars
  } catch (err) {
    res.status(401).json({ error: 'Invalid credentials' });
=======
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(401).json({ error: err.message });
>>>>>>> feature/home
  }
};