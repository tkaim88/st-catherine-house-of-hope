CREATE TABLE IF NOT EXISTS admin_users (
  id BIGINT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'admin',
  status VARCHAR(50) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS children (
  id BIGINT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  age INTEGER,
  gender VARCHAR(50),
  profile_image TEXT,
  date_of_birth DATE,
  admission_date DATE,
  school VARCHAR(255),
  grade VARCHAR(100),
  education_notes TEXT,
  sponsor VARCHAR(255),
  sponsor_id BIGINT,
  medical_notes TEXT,
  allergies TEXT,
  blood_type VARCHAR(50),
  emergency_contact VARCHAR(255),
  biography TEXT,
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);