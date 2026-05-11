import bcrypt from 'bcrypt';
import pool from '../config/db.js';

const DEFAULT_ADMIN_EMAIL = 'admin@jobaggregator.com';
const DEFAULT_ADMIN_PASSWORD = 'Admin123!';
const DEFAULT_ADMIN_FULL_NAME = 'Admin';

export const ensureDefaultAdminAccount = async () => {
      const roleResult = await pool.query(
            "SELECT id FROM roles WHERE name = 'admin' LIMIT 1"
      );

      if (roleResult.rows.length === 0) {
            throw new Error('Role "admin" not found in database');
      }

      const adminRoleId = roleResult.rows[0].id;
      const passwordHash = await bcrypt.hash(DEFAULT_ADMIN_PASSWORD, 10);

      const existingUserResult = await pool.query(
            'SELECT id, password_hash FROM users WHERE email = $1 LIMIT 1',
            [DEFAULT_ADMIN_EMAIL]
      );

      if (existingUserResult.rows.length === 0) {
            await pool.query(
                  `INSERT INTO users (email, password_hash, full_name, role_id)
       VALUES ($1, $2, $3, $4)`,
                  [DEFAULT_ADMIN_EMAIL, passwordHash, DEFAULT_ADMIN_FULL_NAME, adminRoleId]
            );
            return;
      }

      const existingUser = existingUserResult.rows[0];
      const passwordMatches = await bcrypt.compare(
            DEFAULT_ADMIN_PASSWORD,
            existingUser.password_hash
      );

      if (!passwordMatches) {
            await pool.query(
                  `UPDATE users
       SET password_hash = $1,
           full_name = $2,
           role_id = $3
       WHERE id = $4`,
                  [passwordHash, DEFAULT_ADMIN_FULL_NAME, adminRoleId, existingUser.id]
            );
      }
};