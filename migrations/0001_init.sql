-- Migration 0001: Initial setup for social providers, accounts, metrics, and sync jobs.
-- This script is idempotent and safe to run multiple times.

-- 1. Create social_providers table
CREATE TABLE IF NOT EXISTS social_providers (
  id text PRIMARY KEY,
  display_name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- 2. Create social_accounts table
CREATE TABLE IF NOT EXISTS social_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  provider text REFERENCES social_providers(id),
  provider_user_id text NOT NULL,
  display_name text,
  avatar_url text,
  access_token text,
  refresh_token text,
  token_expires_at timestamptz,
  scopes text[],
  connected_at timestamptz DEFAULT now(),
  last_synced_at timestamptz,
  UNIQUE(user_id, provider, provider_user_id)
);

-- 3. Create metrics table
CREATE TABLE IF NOT EXISTS metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  social_account_id uuid REFERENCES social_accounts(id) ON DELETE CASCADE,
  provider text NOT NULL,
  metric_key text NOT NULL,
  metric_date date NOT NULL,
  value numeric NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(social_account_id, provider, metric_key, metric_date)
);

-- 4. Create sync_jobs table
CREATE TABLE IF NOT EXISTS sync_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  social_account_id uuid REFERENCES social_accounts(id),
  provider text,
  status text,
  last_error text,
  started_at timestamptz,
  finished_at timestamptz
);

-- 5. Create Indexes
CREATE INDEX IF NOT EXISTS idx_metrics_user_date ON metrics(user_id, metric_date);
CREATE INDEX IF NOT EXISTS idx_accounts_user_provider ON social_accounts(user_id, provider);
