-- Migration Phase 15: Aligning Schema for Lab Management & Auth

-- 1. Create USERS table (as expected by sync.ts)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  role TEXT NOT NULL,
  type TEXT DEFAULT 'university',
  is_profile_complete BOOLEAN DEFAULT FALSE,
  tenant_id TEXT NOT NULL,
  firebase_uid TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Create STAFF table (as expected by staff-login.ts and staff-sync.ts)
CREATE TABLE IF NOT EXISTS staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT,
  role TEXT NOT NULL,
  tenant_id TEXT NOT NULL DEFAULT gen_random_uuid(),
  avatar TEXT,
  employee_id TEXT,
  firebase_uid TEXT UNIQUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Align PRINT_ORDERS table
-- The existing table is missing tenant_id and stl_file_id (if we use the STL system)
-- For now, let's just add the missing columns used in the code
ALTER TABLE print_orders ADD COLUMN IF NOT EXISTS tenant_id TEXT;
ALTER TABLE print_orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT NOW();
ALTER TABLE print_orders ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- 4. Align SLOT_BOOKINGS table
ALTER TABLE slot_bookings ADD COLUMN IF NOT EXISTS tenant_id TEXT;
ALTER TABLE slot_bookings ADD COLUMN IF NOT EXISTS request_date TIMESTAMP DEFAULT NOW();

-- 5. Create other missing tables from schema.sql if they don't exist
CREATE TABLE IF NOT EXISTS stl_files (
  id UUID PRIMARY KEY,
  tenant_id TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  volume NUMERIC,
  weight NUMERIC,
  price NUMERIC,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS print_order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES print_orders(id) ON DELETE CASCADE,
  status TEXT,
  notes TEXT,
  changed_by UUID, -- Can be User or Staff ID
  changed_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title TEXT,
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP DEFAULT NOW()
);
