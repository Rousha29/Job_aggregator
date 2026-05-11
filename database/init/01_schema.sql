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

CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  external_id VARCHAR(255) NOT NULL,
  source VARCHAR(50)
    CHECK (source IN ('welovedevs', 'local')),
  title VARCHAR(255) NOT NULL,
  company VARCHAR(255),
  contract_type VARCHAR(50)
    CHECK (contract_type IN ('stage', 'alternance', 'CDI', 'CDD', 'Autres')),
  salary_min INTEGER CHECK (salary_min >= 0),
  salary_max INTEGER CHECK (salary_max >= salary_min),
  remote BOOLEAN DEFAULT false,
  duration_months INTEGER,
  level VARCHAR(50)
    CHECK (level IN ('junior', 'mid', 'senior')),
  location VARCHAR(255),
  description TEXT,
  summary_ai TEXT,
  source_url TEXT,
  is_visible BOOLEAN DEFAULT true,
  fetched_at TIMESTAMP DEFAULT NOW(),
  UNIQUE (external_id, source)
);

CREATE TABLE favorites (
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  offer_id UUID REFERENCES offers(id) ON DELETE CASCADE,
  saved_at TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY (user_id, offer_id)
);
