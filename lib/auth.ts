"use client";

import { User, Role } from "./types";

export type { User };
// Backward-compat alias
export type Teacher = User;

const SESSION_KEY = "sa_session";

export async function login(email: string, password: string): Promise<User | null> {
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) return null;
    const user: User = await res.json();
    if (typeof window !== "undefined") {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    }
    return user;
  } catch {
    return null;
  }
}

export function logout(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(SESSION_KEY);
  }
}

export function getSession(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as User;
    // Clear pre-RBAC sessions that lack a role field
    if (!data.role) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getSession() !== null;
}

export function getRole(): Role | null {
  return getSession()?.role ?? null;
}

export const DEMO_ACCOUNTS = [
  {
    id: "m1",
    name: "Principal Johnson",
    email: "principal@school.edu",
    role: "manager" as Role,
    initials: "PJ",
    hint: "admin123",
  },
  {
    id: "t1",
    name: "Ms. Sarah Miller",
    email: "sarah.miller@school.edu",
    role: "teacher" as Role,
    initials: "SM",
    hint: "teacher123",
  },
  {
    id: "t2",
    name: "Mr. John Smith",
    email: "john.smith@school.edu",
    role: "teacher" as Role,
    initials: "JS",
    hint: "teacher123",
  },
  {
    id: "t3",
    name: "Ms. Priya Patel",
    email: "priya.patel@school.edu",
    role: "teacher" as Role,
    initials: "PP",
    hint: "teacher123",
  },
];
