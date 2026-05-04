import { Student, AttendanceRecord, TeacherWithProfile } from "./types";

export async function getStudents(): Promise<Student[]> {
  const res = await fetch("/api/students");
  return res.json();
}

export async function addStudent(student: Student): Promise<void> {
  await fetch("/api/students", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(student),
  });
}

export async function updateStudent(student: Student): Promise<void> {
  await fetch(`/api/students/${student.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(student),
  });
}

export async function deleteStudent(id: string): Promise<void> {
  await fetch(`/api/students/${id}`, { method: "DELETE" });
}

export async function getStudentById(id: string): Promise<Student | undefined> {
  const res = await fetch(`/api/students/${id}`);
  if (!res.ok) return undefined;
  return res.json();
}

export async function getAttendance(): Promise<AttendanceRecord[]> {
  const res = await fetch("/api/attendance");
  return res.json();
}

export async function getAttendanceForDate(date: string): Promise<AttendanceRecord[]> {
  const res = await fetch(`/api/attendance?date=${date}`);
  return res.json();
}

export async function getAttendanceForStudent(studentId: string): Promise<AttendanceRecord[]> {
  const res = await fetch(`/api/attendance?studentId=${encodeURIComponent(studentId)}`);
  return res.json();
}

export async function upsertAttendanceRecord(record: AttendanceRecord): Promise<void> {
  await fetch("/api/attendance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(record),
  });
}

export async function upsertAttendanceRecords(records: AttendanceRecord[]): Promise<void> {
  await fetch("/api/attendance", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(records),
  });
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// ── Teacher CRUD (manager-only) ───────────────────────────────────────────────

export async function getTeachers(): Promise<TeacherWithProfile[]> {
  const res = await fetch("/api/teachers");
  return res.json();
}

export async function getTeacherById(id: string): Promise<TeacherWithProfile | undefined> {
  const res = await fetch(`/api/teachers/${id}`);
  if (!res.ok) return undefined;
  return res.json();
}

export async function addTeacher(
  teacher: Omit<TeacherWithProfile, "id"> & { password: string }
): Promise<void> {
  await fetch("/api/teachers", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(teacher),
  });
}

export async function updateTeacher(
  id: string,
  teacher: Partial<TeacherWithProfile> & { password?: string }
): Promise<void> {
  await fetch(`/api/teachers/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, ...teacher }),
  });
}

export async function deleteTeacher(id: string): Promise<void> {
  await fetch(`/api/teachers/${id}`, { method: "DELETE" });
}
