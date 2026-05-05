CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(255),
  role_id UUID NOT NULL REFERENCES roles(id),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE user_skills (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, skill_id)
);

CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(255) UNIQUE,
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  contract_type VARCHAR(50) CHECK (contract_type IN ('stage', 'alternance', 'CDI', 'CDD')),
  salary_min INTEGER CHECK (salary_min >= 0),
  salary_max INTEGER CHECK (salary_max >= salary_min),
  remote BOOLEAN DEFAULT false,
  duration_months INTEGER,
  level VARCHAR(50) CHECK (level IN ('junior', 'mid', 'senior')),
  location VARCHAR(255),
  description TEXT,
  summary_ai TEXT,
  source_url TEXT,
  source VARCHAR(50) DEFAULT 'welovedevs',
  is_visible BOOLEAN DEFAULT true,
  fetched_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE offer_skills (
  offer_id UUID REFERENCES offers(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  PRIMARY KEY (offer_id, skill_id)
);

CREATE TABLE favorites (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  offer_id UUID REFERENCES offers(id) ON DELETE CASCADE,
  saved_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, offer_id)
);

INSERT INTO roles (name) VALUES ('user'), ('admin')
ON CONFLICT (name) DO NOTHING;

INSERT INTO skills (name) VALUES
  ('JavaScript'), ('TypeScript'), ('Python'), ('Java'), ('Go'),
  ('React'), ('Vue.js'), ('Angular'), ('Node.js'), ('Express'),
  ('FastAPI'), ('Spring'), ('Docker'), ('Kubernetes'), ('PostgreSQL'),
  ('MongoDB'), ('Redis'), ('AWS'), ('Git'), ('Linux')
ON CONFLICT (name) DO NOTHING;