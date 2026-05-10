INSERT INTO roles (name) VALUES ('user'), ('admin')
ON CONFLICT (name) DO NOTHING;

INSERT INTO skills (name) VALUES
  ('JavaScript'), ('TypeScript'), ('Python'), ('Java'), ('Go'),
  ('React'), ('Vue.js'), ('Angular'), ('Node.js'), ('Express'),
  ('FastAPI'), ('Spring'), ('Docker'), ('Kubernetes'), ('PostgreSQL'),
  ('MongoDB'), ('Redis'), ('AWS'), ('Git'), ('Linux')
ON CONFLICT (name) DO NOTHING;

-- Compte admin par défaut
INSERT INTO users (email, password_hash, full_name, role_id)
VALUES (
  'admin@jobaggregator.com',
  '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uSrgHuW.k',
  'Admin',
  (SELECT id FROM roles WHERE name = 'admin')
)
ON CONFLICT (email) DO NOTHING;