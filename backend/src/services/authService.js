import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

const JWT_SECRET = process.env.JWT_SECRET || 'secret123';

//  REGISTER
export const registerUser = async ({ email, password, full_name }) => {
  try {
    // 1. Vérifier si user existe déjà
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      throw new Error('User already exists');
    }

    // 2. Hash du mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

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
        email,
        hashedPassword,
        full_name || 'User',
        roleId
      ]
    );

    return result.rows[0];

  } catch (error) {
    console.error('authService error:', error);
    throw error; // ← throw directement sans re-wrapper
  }
};

//  LOGIN
export const loginUser = async ({ email, password }) => {
  try {
    // 1. Récupérer user
    const result = await pool.query(
      `SELECT id, email, password_hash FROM users WHERE email = $1`,
      [email]
    );

    const user = result.rows[0];

    if (!user) {
      throw new Error('User not found');
    }

    // 2. Vérifier password
    const valid = await bcrypt.compare(password, user.password_hash);

    if (!valid) {
      throw new Error('Invalid password');
    }

    // 3. Générer token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return token;
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
      const hashedPassword = await bcrypt.hash(password, 10);
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
