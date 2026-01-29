-- Usage & Cost Tracking Tables

-- Token usage tracking table
CREATE TABLE IF NOT EXISTS token_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  model_name VARCHAR(100) NOT NULL,
  tokens_used INTEGER NOT NULL,
  cost_per_token DECIMAL(10, 8),
  total_cost DECIMAL(10, 4),
  request_type VARCHAR(50), -- 'input', 'output', 'total'
  endpoint VARCHAR(100),
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Model costs reference table
CREATE TABLE IF NOT EXISTS model_costs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  model_name VARCHAR(100) NOT NULL UNIQUE,
  input_cost_per_token DECIMAL(10, 8),
  output_cost_per_token DECIMAL(10, 8),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_token_usage_model ON token_usage(model_name);
CREATE INDEX IF NOT EXISTS idx_token_usage_created_at ON token_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_token_usage_user_id ON token_usage(user_id);

-- Insert sample model costs (OpenAI pricing as example)
INSERT INTO model_costs (model_name, input_cost_per_token, output_cost_per_token) VALUES
('gpt-4o', 0.0000025, 0.00001),
('gpt-4o-mini', 0.00000015, 0.0000006),
('claude-3-opus', 0.000015, 0.000075),
('claude-3-sonnet', 0.000003, 0.000015),
('claude-3-haiku', 0.00000025, 0.00000125)
ON CONFLICT (model_name) DO UPDATE SET
  input_cost_per_token = EXCLUDED.input_cost_per_token,
  output_cost_per_token = EXCLUDED.output_cost_per_token,
  updated_at = NOW();

-- Insert sample usage data
INSERT INTO token_usage (model_name, tokens_used, cost_per_token, total_cost, request_type, endpoint, created_at) VALUES
('gpt-4o', 1500, 0.0000025, 0.00375, 'input', '/api/chat', NOW() - INTERVAL '1 day'),
('gpt-4o', 800, 0.00001, 0.008, 'output', '/api/chat', NOW() - INTERVAL '1 day'),
('claude-3-sonnet', 2200, 0.000003, 0.0066, 'input', '/api/agents', NOW() - INTERVAL '2 days'),
('claude-3-sonnet', 1200, 0.000015, 0.018, 'output', '/api/agents', NOW() - INTERVAL '2 days'),
('gpt-4o-mini', 3000, 0.00000015, 0.00045, 'input', '/api/tasks', NOW() - INTERVAL '3 days'),
('gpt-4o-mini', 1800, 0.0000006, 0.00108, 'output', '/api/tasks', NOW() - INTERVAL '3 days'),
('claude-3-haiku', 5000, 0.00000025, 0.00125, 'input', '/api/quick-queries', NOW() - INTERVAL '4 days'),
('claude-3-haiku', 2500, 0.00000125, 0.003125, 'output', '/api/quick-queries', NOW() - INTERVAL '4 days')
ON CONFLICT DO NOTHING;