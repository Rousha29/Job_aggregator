INSERT INTO roles (name) VALUES ('user'), ('admin')
ON CONFLICT (name) DO NOTHING;

INSERT INTO skills (name) VALUES
  ('JavaScript'), ('TypeScript'), ('Python'), ('Java'), ('Go'),
  ('React'), ('Vue.js'), ('Angular'), ('Node.js'), ('Express'),
  ('FastAPI'), ('Spring'), ('Docker'), ('Kubernetes'), ('PostgreSQL'),
  ('MongoDB'), ('Redis'), ('AWS'), ('Git'), ('Linux')
ON CONFLICT (name) DO NOTHING;