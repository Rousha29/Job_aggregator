import { hashPassword, verifyPassword } from './password.js';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET est manquant dans les variables d\'environnement');

//  REGISTER
export const registerUser = async ({ email, password, full_name }) => {
  try {
    const normalizedEmail = email?.trim().toLowerCase();

    // 1. Vérifier si user existe déjà
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [normalizedEmail]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('User already exists');
    }

    // 2. Hash du mot de passe
    const hashedPassword = await hashPassword(password);

    // 3. Récupérer le rôle "user"
    const roleResult = await pool.query(
      "SELECT id FROM roles WHERE name = 'user' LIMIT 1"
    );

    if (roleResult.rows.length === 0) {
      throw new Error('Role "user" not found in database');
    }

    const roleId = roleResult.rows[0].id;

    // 4. Insert user
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role_id)
       VALUES ($1, $2, $3, $4)
       RETURNING id, email, full_name`,
      [
        normalizedEmail,
        hashedPassword,
        full_name?.trim() || 'User',
        roleId
      ]
    );

    return result.rows[0];

  } catch (error) {
    console.error('authService error:', error);
    throw error;
  }
};

export const createVerificationToken = async (userId) => {
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

  await pool.query(
    'INSERT INTO email_verification_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)',
    [userId, token, expiresAt]
  );

  return token;
};

export const verifyEmailToken = async (token) => {
  const result = await pool.query(
    'SELECT * FROM email_verification_tokens WHERE token = $1',
    [token]
  );

  const row = result.rows[0];

  if (!row) throw new Error('Token invalide');
  if (row.used) throw new Error('Token déjà utilisé');
  if (new Date() > new Date(row.expires_at)) throw new Error('Token expiré');

  await pool.query('UPDATE email_verification_tokens SET used = true WHERE id = $1', [row.id]);
  await pool.query('UPDATE users SET email_verified = true WHERE id = $1', [row.user_id]);
};

//  LOGIN
export const loginUser = async ({ email, password }) => {
  try {
    const normalizedEmail = email?.trim().toLowerCase();

    const result = await pool.query(
      `SELECT u.id, u.email, u.password_hash, u.email_verified, r.name as role
       FROM users u
       JOIN roles r ON u.role_id = r.id
       WHERE u.email = $1`,
      [normalizedEmail]
    );

    const user = result.rows[0];
    if (!user) throw new Error('User not found');

    // Un compte dont l'email n'est pas vérifié pourrait appartenir à quelqu'un
    // qui a usurpé l'adresse d'un tiers à l'inscription. On bloque la connexion
    // tant que la propriété de l'adresse n'est pas confirmée.
    if (!user.email_verified) throw new Error('Email non vérifié');

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) throw new Error('Invalid password');

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return { token, role: user.role };
  } catch (error) {
    console.error('authService error:', error);
    throw error;
  }
};

// UPDATE
export const updateUser = async (userId, { email, password, full_name }) => {
  try {
    const updates = [];
    const values = [];
    let counter = 1;

    if (email) {
      // Check if email already taken by another user
      const existingUser = await pool.query(
        'SELECT id FROM users WHERE email = $1 AND id != $2',
        [email, userId]
      );
      if (existingUser.rows.length > 0) {
        throw new Error('Email already taken');
      }
      updates.push(`email = $${counter++}`);
      values.push(email);
    }

    if (password) {
      const hashedPassword = await hashPassword(password);
      updates.push(`password_hash = $${counter++}`);
      values.push(hashedPassword);
    }

    if (full_name) {
      updates.push(`full_name = $${counter++}`);
      values.push(full_name);
    }

    if (updates.length === 0) {
      throw new Error('No fields to update');
    }

    values.push(userId);
    const query = `
      UPDATE users
      SET ${updates.join(', ')}
      WHERE id = $${counter}
      RETURNING id, email, full_name
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  } catch (error) {
    console.error('authService error:', error);
    throw error;
  }
};
