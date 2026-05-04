import { NextResponse } from "next/server";
import { sql, initDb } from "@/lib/db";
import { Student } from "@/lib/types";
import { MOCK_STUDENTS, generateMockAttendance } from "@/lib/mockData";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToStudent(row: Record<string, any>): Student {
  return {
    id: row.id,
    name: row.name,
    rollNumber: row.roll_number,
    class: row.class,
    section: row.section,
    email: row.email,
    phone: row.phone ?? "",
    parentName: row.parent_name ?? "",
    parentPhone: row.parent_phone ?? "",
    address: row.address ?? "",
    joinDate: row.join_date,
  };
}

async function seedIfEmpty() {
  const { rows } = await sql`SELECT COUNT(*) AS count FROM students`;
  if (parseInt(rows[0].count as string) > 0) return;

  for (const s of MOCK_STUDENTS) {
    await sql`
      INSERT INTO students (id, name, roll_number, class, section, email, phone, parent_name, parent_phone, address, join_date)
      VALUES (${s.id}, ${s.name}, ${s.rollNumber}, ${s.class}, ${s.section}, ${s.email},
              ${s.phone}, ${s.parentName}, ${s.parentPhone}, ${s.address}, ${s.joinDate})
      ON CONFLICT (id) DO NOTHING
    `;
  }

  const records = generateMockAttendance();
  for (const r of records) {
    await sql`
      INSERT INTO attendance_records (id, student_id, date, status, notes)
      VALUES (${r.id}, ${r.studentId}, ${r.date}, ${r.status}, ${r.notes ?? null})
      ON CONFLICT (student_id, date) DO NOTHING
    `;
  }
}

export async function GET() {
  await initDb();
  await seedIfEmpty();
  const { rows } = await sql`SELECT * FROM students ORDER BY name`;
  return NextResponse.json(rows.map(rowToStudent));
}

export async function POST(req: Request) {
  await initDb();
  const s: Student = await req.json();
  await sql`
    INSERT INTO students (id, name, roll_number, class, section, email, phone, parent_name, parent_phone, address, join_date)
    VALUES (${s.id}, ${s.name}, ${s.rollNumber}, ${s.class}, ${s.section}, ${s.email},
            ${s.phone}, ${s.parentName}, ${s.parentPhone}, ${s.address}, ${s.joinDate})
  `;
  return NextResponse.json(s, { status: 201 });
}
