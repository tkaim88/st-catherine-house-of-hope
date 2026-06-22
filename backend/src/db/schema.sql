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

CREATE TABLE IF NOT EXISTS sponsors (
  id BIGINT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(100),
  country VARCHAR(100),
  profile_image TEXT,
  child_id BIGINT,
  child_name VARCHAR(255),
  currency VARCHAR(20) DEFAULT 'KSH',
  monthly_amount NUMERIC(12, 2),
  notes TEXT,
  status VARCHAR(50) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sponsorship_payments (
  id BIGINT PRIMARY KEY,
  sponsor_id BIGINT,
  sponsor_name VARCHAR(255) NOT NULL,
  child_id BIGINT,
  child_name VARCHAR(255) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  currency VARCHAR(20) DEFAULT 'KSH',
  payment_method VARCHAR(100) DEFAULT 'Manual',
  payment_reference VARCHAR(255),
  payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(50) DEFAULT 'paid',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS activities (
    id BIGINT PRIMARY KEY,

    action VARCHAR(255) NOT NULL,
    details TEXT,

    actor_id BIGINT,
    actor_email VARCHAR(255),
    actor_role VARCHAR(50),

    module VARCHAR(100),
    entity_type VARCHAR(100),
    entity_id BIGINT,

    old_value JSONB,
    new_value JSONB,

    ip_address VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS donations (
  id BIGINT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  currency VARCHAR(20) DEFAULT 'KSH',
  amount NUMERIC(12, 2) NOT NULL,
  donation_type VARCHAR(100),
  payment_method VARCHAR(100),
  payment_reference VARCHAR(255),
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS volunteers (
  id BIGINT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(100),
  skills TEXT,
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
  id BIGINT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(100),
  subject VARCHAR(255),
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'unread',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS notifications (
  id BIGINT PRIMARY KEY,
  type VARCHAR(255) NOT NULL,
  recipient VARCHAR(255),
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'not sent',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS donors (
  id BIGINT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(100),
  country VARCHAR(100),
  profile_image TEXT,
  preferred_currency VARCHAR(20) DEFAULT 'KSH',
  donor_type VARCHAR(100) DEFAULT 'individual',
  notes TEXT,
  status VARCHAR(50) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sponsorship_applications (
  id BIGINT PRIMARY KEY,
  child_id BIGINT,
  child_name VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(100),
  country VARCHAR(100),
  monthly_amount NUMERIC(12, 2) NOT NULL,
  currency VARCHAR(20) DEFAULT 'KSH',
  message TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  sponsor_id BIGINT,
  approved_at TIMESTAMP,
  rejected_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS payments (
  id BIGINT PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(100) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  currency VARCHAR(20) DEFAULT 'KSH',
  payment_purpose VARCHAR(100) DEFAULT 'donation',
  payment_provider VARCHAR(100) DEFAULT 'mpesa',
  payment_mode VARCHAR(100) DEFAULT 'mock',
  payment_status VARCHAR(50) DEFAULT 'pending',
  related_child_id BIGINT,
  related_child_name VARCHAR(255),
  sponsor_id BIGINT,
  donor_id BIGINT,
  donation_type VARCHAR(100) DEFAULT 'one-time',
  message TEXT,
  checkout_request_id VARCHAR(255),
  merchant_request_id VARCHAR(255),
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS sponsorships (
  id BIGINT PRIMARY KEY,
  child_id BIGINT,
  child_name VARCHAR(255) NOT NULL,
  sponsor_id BIGINT,
  sponsor_name VARCHAR(255) NOT NULL,
  sponsor_email VARCHAR(255),
  amount NUMERIC(12, 2) NOT NULL,
  currency VARCHAR(20) DEFAULT 'KSH',
  status VARCHAR(50) DEFAULT 'active',
  start_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  end_date TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE admin_users
ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);

ALTER TABLE admin_users
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP;

ALTER TABLE admin_users
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;

ALTER TABLE admin_users
ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP;

ALTER TABLE activities
ADD COLUMN IF NOT EXISTS actor_id BIGINT;

ALTER TABLE activities
ADD COLUMN IF NOT EXISTS actor_email VARCHAR(255);

ALTER TABLE activities
ADD COLUMN IF NOT EXISTS actor_role VARCHAR(50);

ALTER TABLE activities
ADD COLUMN IF NOT EXISTS module VARCHAR(100);

ALTER TABLE activities
ADD COLUMN IF NOT EXISTS entity_type VARCHAR(100);

ALTER TABLE activities
ADD COLUMN IF NOT EXISTS entity_id BIGINT;

ALTER TABLE activities
ADD COLUMN IF NOT EXISTS old_value JSONB;

ALTER TABLE activities
ADD COLUMN IF NOT EXISTS new_value JSONB;

ALTER TABLE activities
ADD COLUMN IF NOT EXISTS ip_address VARCHAR(100);