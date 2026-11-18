import { mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { DatabaseSync, type SQLInputValue } from "node:sqlite";
import { migrations } from "./schema";

let database: DatabaseSync | undefined;

export function transaction<T>(connection: DatabaseSync, work: () => T): T {
  connection.exec("BEGIN IMMEDIATE");
  try {
    const result = work();
    connection.exec("COMMIT");
    return result;
  } catch (error) {
    connection.exec("ROLLBACK");
    throw error;
  }
}

export function openDatabase(filename: string) {
  if (filename !== ":memory:") mkdirSync(dirname(resolve(filename)), { recursive: true, mode: 0o700 });
  const connection = new DatabaseSync(filename);
  try {
    connection.exec("PRAGMA busy_timeout = 5000; PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON");
    transaction(connection, () => {
      connection.exec("CREATE TABLE IF NOT EXISTS schema_migrations (version INTEGER PRIMARY KEY)");
      const applied = new Set(connection.prepare("SELECT version FROM schema_migrations").all().map(row => row.version));
      for (const [index, migration] of migrations.entries()) {
        if (applied.has(index + 1)) continue;
        connection.exec(migration);
        connection.prepare("INSERT INTO schema_migrations VALUES (?)").run(index + 1);
      }
    });
    return connection;
  } catch (error) {
    connection.close();
    throw error;
  }
}

export const databaseConfigured = () => Boolean(process.env.SCRIPTMOTH_DB_PATH) || process.env.NODE_ENV === "development";

export function db() {
  if (database) return database;
  if (!databaseConfigured()) throw new Error("Scriptmoth database is unavailable.");
  const path = resolve(process.env.SCRIPTMOTH_DB_PATH || ".scriptmoth/studio.sqlite");
  const publicPath = resolve("public");
  const normalized = process.platform === "win32" ? path.toLowerCase() : path;
  const publicRoot = process.platform === "win32" ? publicPath.toLowerCase() : publicPath;
  if (normalized === publicRoot || normalized.startsWith(publicRoot + (process.platform === "win32" ? "\\" : "/"))) {
    throw new Error("The database must be stored outside public.");
  }
  database = openDatabase(path);
  return database;
}

export function all<T>(sql: string, ...values: SQLInputValue[]) {
  return db().prepare(sql).all(...values) as unknown as T[];
}
export function one<T>(sql: string, ...values: SQLInputValue[]) {
  return db().prepare(sql).get(...values) as unknown as T | undefined;
}
export function run(sql: string, ...values: SQLInputValue[]) {
  return db().prepare(sql).run(...values);
}
export function audit(actor: string | null, event: string, entity: string) {
  run("INSERT INTO audit (actor,event,entity) VALUES (?,?,?)", actor, event, entity);
}
export function takeLimit(key: string, maximum: number, windowSeconds: number) {
  const now = Math.floor(Date.now() / 1000);
  run("DELETE FROM rate_limits WHERE expires <= ?", now);
  const result = one<{ count: number }>(`
    INSERT INTO rate_limits VALUES (?,1,?)
    ON CONFLICT(key) DO UPDATE SET count = min(count + 1, ?)
    RETURNING count
  `, key, now + windowSeconds, maximum + 1);
  return Boolean(result && result.count <= maximum);
}
