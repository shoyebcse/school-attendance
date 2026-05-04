import { NextResponse } from "next/server";
import { sql, initDb } from "@/lib/db";
import { TeacherWithProfile } from "@/lib/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToTeacher(row: Record<string, any>): TeacherWithProfile {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    initials: row.initials,
    qualification: row.qualification ?? "",
    subjects: row.subjects ?? [],
    phone: row.phone ?? "",
    address: row.address ?? "",
    classesAssigned: row.classes_assigned ?? [],
    bio: row.bio ?? "",
    joiningDate: row.joining_date ?? "",
  };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await initDb();
  const { id } = await params;

  const { rows } = await sql`
    SELECT u.id, u.name, u.email, u.initials,
           COALESCE(tp.qualification,    '')   AS qualification,
           COALESCE(tp.subjects,         '{}') AS subjects,
           COALESCE(tp.phone,            '')   AS phone,
           COALESCE(tp.address,          '')   AS address,
           COALESCE(tp.classes_assigned, '{}') AS classes_assigned,
           COALESCE(tp.bio,              '')   AS bio,
           COALESCE(tp.joining_date,     '')   AS joining_date
    FROM users u
    LEFT JOIN teacher_profiles tp ON tp.user_id = u.id
    WHERE u.id = ${id} AND u.role = 'teacher'
  `;

  if (rows.length === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(rowToTeacher(rows[0]));
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await initDb();
  const { id } = await params;
  const body = await req.json();
  const {
    name, email, initials, password,
    qualification = "", subjects = [], phone = "",
    address = "", classesAssigned = [], bio = "", joiningDate = "",
  } = body;

  if (password) {
    await sql`
      UPDATE users
      SET name = ${name}, email = ${email}, initials = ${initials}, password = ${password}
      WHERE id = ${id}
    `;
  } else {
    await sql`
      UPDATE users
      SET name = ${name}, email = ${email}, initials = ${initials}
      WHERE id = ${id}
    `;
  }

  await sql`
    INSERT INTO teacher_profiles
      (user_id, qualification, subjects, phone, address, classes_assigned, bio, joining_date)
    VALUES
      (${id}, ${qualification}, ${subjects}, ${phone}, ${address}, ${classesAssigned}, ${bio}, ${joiningDate})
    ON CONFLICT (user_id) DO UPDATE
      SET qualification    = EXCLUDED.qualification,
          subjects         = EXCLUDED.subjects,
          phone            = EXCLUDED.phone,
          address          = EXCLUDED.address,
          classes_assigned = EXCLUDED.classes_assigned,
          bio              = EXCLUDED.bio,
          joining_date     = EXCLUDED.joining_date
  `;

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await initDb();
  const { id } = await params;
  await sql`DELETE FROM users WHERE id = ${id} AND role = 'teacher'`;
  return NextResponse.json({ success: true });
}
