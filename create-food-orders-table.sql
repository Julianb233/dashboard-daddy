-- Food Orders Table for Personal Concierge System
-- Add to your Supabase database

CREATE TABLE IF NOT EXISTS food_orders (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(255) UNIQUE NOT NULL,
    platform VARCHAR(50) NOT NULL, -- 'doordash', 'restaurant_direct', 'uber_eats', etc.
    restaurant_name VARCHAR(255) NOT NULL,
    restaurant_phone VARCHAR(20),
    restaurant_address TEXT,
    items JSONB NOT NULL, -- Array of order items with details
    total_amount DECIMAL(10,2),
    currency VARCHAR(3) DEFAULT 'USD',
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'confirmed', 'preparing', 'delivered', 'cancelled'
    ordered_at TIMESTAMP DEFAULT NOW(),
    estimated_delivery TIMESTAMP,
    actual_delivery TIMESTAMP,
    delivery_address TEXT,
    delivery_instructions TEXT,
    user_preferences JSONB, -- dietary preferences, favorites, etc.
    metadata JSONB, -- platform-specific data
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create restaurant favorites table
CREATE TABLE IF NOT EXISTS restaurant_favorites (
    id SERIAL PRIMARY KEY,
    restaurant_name VARCHAR(255) NOT NULL,
    restaurant_phone VARCHAR(20),
    cuisine_type VARCHAR(100),
    favorite_items JSONB, -- frequently ordered items
    average_rating DECIMAL(3,2),
    notes TEXT,
    order_count INTEGER DEFAULT 0,
    last_ordered TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(restaurant_name, restaurant_phone)
);

-- Create restaurant call logs table for Vapi integration
CREATE TABLE IF NOT EXISTS restaurant_call_logs (
    id SERIAL PRIMARY KEY,
    restaurant_name VARCHAR(255) NOT NULL,
    restaurant_phone VARCHAR(20) NOT NULL,
    call_purpose VARCHAR(100) NOT NULL, -- 'hours', 'reservation', 'wait_time', 'menu'
    call_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'connected', 'completed', 'failed'
    vapi_call_id VARCHAR(255),
    call_duration_seconds INTEGER,
    call_summary TEXT,
    extracted_info JSONB, -- structured data from call
    audio_url TEXT,
    transcript TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create user preferences table
CREATE TABLE IF NOT EXISTS user_food_preferences (
    id SERIAL PRIMARY KEY,
    preference_type VARCHAR(100) NOT NULL, -- 'dietary', 'cuisine', 'time_of_day', 'weather'
    preference_value VARCHAR(255) NOT NULL,
    preference_data JSONB,
    priority INTEGER DEFAULT 1, -- 1-10, higher = more important
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_food_orders_platform ON food_orders(platform);
CREATE INDEX IF NOT EXISTS idx_food_orders_restaurant ON food_orders(restaurant_name);
CREATE INDEX IF NOT EXISTS idx_food_orders_status ON food_orders(status);
CREATE INDEX IF NOT EXISTS idx_food_orders_ordered_at ON food_orders(ordered_at);
CREATE INDEX IF NOT EXISTS idx_restaurant_favorites_name ON restaurant_favorites(restaurant_name);
CREATE INDEX IF NOT EXISTS idx_call_logs_restaurant ON restaurant_call_logs(restaurant_name);
CREATE INDEX IF NOT EXISTS idx_call_logs_purpose ON restaurant_call_logs(call_purpose);
CREATE INDEX IF NOT EXISTS idx_user_preferences_type ON user_food_preferences(preference_type);

-- Insert some sample data
INSERT INTO user_food_preferences (preference_type, preference_value, preference_data, priority)
VALUES
    ('dietary', 'no_shellfish', '{"allergens": ["shellfish"], "severity": "high"}', 10),
    ('cuisine', 'italian', '{"preferred_times": ["dinner"], "mood": ["comfort"]}', 7),
    ('cuisine', 'sushi', '{"preferred_times": ["lunch", "dinner"], "mood": ["fresh", "light"]}', 8),
    ('time_of_day', 'breakfast', '{"preferred_cuisines": ["american", "cafe"], "max_wait": 20}', 6),
    ('weather', 'cold', '{"preferred_types": ["soup", "hot_drinks", "comfort_food"]}', 5),
    ('weather', 'hot', '{"preferred_types": ["salads", "cold_drinks", "light_meals"]}', 5)
ON CONFLICT DO NOTHING;

-- Insert sample favorite restaurants
INSERT INTO restaurant_favorites (restaurant_name, restaurant_phone, cuisine_type, favorite_items, average_rating, order_count)
VALUES
    ('Tony''s Pizza', '+1-555-0123', 'Italian', '[{"item": "Margherita Pizza", "customizations": "extra basil"}, {"item": "Caesar Salad", "size": "large"}]', 4.5, 15),
    ('Sushi Zen', '+1-555-0124', 'Japanese', '[{"item": "Dragon Roll"}, {"item": "Miso Soup"}, {"item": "Edamame"}]', 4.8, 8),
    ('Green Garden Cafe', '+1-555-0125', 'Healthy', '[{"item": "Quinoa Bowl", "protein": "chicken"}, {"item": "Green Smoothie"}]', 4.3, 12)
ON CONFLICT (restaurant_name, restaurant_phone) DO NOTHING;

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS update_food_orders_updated_at ON food_orders;
DROP TRIGGER IF EXISTS update_restaurant_favorites_updated_at ON restaurant_favorites;

-- Create triggers
CREATE TRIGGER update_food_orders_updated_at
    BEFORE UPDATE ON food_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE food_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_call_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_food_preferences ENABLE ROW LEVEL SECURITY;

-- Create basic policies (customize as needed)
CREATE POLICY "Enable all operations for authenticated users" ON food_orders FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON restaurant_favorites FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON restaurant_call_logs FOR ALL USING (true);
CREATE POLICY "Enable all operations for authenticated users" ON user_food_preferences FOR ALL USING (true);