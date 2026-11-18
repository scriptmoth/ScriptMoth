import assert from "node:assert/strict";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import { migrations } from "../src/lib/business/schema.ts";

test("migrations install all workflow tables and enforce record constraints", () => {
  const db = new DatabaseSync(":memory:");
  try {
    db.exec("PRAGMA foreign_keys=ON");
    for (const migration of migrations) db.exec(migration);
    const tables = new Set(db.prepare("SELECT name FROM sqlite_schema WHERE type='table'").all().map(row => row.name));
    for (const name of ["products", "builder_rules", "inquiries", "outbox", "quotes", "projects", "invoices", "files", "tickets", "hosting_services"]) assert.ok(tables.has(name), name);
    assert.throws(() => db.exec("INSERT INTO inquiries (id,email,status,data,estimate) VALUES ('a','a@example.com','invalid','{}','{}')"), /constraint/i);
    assert.throws(() => db.exec("INSERT INTO invoices (id,project_id,kind,title,cents,currency) VALUES ('a','missing','deposit','Invalid',10,'USD')"), /foreign key/i);
    assert.throws(() => db.exec("INSERT INTO files (id,filename,content_type,bytes) VALUES ('a','file','image/png',X'00')"), /constraint/i);
  } finally {
    db.close();
  }
});
