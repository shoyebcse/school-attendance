export interface Student {
  id: string;
  name: string;
  rollNumber: string;
  class: string;
  section: string;
  email: string;
  phone: string;
  parentName: string;
  parentPhone: string;
  address: string;
  joinDate: string;
  avatarInitials?: string;
}

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export interface AttendanceRecord {
  id: string;
  studentId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  notes?: string;
}

export interface DashboardStats {
  totalStudents: number;
  presentToday: number;
  absentToday: number;
  attendanceRate: number;
}

export type Role = "teacher" | "manager";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  initials: string;
  // Teacher-specific display fields populated at login
  subject?: string;
  classes?: string;
}

// Backward-compat alias used in existing Sidebar / login code
export type Teacher = User;

export interface TeacherWithProfile {
  id: string;
  name: string;
  email: string;
  initials: string;
  qualification: string;
  subjects: string[];
  phone: string;
  address: string;
  classesAssigned: string[];
  bio: string;
  joiningDate: string;
}
