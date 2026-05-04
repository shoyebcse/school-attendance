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

  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id         TEXT PRIMARY KEY,
      name       TEXT NOT NULL,
      email      TEXT UNIQUE NOT NULL,
      password   TEXT NOT NULL,
      role       TEXT NOT NULL DEFAULT 'teacher' CHECK (role IN ('teacher','manager')),
      initials   TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS teacher_profiles (
      user_id          TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
      qualification    TEXT NOT NULL DEFAULT '',
      subjects         TEXT[] NOT NULL DEFAULT '{}',
      phone            TEXT NOT NULL DEFAULT '',
      address          TEXT NOT NULL DEFAULT '',
      classes_assigned TEXT[] NOT NULL DEFAULT '{}',
      bio              TEXT NOT NULL DEFAULT '',
      joining_date     TEXT NOT NULL DEFAULT ''
    )
  `;
}

export async function seedUsersIfEmpty() {
  const { rows } = await sql`SELECT COUNT(*) AS count FROM users`;
  if (parseInt(rows[0].count as string) > 0) return;

  await sql`
    INSERT INTO users (id, name, email, password, role, initials)
    VALUES ('m1', 'Principal Johnson', 'principal@school.edu', 'admin123', 'manager', 'PJ')
    ON CONFLICT DO NOTHING
  `;

  const teachers = [
    { id: "t1", name: "Ms. Sarah Miller", email: "sarah.miller@school.edu", initials: "SM" },
    { id: "t2", name: "Mr. John Smith",   email: "john.smith@school.edu",   initials: "JS" },
    { id: "t3", name: "Ms. Priya Patel",  email: "priya.patel@school.edu",  initials: "PP" },
  ];
  for (const t of teachers) {
    await sql`
      INSERT INTO users (id, name, email, password, role, initials)
      VALUES (${t.id}, ${t.name}, ${t.email}, 'teacher123', 'teacher', ${t.initials})
      ON CONFLICT DO NOTHING
    `;
  }

  await sql`
    INSERT INTO teacher_profiles
      (user_id, qualification, subjects, phone, address, classes_assigned, joining_date)
    VALUES
      ('t1', 'M.Sc. Mathematics', ARRAY['Mathematics'],          '+1-555-0101', '123 School St',      ARRAY['10-A','10-B'], '2020-08-01'),
      ('t2', 'M.Sc. Physics',     ARRAY['Science','Physics'],    '+1-555-0102', '456 Education Ave',  ARRAY['9-A','9-B'],   '2019-06-15'),
      ('t3', 'M.A. English',      ARRAY['English','Literature'], '+1-555-0103', '789 Knowledge Blvd', ARRAY['8-A','8-B'],   '2021-01-10')
    ON CONFLICT DO NOTHING
  `;
}
