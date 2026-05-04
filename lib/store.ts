"use client";

import { Student, AttendanceRecord } from "./types";
import { MOCK_STUDENTS, generateMockAttendance } from "./mockData";

const STUDENTS_KEY = "sa_students";
const ATTENDANCE_KEY = "sa_attendance";

function isClient() {
  return typeof window !== "undefined";
}

export function getStudents(): Student[] {
  if (!isClient()) return MOCK_STUDENTS;
  const raw = localStorage.getItem(STUDENTS_KEY);
  if (!raw) {
    localStorage.setItem(STUDENTS_KEY, JSON.stringify(MOCK_STUDENTS));
    return MOCK_STUDENTS;
  }
  return JSON.parse(raw) as Student[];
}

export function saveStudents(students: Student[]): void {
  if (!isClient()) return;
  localStorage.setItem(STUDENTS_KEY, JSON.stringify(students));
}

export function addStudent(student: Student): void {
  const students = getStudents();
  students.push(student);
  saveStudents(students);
}

export function updateStudent(updated: Student): void {
  const students = getStudents();
  const idx = students.findIndex((s) => s.id === updated.id);
  if (idx !== -1) {
    students[idx] = updated;
    saveStudents(students);
  }
}

export function deleteStudent(id: string): void {
  const students = getStudents().filter((s) => s.id !== id);
  saveStudents(students);
  // Also remove attendance records
  const records = getAttendance().filter((r) => r.studentId !== id);
  saveAttendance(records);
}

export function getAttendance(): AttendanceRecord[] {
  if (!isClient()) return [];
  const raw = localStorage.getItem(ATTENDANCE_KEY);
  if (!raw) {
    const mock = generateMockAttendance();
    localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(mock));
    return mock;
  }
  return JSON.parse(raw) as AttendanceRecord[];
}

export function saveAttendance(records: AttendanceRecord[]): void {
  if (!isClient()) return;
  localStorage.setItem(ATTENDANCE_KEY, JSON.stringify(records));
}

export function upsertAttendanceRecord(record: AttendanceRecord): void {
  const records = getAttendance();
  const idx = records.findIndex(
    (r) => r.studentId === record.studentId && r.date === record.date
  );
  if (idx !== -1) {
    records[idx] = record;
  } else {
    records.push(record);
  }
  saveAttendance(records);
}

export function getAttendanceForDate(date: string): AttendanceRecord[] {
  return getAttendance().filter((r) => r.date === date);
}

export function getAttendanceForStudent(studentId: string): AttendanceRecord[] {
  return getAttendance()
    .filter((r) => r.studentId === studentId)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getStudentById(id: string): Student | undefined {
  return getStudents().find((s) => s.id === id);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
