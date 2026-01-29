-- Error Analysis Tables

-- Error logs table
CREATE TABLE IF NOT EXISTS error_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  error_type VARCHAR(100) NOT NULL,
  error_message TEXT NOT NULL,
  error_code VARCHAR(50),
  endpoint VARCHAR(100),
  request_payload JSONB,
  stack_trace TEXT,
  user_id UUID,
  session_id VARCHAR(100),
  severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'ignored')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Common error patterns table
CREATE TABLE IF NOT EXISTS error_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pattern_name VARCHAR(200) NOT NULL,
  error_type VARCHAR(100) NOT NULL,
  description TEXT,
  suggested_fix TEXT,
  frequency INTEGER DEFAULT 1,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Error fixes and solutions table
CREATE TABLE IF NOT EXISTS error_solutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  error_pattern_id UUID REFERENCES error_patterns(id),
  solution_title VARCHAR(200) NOT NULL,
  solution_description TEXT,
  fix_steps TEXT[],
  effectiveness_rating INTEGER CHECK (effectiveness_rating BETWEEN 1 AND 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_error_logs_type ON error_logs(error_type);
CREATE INDEX IF NOT EXISTS idx_error_logs_created_at ON error_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_error_logs_severity ON error_logs(severity);
CREATE INDEX IF NOT EXISTS idx_error_logs_status ON error_logs(status);
CREATE INDEX IF NOT EXISTS idx_error_patterns_type ON error_patterns(error_type);
CREATE INDEX IF NOT EXISTS idx_error_patterns_frequency ON error_patterns(frequency);

-- Insert sample error patterns
INSERT INTO error_patterns (pattern_name, error_type, description, suggested_fix, frequency) VALUES
('Rate Limit Exceeded', 'API_RATE_LIMIT', 'API requests exceeding rate limits', 'Implement exponential backoff and request queuing', 15),
('Model Context Length', 'TOKEN_LIMIT_ERROR', 'Input exceeds model context window', 'Truncate input or use summarization before sending', 8),
('Authentication Failed', 'AUTH_ERROR', 'Invalid or expired API keys', 'Refresh API tokens and validate credentials', 5),
('Timeout Error', 'REQUEST_TIMEOUT', 'API requests timing out', 'Increase timeout values or optimize request size', 12),
('Invalid JSON Response', 'PARSE_ERROR', 'Malformed JSON in API response', 'Add better error handling and response validation', 7),
('Model Overload', 'SERVICE_UNAVAILABLE', 'AI model temporarily unavailable', 'Implement fallback models and retry logic', 4)
ON CONFLICT DO NOTHING;

-- Insert sample error solutions
INSERT INTO error_solutions (error_pattern_id, solution_title, solution_description, fix_steps, effectiveness_rating) VALUES
((SELECT id FROM error_patterns WHERE pattern_name = 'Rate Limit Exceeded'), 
 'Implement Request Queue', 
 'Add a request queue with exponential backoff to handle rate limits gracefully',
 ARRAY['Install a queue library like Bull or Agenda', 'Create a request queue manager', 'Implement exponential backoff strategy', 'Add request prioritization'], 
 5),
((SELECT id FROM error_patterns WHERE pattern_name = 'Model Context Length'), 
 'Text Chunking Strategy', 
 'Split large inputs into smaller chunks that fit within model limits',
 ARRAY['Calculate token count before sending', 'Split text into overlapping chunks', 'Process chunks sequentially', 'Combine results intelligently'], 
 4),
((SELECT id FROM error_patterns WHERE pattern_name = 'Authentication Failed'), 
 'Token Refresh Mechanism', 
 'Automatically refresh expired tokens and retry failed requests',
 ARRAY['Monitor token expiration', 'Implement auto-refresh logic', 'Store backup credentials', 'Add token validation'], 
 5)
ON CONFLICT DO NOTHING;

-- Insert sample error logs
INSERT INTO error_logs (error_type, error_message, error_code, endpoint, severity, status, created_at) VALUES
('API_RATE_LIMIT', 'Rate limit exceeded for model gpt-4o', '429', '/api/chat', 'medium', 'resolved', NOW() - INTERVAL '1 hour'),
('TOKEN_LIMIT_ERROR', 'Input exceeds maximum context length of 128k tokens', '400', '/api/agents', 'high', 'resolved', NOW() - INTERVAL '2 hours'),
('AUTH_ERROR', 'Invalid API key provided', '401', '/api/tasks', 'critical', 'resolved', NOW() - INTERVAL '3 hours'),
('REQUEST_TIMEOUT', 'Request timed out after 30 seconds', '408', '/api/chat', 'medium', 'open', NOW() - INTERVAL '30 minutes'),
('PARSE_ERROR', 'Unexpected token in JSON at position 45', '422', '/api/agents', 'low', 'investigating', NOW() - INTERVAL '15 minutes'),
('SERVICE_UNAVAILABLE', 'Model claude-3-opus is temporarily unavailable', '503', '/api/chat', 'high', 'open', NOW() - INTERVAL '5 minutes')
ON CONFLICT DO NOTHING;