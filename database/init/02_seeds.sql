INSERT INTO roles (name) VALUES ('user'), ('admin')
ON CONFLICT (name) DO NOTHING;

-- Compte admin par défaut
INSERT INTO users (email, password_hash, full_name, role_id)
VALUES (
  'admin@jobaggregator.com',
  '$2b$10$tFkd4O2GPA0JIYGdWnIV4usOJmm20kDWIPamNpm03O0tS1BwlLWL6',
  'Admin',
  (SELECT id FROM roles WHERE name = 'admin')
)
ON CONFLICT (email) DO NOTHING;