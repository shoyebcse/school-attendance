import { NextResponse } from "next/server";
import { sql } from "@/lib/db";
import { Student } from "@/lib/types";

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

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { rows } = await sql`SELECT * FROM students WHERE id = ${id}`;
  if (!rows[0]) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(rowToStudent(rows[0]));
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const s: Student = await req.json();
  await sql`
    UPDATE students
    SET name        = ${s.name},
        roll_number = ${s.rollNumber},
        class       = ${s.class},
        section     = ${s.section},
        email       = ${s.email},
        phone       = ${s.phone},
        parent_name  = ${s.parentName},
        parent_phone = ${s.parentPhone},
        address     = ${s.address},
        join_date   = ${s.joinDate}
    WHERE id = ${id}
  `;
  return NextResponse.json(s);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await sql`DELETE FROM students WHERE id = ${id}`;
  return NextResponse.json({ success: true });
}
