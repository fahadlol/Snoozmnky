-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create pre_orders table
CREATE TABLE IF NOT EXISTS pre_orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  city VARCHAR(100) NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  size VARCHAR(10) NOT NULL CHECK (size IN ('S', 'M', 'L')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create admin settings table
CREATE TABLE IF NOT EXISTS admin_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key VARCHAR(100) UNIQUE NOT NULL,
  value TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on pre_orders for faster queries
CREATE INDEX IF NOT EXISTS idx_pre_orders_status ON pre_orders(status);
CREATE INDEX IF NOT EXISTS idx_pre_orders_product ON pre_orders(product_id);
CREATE INDEX IF NOT EXISTS idx_pre_orders_created ON pre_orders(created_at DESC);

-- Enable Row Level Security
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE pre_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_settings ENABLE ROW LEVEL SECURITY;

-- Policies for products (public read)
CREATE POLICY "Products are viewable by everyone" ON products
  FOR SELECT USING (true);

CREATE POLICY "Products can be managed by service role" ON products
  FOR ALL USING (true);

-- Policies for pre_orders (public insert, admin view)
CREATE POLICY "Anyone can create pre_orders" ON pre_orders
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Pre_orders are viewable by service role" ON pre_orders
  FOR SELECT USING (true);

CREATE POLICY "Pre_orders can be updated by service role" ON pre_orders
  FOR UPDATE USING (true);

-- Policies for admin_settings (service role only)
CREATE POLICY "Admin settings are viewable by service role" ON admin_settings
  FOR SELECT USING (true);

CREATE POLICY "Admin settings can be managed by service role" ON admin_settings
  FOR ALL USING (true);

-- Insert initial settings
INSERT INTO admin_settings (key, value) VALUES ('pre_orders_enabled', 'true')
ON CONFLICT (key) DO NOTHING;

