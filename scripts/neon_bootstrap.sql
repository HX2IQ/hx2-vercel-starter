-- HX2/AP2 bootstrap tables
-- Creates ap2_proof_events (required by /api/brain/run polling)
-- Creates ap2_tasks (often used by enqueue/status flows; safe to have)

CREATE TABLE IF NOT EXISTS ap2_proof_events (
  id            BIGSERIAL PRIMARY KEY,
  received_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  task_id       TEXT NOT NULL,
  payload       JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS ap2_proof_events_task_id_idx
  ON ap2_proof_events(task_id);

CREATE TABLE IF NOT EXISTS ap2_tasks (
  id            TEXT PRIMARY KEY,
  task_type     TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'queued',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  payload       JSONB,
  result        JSONB
);

CREATE INDEX IF NOT EXISTS ap2_tasks_task_type_idx
  ON ap2_tasks(task_type);

CREATE INDEX IF NOT EXISTS ap2_tasks_status_idx
  ON ap2_tasks(status);
