-- Enable pg_net extension for HTTP calls in triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Grant usage on net schema to postgres role
GRANT USAGE ON SCHEMA net TO postgres, anon, authenticated, service_role;

-- Grant execute on all functions in net schema
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA net TO postgres, anon, authenticated, service_role;