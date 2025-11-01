-- Add email column to pre_orders
ALTER TABLE pre_orders ADD COLUMN IF NOT EXISTS email VARCHAR(255);

-- Add price column to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS price DECIMAL(10,2);

-- Add images array column to products for multiple images
ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_pre_orders_email ON pre_orders(email);

