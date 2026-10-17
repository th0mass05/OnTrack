-- Applied on every startup; every statement must be safe to re-run.

CREATE TABLE IF NOT EXISTS houses (
  id         INTEGER PRIMARY KEY,
  name       TEXT NOT NULL,
  join_code  TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL,
  house_id      INTEGER REFERENCES houses(id),
  xp            INTEGER NOT NULL DEFAULT 0,  -- lifetime total; weekly XP is computed from assignments
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

-- Opaque bearer tokens. Deleting a row logs that device out.
CREATE TABLE IF NOT EXISTS sessions (
  token      TEXT PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

-- A chore is the template ("Take the bins out, 10 XP, weekly, rotating").
CREATE TABLE IF NOT EXISTS chores (
  id              INTEGER PRIMARY KEY,
  house_id        INTEGER NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  xp              INTEGER NOT NULL CHECK (xp IN (10, 30, 50)),
  repeats_weekly  INTEGER NOT NULL CHECK (repeats_weekly IN (0, 1)),
  assignment_mode TEXT NOT NULL CHECK (assignment_mode IN ('fixed', 'rotating')),
  fixed_user_id   INTEGER REFERENCES users(id),
  active          INTEGER NOT NULL DEFAULT 1,
  created_at      TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);

-- An assignment is one week's instance of a chore for one person.
CREATE TABLE IF NOT EXISTS assignments (
  id           INTEGER PRIMARY KEY,
  chore_id     INTEGER NOT NULL REFERENCES chores(id) ON DELETE CASCADE,
  user_id      INTEGER NOT NULL REFERENCES users(id),
  xp           INTEGER NOT NULL,  -- copied from the chore so later edits don't rewrite history
  due_date     TEXT NOT NULL,     -- YYYY-MM-DD, always the Sunday of its week
  status       TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'done', 'missed')),
  completed_at TEXT,
  UNIQUE (chore_id, due_date)
);
CREATE INDEX IF NOT EXISTS assignments_user_due ON assignments (user_id, due_date);

CREATE TABLE IF NOT EXISTS activity (
  id         INTEGER PRIMARY KEY,
  house_id   INTEGER NOT NULL REFERENCES houses(id) ON DELETE CASCADE,
  user_id    INTEGER NOT NULL REFERENCES users(id),
  type       TEXT NOT NULL CHECK (type IN ('CHORE_CREATED', 'CHORE_COMPLETED', 'MEMBER_JOINED', 'LEVEL_UP')),
  metadata   TEXT NOT NULL DEFAULT '{}',  -- JSON
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ', 'now'))
);
CREATE INDEX IF NOT EXISTS activity_house_time ON activity (house_id, created_at DESC);
