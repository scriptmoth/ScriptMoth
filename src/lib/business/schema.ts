export const migrations = [`
CREATE TABLE products (
  id TEXT PRIMARY KEY, slug TEXT NOT NULL UNIQUE, status TEXT NOT NULL
    CHECK(status IN ('draft', 'published', 'archived')),
  featured_order INTEGER, data TEXT NOT NULL
);
CREATE TABLE business_settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE TABLE quote_options (
  id TEXT PRIMARY KEY, project_type TEXT NOT NULL, label TEXT NOT NULL,
  kind TEXT NOT NULL CHECK(kind IN ('base','feature','addon','recurring')),
  cents INTEGER CHECK(cents >= 0), active INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE inquiries (
  id TEXT PRIMARY KEY, owner_id TEXT, email TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('draft','new','reviewing','closed')),
  data TEXT NOT NULL, estimate TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX inquiries_owner ON inquiries(owner_id, status);
CREATE TABLE rate_limits (key TEXT PRIMARY KEY, count INTEGER NOT NULL, expires INTEGER NOT NULL);
CREATE TABLE audit (
  id INTEGER PRIMARY KEY, actor TEXT, event TEXT NOT NULL, entity TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE outbox (
  id TEXT PRIMARY KEY, recipient TEXT NOT NULL, template TEXT NOT NULL, data TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP, sent_at TEXT
);
`, `
CREATE TABLE client_settings (
  user_id TEXT PRIMARY KEY, enabled INTEGER NOT NULL DEFAULT 1,
  email_updates INTEGER NOT NULL DEFAULT 1, deletion_requested_at TEXT
);
CREATE TABLE client_notes (
  id TEXT PRIMARY KEY, user_id TEXT NOT NULL, author_id TEXT NOT NULL,
  body TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE quotes (
  id TEXT PRIMARY KEY, inquiry_id TEXT NOT NULL REFERENCES inquiries(id),
  owner_id TEXT NOT NULL, version INTEGER NOT NULL, status TEXT NOT NULL
    CHECK(status IN ('sent','accepted','declined','superseded')),
  expires_on TEXT NOT NULL, data TEXT NOT NULL, decided_at TEXT,
  UNIQUE(inquiry_id, version)
);
CREATE TABLE projects (
  id TEXT PRIMARY KEY, quote_id TEXT NOT NULL UNIQUE REFERENCES quotes(id),
  owner_id TEXT NOT NULL, title TEXT NOT NULL, project_type TEXT NOT NULL,
  scope TEXT NOT NULL, status TEXT NOT NULL, due_on TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX projects_owner ON projects(owner_id);
CREATE TABLE milestones (
  id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id),
  title TEXT NOT NULL, due_on TEXT, completed_at TEXT
);
CREATE TABLE project_entries (
  id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id),
  author_id TEXT NOT NULL, kind TEXT NOT NULL
    CHECK(kind IN ('message','update','note','task','time','action','delivery')),
  body TEXT NOT NULL, resolved_at TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE project_reads (
  project_id TEXT NOT NULL REFERENCES projects(id), user_id TEXT NOT NULL,
  read_at TEXT NOT NULL, PRIMARY KEY(project_id, user_id)
);
CREATE TABLE files (
  id TEXT PRIMARY KEY, project_id TEXT REFERENCES projects(id), inquiry_id TEXT REFERENCES inquiries(id),
  ticket_id TEXT, entry_id TEXT REFERENCES project_entries(id), uploader_id TEXT,
  filename TEXT NOT NULL, content_type TEXT NOT NULL, bytes BLOB NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK((project_id IS NOT NULL) + (inquiry_id IS NOT NULL) + (ticket_id IS NOT NULL) = 1)
);
CREATE TABLE invoices (
  id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id),
  kind TEXT NOT NULL CHECK(kind IN ('deposit','milestone','balance','one-time')),
  title TEXT NOT NULL, cents INTEGER NOT NULL CHECK(cents > 0), currency TEXT NOT NULL,
  due_on TEXT, status TEXT NOT NULL DEFAULT 'open' CHECK(status IN ('open','paid','partially_refunded','refunded')),
  stripe_session TEXT UNIQUE, payment_intent TEXT UNIQUE, receipt_url TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE payment_events (
  id TEXT PRIMARY KEY, entity_id TEXT NOT NULL, event TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE tickets (
  id TEXT PRIMARY KEY, owner_id TEXT NOT NULL, project_id TEXT REFERENCES projects(id),
  category TEXT NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL,
  affected_feature TEXT, priority TEXT NOT NULL, status TEXT NOT NULL DEFAULT 'Open',
  classification TEXT, resolution TEXT, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE ticket_replies (
  id TEXT PRIMARY KEY, ticket_id TEXT NOT NULL REFERENCES tickets(id),
  author_id TEXT NOT NULL, body TEXT NOT NULL, created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE hosting_plans (id TEXT PRIMARY KEY, title TEXT NOT NULL, data TEXT NOT NULL);
CREATE TABLE hosting_services (
  id TEXT PRIMARY KEY, project_id TEXT NOT NULL REFERENCES projects(id),
  plan_id TEXT NOT NULL REFERENCES hosting_plans(id), data TEXT NOT NULL,
  stripe_session TEXT UNIQUE, subscription_id TEXT UNIQUE
);
CREATE TABLE policies (
  slug TEXT PRIMARY KEY, title TEXT NOT NULL, body TEXT NOT NULL DEFAULT '',
  published INTEGER NOT NULL DEFAULT 0
);
`, `
CREATE TABLE product_images (id TEXT PRIMARY KEY, content_type TEXT NOT NULL, bytes BLOB NOT NULL);
`, `
CREATE TABLE builder_rules (option_id TEXT PRIMARY KEY, rules TEXT NOT NULL);
`];
