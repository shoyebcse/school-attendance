import { NextResponse } from "next/server";
import { sql, initDb } from "@/lib/db";
import { AttendanceRecord } from "@/lib/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToRecord(row: Record<string, any>): AttendanceRecord {
  return {
    id: row.id,
    studentId: row.student_id,
    date: row.date,
    status: row.status as AttendanceRecord["status"],
    notes: row.notes ?? undefined,
  };
}

export async function GET(req: Request) {
  await initDb();
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");
  const studentId = searchParams.get("studentId");

  let rows;
  if (date) {
    ({ rows } = await sql`
      SELECT * FROM attendance_records WHERE date = ${date}
    `);
  } else if (studentId) {
    ({ rows } = await sql`
      SELECT * FROM attendance_records WHERE student_id = ${studentId} ORDER BY date DESC
    `);
  } else {
    ({ rows } = await sql`
      SELECT * FROM attendance_records ORDER BY date DESC
    `);
  }

  return NextResponse.json(rows.map(rowToRecord));
}

export async function POST(req: Request) {
  await initDb();
  const body = await req.json();
  const records: AttendanceRecord[] = Array.isArray(body) ? body : [body];

  for (const r of records) {
    await sql`
      INSERT INTO attendance_records (id, student_id, date, status, notes)
      VALUES (${r.id}, ${r.studentId}, ${r.date}, ${r.status}, ${r.notes ?? null})
      ON CONFLICT (student_id, date) DO UPDATE
        SET id     = EXCLUDED.id,
            status = EXCLUDED.status,
            notes  = EXCLUDED.notes
    `;
  }

  return NextResponse.json({ success: true });
}
