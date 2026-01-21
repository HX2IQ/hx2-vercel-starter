-- Patch ap2_proof_events to match /api/ap2-proof expectations
ALTER TABLE ap2_proof_events
  ADD COLUMN IF NOT EXISTS headers JSONB;

-- Optional but helpful: store requester IP / meta in future (won’t hurt if unused)
ALTER TABLE ap2_proof_events
  ADD COLUMN IF NOT EXISTS meta JSONB;
