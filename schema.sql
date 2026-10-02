-- D1 (SQLite) schema. Run:
--   npx wrangler d1 execute realestate-db --local  --file=schema.sql   (local dev)
--   npx wrangler d1 execute realestate-db --remote --file=schema.sql   (production)

DROP TABLE IF EXISTS land_records;
DROP TABLE IF EXISTS properties;
DROP TABLE IF EXISTS enquiries;
DROP TABLE IF EXISTS lookup_requests;

-- Land details looked up by registration document number
CREATE TABLE land_records (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  doc_number        TEXT NOT NULL,          -- e.g. 1234
  doc_year          INTEGER NOT NULL,       -- e.g. 2023
  sro               TEXT,                   -- Sub-Registrar Office
  survey_number     TEXT,
  village           TEXT,
  mandal            TEXT,
  district          TEXT,
  state             TEXT,
  extent            REAL,                   -- land size
  extent_unit       TEXT DEFAULT 'sq yards',-- sq yards / acres / sq ft
  land_type         TEXT,                   -- agricultural / residential / commercial
  owner_name        TEXT,
  registration_date TEXT,
  market_value      INTEGER,                -- INR
  boundaries        TEXT,
  remarks           TEXT,
  created_at        TEXT DEFAULT (datetime('now')),
  UNIQUE (doc_number, doc_year, sro)
);
CREATE INDEX idx_land_doc ON land_records (doc_number, doc_year);

-- Properties listed for sale
CREATE TABLE properties (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  title        TEXT NOT NULL,
  type         TEXT NOT NULL,              -- plot / agricultural / house / flat / commercial
  area         TEXT NOT NULL,              -- locality, e.g. Kokapet
  city         TEXT NOT NULL,
  price        INTEGER NOT NULL,           -- INR
  size         REAL,
  size_unit    TEXT DEFAULT 'sq yards',
  description  TEXT,
  image_url    TEXT,
  doc_number   TEXT,                       -- optional link to land_records ("1234/2023")
  status       TEXT DEFAULT 'available',   -- available / sold
  created_at   TEXT DEFAULT (datetime('now'))
);
CREATE INDEX idx_prop_search ON properties (status, area, type, price);

-- Buyer requirements: preferred area + budget
CREATE TABLE enquiries (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  name          TEXT NOT NULL,
  phone         TEXT NOT NULL,
  email         TEXT,
  area          TEXT NOT NULL,
  property_type TEXT,
  budget_min    INTEGER,
  budget_max    INTEGER NOT NULL,
  message       TEXT,
  property_id   INTEGER,                   -- set when enquiring about a specific listing
  created_at    TEXT DEFAULT (datetime('now'))
);

-- Document lookups we couldn't answer from our own records
CREATE TABLE lookup_requests (
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

-- Sample data (delete before going live)
INSERT INTO land_records (doc_number, doc_year, sro, survey_number, village, mandal, district, state, extent, extent_unit, land_type, owner_name, registration_date, market_value, boundaries, remarks) VALUES
('1234', 2023, 'Gandipet', '145/A', 'Kokapet', 'Gandipet', 'Ranga Reddy', 'Telangana', 300, 'sq yards', 'residential', 'Sample Owner', '2023-04-12', 4500000, 'N: 30ft road, S: Plot 12, E: Plot 9, W: Plot 11', 'Sample record'),
('5678', 2022, 'Shamshabad', '88', 'Kothur', 'Kothur', 'Ranga Reddy', 'Telangana', 2.5, 'acres', 'agricultural', 'Sample Farmer', '2022-11-03', 3750000, NULL, 'Sample record');

INSERT INTO properties (title, type, area, city, price, size, size_unit, description, image_url, doc_number) VALUES
('East-facing plot near ORR', 'plot', 'Kokapet', 'Hyderabad', 5400000, 300, 'sq yards', 'HMDA approved layout, 30 ft road, clear title.', 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800', '1234/2023'),
('2.5 acre farm land with bore well', 'agricultural', 'Kothur', 'Hyderabad', 4200000, 2.5, 'acres', 'Black soil, bore well, 1 km from highway.', 'https://images.unsplash.com/photo-1500076656116-558758c991c1?w=800', '5678/2022'),
('3BHK independent house', 'house', 'Miyapur', 'Hyderabad', 12500000, 200, 'sq yards', 'G+1, 6 years old, close to metro station.', 'https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=800', NULL),
('2BHK gated community flat', 'flat', 'Gachibowli', 'Hyderabad', 8500000, 1250, 'sq ft', 'Ready to move, 5th floor, covered parking.', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800', NULL);
