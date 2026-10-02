-- Document lookups we couldn't answer from our own records
CREATE TABLE IF NOT EXISTS lookup_requests (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  doc_number  TEXT NOT NULL,
  doc_year    INTEGER,
  sro         TEXT,
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,
  email       TEXT,
  status      TEXT DEFAULT 'new',          -- new / done
  created_at  TEXT DEFAULT (datetime('now'))
);
