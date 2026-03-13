-- Migration: 003_profiles_update
-- Add missing fields to profiles table

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS bio TEXT;

-- Index for onboarding_completed to filter new users quickly
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding
  ON profiles (onboarding_completed)
  WHERE onboarding_completed = FALSE;
