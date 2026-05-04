import { NextResponse } from "next/server";
import { sql, initDb, seedUsersIfEmpty } from "@/lib/db";
import { User } from "@/lib/types";

export async function POST(req: Request) {
  await initDb();
  await seedUsersIfEmpty();

  const { email, password } = await req.json();

  const { rows } = await sql`
    SELECT u.id, u.name, u.email, u.role, u.initials,
           tp.subjects, tp.classes_assigned
    FROM users u
    LEFT JOIN teacher_profiles tp ON tp.user_id = u.id
    WHERE LOWER(u.email) = LOWER(${email}) AND u.password = ${password}
  `;

  if (rows.length === 0) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const row = rows[0];
  const user: User = {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    initials: row.initials,
    ...(row.role === "teacher" && {
      subject: (row.subjects as string[])?.[0] ?? "",
      classes: (row.classes_assigned as string[])?.join(", ") ?? "",
    }),
  };

  return NextResponse.json(user);
}
