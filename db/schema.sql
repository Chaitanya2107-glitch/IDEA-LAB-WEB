-- ================================
-- USERS TABLE
-- ================================
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  avatar TEXT,
  role TEXT NOT NULL,
  type TEXT DEFAULT 'university',
  is_profile_complete BOOLEAN DEFAULT FALSE,
  tenant_id TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ================================
-- STL FILES
-- ================================
CREATE TABLE stl_files (
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

-- ================================
-- PRINT ORDERS
-- ================================
CREATE TABLE print_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  stl_file_id UUID REFERENCES stl_files(id),
  material TEXT,
  color TEXT,
  infill INTEGER,
  cost NUMERIC,
  status TEXT DEFAULT 'queued',
  rejection_reason TEXT,
  payment_status TEXT,
  payment_method TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ================================
-- STATUS HISTORY
-- ================================
CREATE TABLE print_order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES print_orders(id) ON DELETE CASCADE,
  status TEXT,
  notes TEXT,
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMP DEFAULT NOW()
);

-- ================================
-- SLOT BOOKINGS
-- ================================
CREATE TABLE slot_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  user_id UUID REFERENCES users(id),
  user_name TEXT,
  date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  purpose TEXT,
  attendees INTEGER,
  status TEXT DEFAULT 'pending',
  request_date TIMESTAMP DEFAULT NOW()
);

-- ================================
-- BLOCKED DATES
-- ================================
CREATE TABLE blocked_dates (
  date DATE PRIMARY KEY
);

-- ================================
-- HISTORY LOGS
-- ================================
CREATE TABLE history_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID,
  actor_name TEXT,
  action TEXT,
  target_type TEXT,
  target_id TEXT,
  target_name TEXT,
  details TEXT,
  type TEXT,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- ================================
-- NOTIFICATIONS
-- ================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  title TEXT,
  message TEXT,
  read BOOLEAN DEFAULT FALSE,
  timestamp TIMESTAMP DEFAULT NOW()
);

-- ================================
-- INVENTORY
-- ================================
CREATE TABLE inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  type TEXT DEFAULT 'component', -- component, tool, consumable
  available_quantity INTEGER DEFAULT 0,
  cost_per_unit NUMERIC DEFAULT 0,
  is_rentable BOOLEAN DEFAULT FALSE,
  image_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ================================
-- MACHINE USAGE
-- ================================
CREATE TABLE machine_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id TEXT NOT NULL,
  machine_name TEXT NOT NULL,
  usage_count INTEGER DEFAULT 0,
  total_hours NUMERIC DEFAULT 0,
  last_used TIMESTAMP DEFAULT NOW(),
  status TEXT DEFAULT 'operational' -- operational, maintenance, offline
);
