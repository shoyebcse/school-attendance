"use client";

export interface Teacher {
  id: string;
  name: string;
  email: string;
  subject: string;
  classes: string;
  initials: string;
}

const TEACHERS: Array<Teacher & { password: string }> = [
  {
    id: "t1",
    name: "Ms. Sarah Miller",
    email: "sarah.miller@school.edu",
    password: "teacher123",
    subject: "Mathematics",
    classes: "Class 10 A & B",
    initials: "SM",
  },
  {
    id: "t2",
    name: "Mr. John Smith",
    email: "john.smith@school.edu",
    password: "teacher123",
    subject: "Science",
    classes: "Class 9 A & B",
    initials: "JS",
  },
  {
    id: "t3",
    name: "Ms. Priya Patel",
    email: "priya.patel@school.edu",
    password: "teacher123",
    subject: "English",
    classes: "Class 8 A & B",
    initials: "PP",
  },
];

const SESSION_KEY = "sa_session";

export function login(email: string, password: string): Teacher | null {
  const match = TEACHERS.find(
    (t) =>
      t.email.toLowerCase() === email.toLowerCase() && t.password === password
  );
  if (!match) return null;
  const { password: _, ...teacher } = match;
  if (typeof window !== "undefined") {
    localStorage.setItem(SESSION_KEY, JSON.stringify(teacher));
  }
  return teacher;
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function getSession(): Teacher | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Teacher;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}

export const DEMO_ACCOUNTS = TEACHERS.map(({ password: _, ...t }) => ({
  ...t,
  hint: "teacher123",
}));
