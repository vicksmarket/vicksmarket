"use server";

/**
 * Setup Actions — run Supabase migrations from inside the app.
 *
 * Every exported action enforces server-side owner authentication before
 * doing any privileged operation. Client-side guards are NOT relied upon.
 *
 * File access is restricted to the known MIGRATIONS allowlist; filenames
 * are validated against exact matches and resolved-path containment.
 *
 * Table/column existence is checked via direct supabase queries (more
 * reliable than information_schema via PostgREST which may not honour
 * the schema prefix).
 */

import { createServiceClient } from "@/utils/supabase/service";
import { createClient } from "@/utils/supabase/server";
import fs from "fs";
import path from "path";
import type { MigrationStatus, RunResult } from "@/lib/migration-config";
import { MIGRATIONS } from "@/lib/migration-config";

// ── Owner emails (authoritative on the server side) ─────────────────────────
const OWNER_EMAILS = [
  "vicksmarket@gmail.com",
  "mom1113694362@gmail.com",
  "mom01113694362@icloud.com",
];

/**
 * Verify the current Supabase session belongs to an owner.
 * Throws with a generic message if unauthenticated or unauthorized.
 */
async function requireOwner(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user?.email || !OWNER_EMAILS.includes(user.email.toLowerCase())) {
    throw new Error("Unauthorized");
  }
}

/**
 * Resolve and validate a migration filename against the static allowlist.
 * Rejects anything not in MIGRATIONS and enforces path containment.
 */
function resolveMigrationPath(filename: string): string {
  const allowed = MIGRATIONS.map((m) => m.file) as string[];
  if (!allowed.includes(filename)) {
    throw new Error("Invalid migration file");
  }

  const migrationsDir = path.resolve(process.cwd(), "supabase", "migrations");
  const resolved = path.resolve(migrationsDir, filename);

  if (!resolved.startsWith(migrationsDir + path.sep)) {
    throw new Error("Path traversal detected");
  }

  return resolved;
}

// ── Table / column helpers ──────────────────────────────────────────────────

/**
 * Check whether a table exists in the public schema using the service client.
 * Returns true if a SELECT * LIMIT 0 succeeds, false on a "relation does not
 * exist" error, throws on unexpected errors.
 */
async function checkTableExists(
  supabase: ReturnType<typeof createServiceClient>,
  tableName: string
): Promise<{ exists: boolean; error?: string }> {
  const { error } = await supabase.from(tableName).select("*").limit(0);
  if (!error) return { exists: true };

  // PostgreSQL error codes / messages for missing relation
  const missing =
    error.code === "42P01" ||
    error.message?.toLowerCase().includes("does not exist") ||
    error.message?.toLowerCase().includes("relation") ||
    (error as any).details?.toLowerCase?.().includes("does not exist");

  if (missing) return { exists: false };

  // Unexpected error — surface it
  return { exists: false, error: error.message };
}

/**
 * Check whether a column exists in a (public) table.
 * Runs SELECT column LIMIT 0; if the column is missing PostgREST returns an
 * error containing "column … does not exist".
 */
async function checkColumnExists(
  supabase: ReturnType<typeof createServiceClient>,
  tableName: string,
  columnName: string
): Promise<{ exists: boolean; error?: string }> {
  const { error } = await supabase.from(tableName).select(columnName).limit(0);
  if (!error) return { exists: true };

  const missing =
    error.code === "42703" ||
    error.message?.toLowerCase().includes("does not exist") ||
    error.message?.toLowerCase().includes("column");

  if (missing) return { exists: false };

  return { exists: false, error: error.message };
}

// ── Public server actions ──────────────────────────────────────────────────

/** Check which migrations have been applied, using direct table/column probes. */
export async function checkMigrationStatuses(): Promise<MigrationStatus[]> {
  await requireOwner();

  const supabase = createServiceClient();
  const results: MigrationStatus[] = [];

  for (const m of MIGRATIONS) {
    const missingTables: string[] = [];
    const missingColumns: { table: string; column: string }[] = [];
    let firstError: string | undefined;

    // Check required tables
    for (const tableName of m.keyTables as readonly string[]) {
      const { exists, error } = await checkTableExists(supabase, tableName);
      if (!exists) {
        missingTables.push(tableName);
        if (error && !firstError) firstError = error;
      }
    }

    // Check required columns (only attempt if parent table is known to exist)
    for (const col of m.keyColumns as readonly { table: string; column: string }[]) {
      // Skip column check if we already know the table is missing
      if (missingTables.includes(col.table)) {
        missingColumns.push(col);
        continue;
      }
      const { exists, error } = await checkColumnExists(supabase, col.table, col.column);
      if (!exists) {
        missingColumns.push(col);
        if (error && !firstError) firstError = error;
      }
    }

    const hasIndicators = m.keyTables.length > 0 || m.keyColumns.length > 0;
    const applied =
      hasIndicators && missingTables.length === 0 && missingColumns.length === 0;

    results.push({
      file: m.file,
      applied,
      missingTables,
      missingColumns,
      ...(firstError ? { error: firstError } : {}),
    });
  }

  return results;
}

/** Read a migration SQL file — only allowlisted filenames accepted. */
export async function readMigrationSQL(filename: string): Promise<string> {
  await requireOwner();

  const filePath = resolveMigrationPath(filename);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Migration file not found: ${filename}`);
  }

  return fs.readFileSync(filePath, "utf-8");
}

/** Split SQL into individual statements, handling $$ dollar-quoted blocks. */
function splitStatements(sql: string): string[] {
  const stmts: string[] = [];
  let current = "";
  let dollarDepth = 0;

  for (const line of sql.split("\n")) {
    const dollarMatches = (line.match(/\$\$/g) || []).length;
    dollarDepth += dollarMatches;
    if (dollarDepth < 0) dollarDepth = 0;

    current += line + "\n";

    if (line.trimEnd().endsWith(";") && dollarDepth % 2 === 0) {
      const stmt = current.trim();
      if (stmt && stmt !== ";") stmts.push(stmt);
      current = "";
      dollarDepth = 0; // reset after a complete statement
    }
  }

  const remaining = current.trim();
  if (remaining && remaining !== ";") stmts.push(remaining);

  return stmts.filter((s) => {
    const clean = s.replace(/--[^\n]*/g, "").trim();
    return clean.length > 0 && clean !== ";";
  });
}

/**
 * Run a migration via the exec_sql(sql text) RPC with the service-role key.
 * Filename must be in the MIGRATIONS allowlist; session must be owner.
 */
export async function runMigration(filename: string): Promise<RunResult> {
  await requireOwner();

  const filePath = resolveMigrationPath(filename);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    return {
      success: false,
      executed: 0,
      errors: [{ statement: "", error: "Supabase credentials not configured" }],
    };
  }

  if (!fs.existsSync(filePath)) {
    return {
      success: false,
      executed: 0,
      errors: [{ statement: "", error: `Migration file not found: ${filename}` }],
    };
  }

  const sql = fs.readFileSync(filePath, "utf-8");
  const statements = splitStatements(sql);

  const errors: { statement: string; error: string }[] = [];
  let executed = 0;

  for (const stmt of statements) {
    try {
      const res = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
          apikey: key,
        },
        body: JSON.stringify({ sql: stmt }),
      });

      if (res.status === 404) {
        return { success: false, executed: 0, errors: [], noExecSqlFunction: true };
      }

      if (!res.ok) {
        const body = await res.text();
        let msg = "SQL error";
        try {
          const json = JSON.parse(body);
          msg = json.message || json.hint || "SQL error";
        } catch {}

        // Idempotency: "already exists" on CREATE and "does not exist" on DROP are benign
        const benign =
          msg.includes("already exists") ||
          (msg.includes("does not exist") &&
            stmt.trim().toLowerCase().startsWith("drop"));

        if (benign) {
          executed++;
          continue;
        }
        errors.push({ statement: stmt.slice(0, 100), error: msg });
      } else {
        executed++;
      }
    } catch {
      errors.push({
        statement: stmt.slice(0, 100),
        error: "Network error executing statement",
      });
    }
  }

  return { success: errors.length === 0, executed, errors };
}
