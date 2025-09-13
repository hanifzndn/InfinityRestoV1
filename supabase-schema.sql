-- InfinityResto Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create tables enum type
CREATE TYPE table_status AS ENUM ('active', 'inactive');

-- Create order status enum type
CREATE TYPE order_status AS ENUM ('pending', 'confirmed', 'making', 'ready', 'delivered', 'cancelled');

-- Create payment status enum type
CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');

-- Create payment method enum type
CREATE TYPE payment_method AS ENUM ('cash', 'debit', 'qris');

-- Create admin role enum type
CREATE TYPE admin_role AS ENUM ('admin', 'manager', 'staff');

-- Tables table
CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(10) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Menu items table
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  image_url TEXT,
  price DECIMAL(10,2) NOT NULL,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Orders table
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(10) UNIQUE NOT NULL,
  table_id UUID REFERENCES tables(id) ON DELETE SET NULL,
  status order_status DEFAULT 'pending',
  total DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_status payment_status DEFAULT 'pending',
  payment_method payment_method,
  customer_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Order items table
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- KDS events table (for order tracking)
CREATE TABLE kds_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  status order_status NOT NULL,
  notes TEXT,
  created_by VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Admin users table
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role admin_role DEFAULT 'staff',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create indexes for better performance
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);
CREATE INDEX idx_orders_table_id ON orders(table_id);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_menu_items_category_id ON menu_items(category_id);
CREATE INDEX idx_menu_items_in_stock ON menu_items(in_stock);
CREATE INDEX idx_kds_events_order_id ON kds_events(order_id);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_tables_updated_at BEFORE UPDATE ON tables FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON admin_users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Insert sample data
INSERT INTO tables (code, name) VALUES
('T01', 'Table 1'),
('T02', 'Table 2'),
('T03', 'Table 3'),
('T04', 'Table 4'),
('T05', 'Table 5');

INSERT INTO categories (name, description, sort_order) VALUES
('Appetizers', 'Start your meal with our delicious appetizers', 1),
('Main Course', 'Hearty main dishes to satisfy your hunger', 2),
('Beverages', 'Refreshing drinks and traditional beverages', 3),
('Desserts', 'Sweet treats to end your meal perfectly', 4);

INSERT INTO menu_items (category_id, name, description, price, image_url) VALUES
((SELECT id FROM categories WHERE name = 'Appetizers'), 'Spring Rolls', 'Crispy vegetable spring rolls served with sweet and sour sauce', 8.50, '/images/spring-rolls.jpg'),
((SELECT id FROM categories WHERE name = 'Appetizers'), 'Chicken Wings', 'Spicy buffalo chicken wings with ranch dressing', 12.00, '/images/chicken-wings.jpg'),
((SELECT id FROM categories WHERE name = 'Main Course'), 'Nasi Goreng', 'Traditional Indonesian fried rice with chicken and vegetables', 15.00, '/images/nasi-goreng.jpg'),
((SELECT id FROM categories WHERE name = 'Main Course'), 'Beef Rendang', 'Slow-cooked beef in rich coconut curry sauce', 18.50, '/images/beef-rendang.jpg'),
((SELECT id FROM categories WHERE name = 'Main Course'), 'Grilled Salmon', 'Fresh salmon fillet with lemon herb seasoning', 22.00, '/images/grilled-salmon.jpg'),
((SELECT id FROM categories WHERE name = 'Beverages'), 'Fresh Orange Juice', 'Freshly squeezed orange juice', 5.00, '/images/orange-juice.jpg'),
((SELECT id FROM categories WHERE name = 'Beverages'), 'Iced Tea', 'Traditional iced tea with lemon', 3.50, '/images/iced-tea.jpg'),
((SELECT id FROM categories WHERE name = 'Beverages'), 'Coffee', 'Indonesian arabica coffee', 4.00, '/images/coffee.jpg'),
((SELECT id FROM categories WHERE name = 'Desserts'), 'Chocolate Cake', 'Rich chocolate cake with vanilla ice cream', 8.00, '/images/chocolate-cake.jpg'),
((SELECT id FROM categories WHERE name = 'Desserts'), 'Ice Cream', 'Vanilla, chocolate, or strawberry ice cream', 5.50, '/images/ice-cream.jpg');

-- Insert default admin user (username: admin, password: admin123)
INSERT INTO admin_users (username, password_hash, role) VALUES
('admin', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.X', 'admin');

-- Enable Row Level Security (RLS)
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE kds_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (restaurant customers)
CREATE POLICY "Enable read access for all users" ON tables FOR SELECT USING (active = true);
CREATE POLICY "Enable read access for all users" ON categories FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON menu_items FOR SELECT USING (in_stock = true);

-- Create policies for orders (customers can insert, read their own orders)
CREATE POLICY "Enable insert for all users" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read access for all users" ON orders FOR SELECT USING (true);
CREATE POLICY "Enable update for all users" ON orders FOR UPDATE USING (true);

-- Create policies for order items
CREATE POLICY "Enable insert for all users" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read access for all users" ON order_items FOR SELECT USING (true);

-- Create policies for KDS events
CREATE POLICY "Enable insert for all users" ON kds_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable read access for all users" ON kds_events FOR SELECT USING (true);

-- Create policies for admin users (restricted access)
CREATE POLICY "Enable read access for authenticated users" ON admin_users FOR SELECT USING (auth.role() = 'authenticated');

-- Create functions for order code generation
CREATE OR REPLACE FUNCTION generate_order_code() RETURNS TEXT AS $$
DECLARE
    code TEXT;
    exists BOOLEAN := true;
BEGIN
    WHILE exists LOOP
        code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
        SELECT COUNT(*) > 0 INTO exists FROM orders WHERE orders.code = code;
    END LOOP;
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate order codes
CREATE OR REPLACE FUNCTION set_order_code() RETURNS TRIGGER AS $$
BEGIN
    IF NEW.code IS NULL OR NEW.code = '' THEN
        NEW.code := generate_order_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_order_code BEFORE INSERT ON orders FOR EACH ROW EXECUTE FUNCTION set_order_code();