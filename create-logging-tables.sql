-- Create logging tables for Gloria application

-- 1. App Logs Table (for server actions like registration, login, checkout)
CREATE TABLE IF NOT EXISTS app_logs (
  id BIGSERIAL PRIMARY KEY,
  level VARCHAR(10) NOT NULL CHECK (level IN ('error', 'warn', 'info', 'debug')),
  message TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  category VARCHAR(50),
  source VARCHAR(100),
  context JSONB,
  stack_trace TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. API Logs Table (for API requests)
CREATE TABLE IF NOT EXISTS api_logs (
  id BIGSERIAL PRIMARY KEY,
  method VARCHAR(10) NOT NULL,
  url TEXT NOT NULL,
  status_code INTEGER,
  user_id UUID REFERENCES auth.users(id),
  ip_address INET,
  user_agent TEXT,
  request_body JSONB,
  response_body JSONB,
  duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Client Logs Table (for frontend logging)
CREATE TABLE IF NOT EXISTS client_logs (
  id BIGSERIAL PRIMARY KEY,
  level VARCHAR(10) NOT NULL CHECK (level IN ('error', 'warn', 'info', 'debug')),
  message TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  url TEXT,
  context JSONB,
  stack_trace TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Performance Logs Table (for performance monitoring)
CREATE TABLE IF NOT EXISTS performance_logs (
  id BIGSERIAL PRIMARY KEY,
  metric_name VARCHAR(100) NOT NULL,
  metric_value NUMERIC NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  url TEXT,
  context JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_app_logs_created_at ON app_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_app_logs_level ON app_logs(level);
CREATE INDEX IF NOT EXISTS idx_app_logs_source ON app_logs(source);
CREATE INDEX IF NOT EXISTS idx_app_logs_user_id ON app_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON api_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_api_logs_status_code ON api_logs(status_code);
CREATE INDEX IF NOT EXISTS idx_api_logs_user_id ON api_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_client_logs_created_at ON client_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_client_logs_level ON client_logs(level);
CREATE INDEX IF NOT EXISTS idx_client_logs_user_id ON client_logs(user_id);

CREATE INDEX IF NOT EXISTS idx_performance_logs_created_at ON performance_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_performance_logs_metric_name ON performance_logs(metric_name);

-- Create RPC functions for logging
CREATE OR REPLACE FUNCTION add_app_log(
  p_level TEXT,
  p_message TEXT,
  p_user_id UUID DEFAULT NULL,
  p_category TEXT DEFAULT NULL,
  p_source TEXT DEFAULT NULL,
  p_context JSONB DEFAULT NULL,
  p_stack_trace TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO app_logs (level, message, user_id, category, source, context, stack_trace)
  VALUES (p_level, p_message, p_user_id, p_category, p_source, p_context, p_stack_trace);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION add_api_log(
  p_method TEXT,
  p_url TEXT,
  p_status_code INTEGER DEFAULT NULL,
  p_user_id UUID DEFAULT NULL,
  p_ip_address INET DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL,
  p_request_body JSONB DEFAULT NULL,
  p_response_body JSONB DEFAULT NULL,
  p_duration_ms INTEGER DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO api_logs (method, url, status_code, user_id, ip_address, user_agent, request_body, response_body, duration_ms)
  VALUES (p_method, p_url, p_status_code, p_user_id, p_ip_address, p_user_agent, p_request_body, p_response_body, p_duration_ms);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION add_client_log(
  p_level TEXT,
  p_message TEXT,
  p_user_id UUID DEFAULT NULL,
  p_url TEXT DEFAULT NULL,
  p_context JSONB DEFAULT NULL,
  p_stack_trace TEXT DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO client_logs (level, message, user_id, url, context, stack_trace)
  VALUES (p_level, p_message, p_user_id, p_url, p_context, p_stack_trace);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION add_performance_log(
  p_metric_name TEXT,
  p_metric_value NUMERIC,
  p_user_id UUID DEFAULT NULL,
  p_url TEXT DEFAULT NULL,
  p_context JSONB DEFAULT NULL
) RETURNS VOID AS $$
BEGIN
  INSERT INTO performance_logs (metric_name, metric_value, user_id, url, context)
  VALUES (p_metric_name, p_metric_value, p_user_id, p_url, p_context);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON FUNCTION add_app_log TO anon, authenticated;
GRANT EXECUTE ON FUNCTION add_api_log TO anon, authenticated;
GRANT EXECUTE ON FUNCTION add_client_log TO anon, authenticated;
GRANT EXECUTE ON FUNCTION add_performance_log TO anon, authenticated;
