-- Database initialization for Hotel Platform
-- Runs automatically on first container start

-- Required extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;      -- gen_random_uuid() for UUID PKs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";   -- uuid_generate_v4() fallback
CREATE EXTENSION IF NOT EXISTS postgis;        -- Geospatial queries for hotel locations

-- Verify extensions
SELECT
    extname,
    extversion
FROM pg_extension
ORDER BY extname;
