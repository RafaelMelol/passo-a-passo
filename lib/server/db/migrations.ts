import "server-only";
import type { SqlClient } from "./client";

/**
 * Migrações SQL versionadas. Regras: nunca editar uma migração já aplicada,
 * nunca apagar dados — mudanças novas entram como uma nova migração.
 */
export const MIGRATIONS: readonly { id: string; sql: string }[] = [
  {
    id: "0001_banco_central_e_coletor",
    sql: `
CREATE TABLE sources (
  id text PRIMARY KEY,
  enabled boolean NOT NULL,
  health text NOT NULL DEFAULT 'unknown' CHECK (health IN ('unknown','ok','degraded','failing','disabled')),
  last_run_at timestamptz,
  last_success_at timestamptz,
  next_run_at timestamptz,
  consecutive_failures integer NOT NULL DEFAULT 0,
  last_error text,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE documents (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  source_id text NOT NULL REFERENCES sources(id),
  url text NOT NULL UNIQUE,
  kind text NOT NULL CHECK (kind IN ('listing','exam_page','booklet','answer_key','rectification','other')),
  title text,
  parent_url text,
  sha256 text,
  content_type text,
  byte_size integer,
  status text NOT NULL DEFAULT 'discovered' CHECK (status IN ('discovered','fetched','processed','unchanged','failed','skipped')),
  attempts integer NOT NULL DEFAULT 0,
  last_error text,
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  last_checked_at timestamptz,
  processed_at timestamptz
);
CREATE INDEX documents_sha256_idx ON documents (sha256);
CREATE INDEX documents_source_status_idx ON documents (source_id, status);

CREATE TABLE exams (
  id text PRIMARY KEY,
  source_id text NOT NULL REFERENCES sources(id),
  dedupe_key text NOT NULL UNIQUE,
  title text NOT NULL,
  exam_board text NOT NULL,
  organization text,
  role text NOT NULL,
  education_level text NOT NULL,
  year integer,
  exam_date text,
  booklet_type text NOT NULL,
  question_count integer NOT NULL CHECK (question_count > 0),
  option_count integer NOT NULL CHECK (option_count BETWEEN 2 AND 5),
  exam_page_url text NOT NULL,
  booklet_url text NOT NULL,
  booklet_sha256 text,
  answer_key_url text,
  answer_key_sha256 text,
  answer_key_version text NOT NULL CHECK (answer_key_version IN ('nenhum','preliminar','definitivo','oficial-unico')),
  sections jsonb NOT NULL DEFAULT '[]',
  reuse_policy text NOT NULL,
  publication_status text NOT NULL CHECK (publication_status IN ('discovered','extracted','pending_validation','approved','published','rejected','outdated','annulled')),
  verification_status text NOT NULL CHECK (verification_status IN ('pending','verified_official','verified_authorized','disputed','rejected')),
  confidence real NOT NULL DEFAULT 0,
  notes jsonb NOT NULL DEFAULT '[]',
  discovered_at timestamptz NOT NULL DEFAULT now(),
  validated_at timestamptz,
  published_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX exams_publication_idx ON exams (publication_status, published_at DESC);

CREATE TABLE questions (
  id text PRIMARY KEY,
  exam_id text REFERENCES exams(id) ON DELETE CASCADE,
  number integer,
  subject text,
  topic text,
  difficulty text CHECK (difficulty IN ('facil','medio','dificil')),
  classification_method text,
  classification_confidence real,
  difficulty_method text,
  difficulty_confidence real,
  level_flags jsonb NOT NULL DEFAULT '[]',
  statement text,
  support_text jsonb,
  options jsonb,
  explanation jsonb,
  correct_option text CHECK (correct_option IN ('A','B','C','D','E')),
  content_type text NOT NULL CHECK (content_type IN ('oficial','pratica-autoral')),
  text_storage text NOT NULL CHECK (text_storage IN ('full','link-only')),
  verification_status text NOT NULL CHECK (verification_status IN ('pending','verified_official','verified_authorized','practice_authored','disputed','annulled','rejected')),
  publication_status text NOT NULL CHECK (publication_status IN ('discovered','extracted','pending_validation','approved','published','rejected','outdated','annulled')),
  statement_hash text,
  extraction_confidence real,
  source jsonb NOT NULL DEFAULT '{}',
  page integer,
  version integer NOT NULL DEFAULT 1,
  duplicate_of text REFERENCES questions(id),
  discovered_at timestamptz NOT NULL DEFAULT now(),
  validated_at timestamptz,
  published_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (exam_id, number)
);
CREATE INDEX questions_statement_hash_idx ON questions (statement_hash);
CREATE INDEX questions_publication_idx ON questions (publication_status, published_at DESC);

CREATE TABLE question_revisions (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  question_id text NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  from_version integer NOT NULL,
  to_version integer NOT NULL,
  field text NOT NULL,
  previous_value jsonb,
  new_value jsonb,
  reason text NOT NULL,
  source_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX question_revisions_question_idx ON question_revisions (question_id);

CREATE TABLE crawl_runs (
  id text PRIMARY KEY,
  trigger text NOT NULL CHECK (trigger IN ('cron','manual','cli')),
  status text NOT NULL CHECK (status IN ('running','succeeded','partial','failed','interrupted')),
  started_at timestamptz NOT NULL,
  finished_at timestamptz,
  heartbeat_at timestamptz NOT NULL,
  duration_ms integer,
  stats jsonb NOT NULL DEFAULT '{}',
  errors jsonb NOT NULL DEFAULT '[]',
  warnings jsonb NOT NULL DEFAULT '[]'
);
CREATE INDEX crawl_runs_started_idx ON crawl_runs (started_at DESC);

CREATE TABLE crawl_run_sources (
  run_id text NOT NULL REFERENCES crawl_runs(id) ON DELETE CASCADE,
  source_id text NOT NULL REFERENCES sources(id),
  status text NOT NULL CHECK (status IN ('ok','partial','failed','skipped')),
  started_at timestamptz NOT NULL,
  finished_at timestamptz,
  stats jsonb NOT NULL DEFAULT '{}',
  error text,
  PRIMARY KEY (run_id, source_id)
);

CREATE TABLE review_queue (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  item_type text NOT NULL CHECK (item_type IN ('exam','question')),
  item_id text NOT NULL,
  reason text NOT NULL,
  details text,
  priority integer NOT NULL DEFAULT 2,
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open','approved','rejected','dismissed')),
  resolution_note text,
  resolved_by text,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
CREATE UNIQUE INDEX review_queue_open_unique ON review_queue (item_type, item_id, reason) WHERE status = 'open';

CREATE TABLE job_locks (
  name text PRIMARY KEY,
  holder text NOT NULL,
  acquired_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL
);

CREATE TABLE admin_login_attempts (
  id integer GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  client_key text NOT NULL,
  success boolean NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX admin_login_attempts_client_idx ON admin_login_attempts (client_key, created_at);
`,
  },
];

/** Aplica as migrações pendentes, uma vez cada, em transação. */
export async function migrate(db: SqlClient): Promise<string[]> {
  await db.exec(
    "CREATE TABLE IF NOT EXISTS schema_migrations (id text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())",
  );
  const applied: string[] = [];
  for (const migration of MIGRATIONS) {
    const done = await db.query<{ id: string }>("SELECT id FROM schema_migrations WHERE id = $1", [migration.id]);
    if (done.length > 0) continue;
    await db.transaction(async (tx) => {
      // Evita que duas instâncias apliquem a mesma migração ao mesmo tempo.
      await tx.query("SELECT pg_advisory_xact_lock(7140213)");
      const again = await tx.query<{ id: string }>("SELECT id FROM schema_migrations WHERE id = $1", [migration.id]);
      if (again.length > 0) return;
      await tx.exec(migration.sql);
      await tx.query("INSERT INTO schema_migrations (id) VALUES ($1)", [migration.id]);
      applied.push(migration.id);
    });
  }
  return applied;
}
