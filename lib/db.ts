import { sql } from "@vercel/postgres";

export { sql };

export async function initDb() {
  await sql`
    CREATE TABLE IF NOT EXISTS students (
      id          TEXT PRIMARY KEY,
      name        TEXT NOT NULL,
      roll_number TEXT NOT NULL,
      class       TEXT NOT NULL,
      section     TEXT NOT NULL,
      email       TEXT NOT NULL,
      phone       TEXT NOT NULL DEFAULT '',
      parent_name  TEXT NOT NULL DEFAULT '',
      parent_phone TEXT NOT NULL DEFAULT '',
      address     TEXT NOT NULL DEFAULT '',
      join_date   TEXT NOT NULL
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS attendance_records (
      id         TEXT PRIMARY KEY,
      student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
      date       TEXT NOT NULL,
      status     TEXT NOT NULL CHECK (status IN ('present','absent','late','excused')),
      notes      TEXT,
      UNIQUE (student_id, date)
    )
  `;
}
