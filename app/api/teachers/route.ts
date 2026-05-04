import { NextResponse } from "next/server";
import { sql, initDb, seedUsersIfEmpty } from "@/lib/db";
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

export async function GET() {
  await initDb();
  await seedUsersIfEmpty();

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
    WHERE u.role = 'teacher'
    ORDER BY u.name
  `;

  return NextResponse.json(rows.map(rowToTeacher));
}

export async function POST(req: Request) {
  await initDb();
  const body = await req.json();
  const {
    name, email, password, initials,
    qualification = "", subjects = [], phone = "",
    address = "", classesAssigned = [], bio = "", joiningDate = "",
  } = body;

  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  await sql`
    INSERT INTO users (id, name, email, password, role, initials)
    VALUES (${id}, ${name}, ${email}, ${password}, 'teacher', ${initials})
  `;

  await sql`
    INSERT INTO teacher_profiles
      (user_id, qualification, subjects, phone, address, classes_assigned, bio, joining_date)
    VALUES
      (${id}, ${qualification}, ${subjects}, ${phone}, ${address}, ${classesAssigned}, ${bio}, ${joiningDate})
  `;

  return NextResponse.json(
    { id, name, email, initials, qualification, subjects, phone, address, classesAssigned, bio, joiningDate },
    { status: 201 }
  );
}
