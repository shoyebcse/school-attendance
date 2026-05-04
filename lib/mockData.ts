import { Student, AttendanceRecord } from "./types";

export const MOCK_STUDENTS: Student[] = [
  {
    id: "s1",
    name: "Alice Johnson",
    rollNumber: "A001",
    class: "10",
    section: "A",
    email: "alice@school.edu",
    phone: "555-0101",
    parentName: "Robert Johnson",
    parentPhone: "555-0102",
    address: "123 Maple Street, Springfield",
    joinDate: "2023-06-01",
  },
  {
    id: "s2",
    name: "Bob Martinez",
    rollNumber: "A002",
    class: "10",
    section: "A",
    email: "bob@school.edu",
    phone: "555-0103",
    parentName: "Maria Martinez",
    parentPhone: "555-0104",
    address: "456 Oak Avenue, Springfield",
    joinDate: "2023-06-01",
  },
  {
    id: "s3",
    name: "Carol White",
    rollNumber: "A003",
    class: "10",
    section: "A",
    email: "carol@school.edu",
    phone: "555-0105",
    parentName: "James White",
    parentPhone: "555-0106",
    address: "789 Pine Road, Springfield",
    joinDate: "2023-06-01",
  },
  {
    id: "s4",
    name: "David Lee",
    rollNumber: "A004",
    class: "10",
    section: "A",
    email: "david@school.edu",
    phone: "555-0107",
    parentName: "Susan Lee",
    parentPhone: "555-0108",
    address: "321 Elm Street, Springfield",
    joinDate: "2023-06-01",
  },
  {
    id: "s5",
    name: "Emma Davis",
    rollNumber: "A005",
    class: "10",
    section: "A",
    email: "emma@school.edu",
    phone: "555-0109",
    parentName: "Thomas Davis",
    parentPhone: "555-0110",
    address: "654 Birch Lane, Springfield",
    joinDate: "2023-06-01",
  },
  {
    id: "s6",
    name: "Frank Wilson",
    rollNumber: "A006",
    class: "10",
    section: "B",
    email: "frank@school.edu",
    phone: "555-0111",
    parentName: "Linda Wilson",
    parentPhone: "555-0112",
    address: "987 Cedar Court, Springfield",
    joinDate: "2023-06-01",
  },
  {
    id: "s7",
    name: "Grace Taylor",
    rollNumber: "A007",
    class: "10",
    section: "B",
    email: "grace@school.edu",
    phone: "555-0113",
    parentName: "Kevin Taylor",
    parentPhone: "555-0114",
    address: "147 Walnut Drive, Springfield",
    joinDate: "2023-06-01",
  },
  {
    id: "s8",
    name: "Henry Brown",
    rollNumber: "A008",
    class: "10",
    section: "B",
    email: "henry@school.edu",
    phone: "555-0115",
    parentName: "Patricia Brown",
    parentPhone: "555-0116",
    address: "258 Spruce Way, Springfield",
    joinDate: "2023-06-01",
  },
];

function generateDateRange(days: number): string[] {
  const dates: string[] = [];
  const today = new Date();
  for (let i = days; i >= 1; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    // Skip weekends
    if (d.getDay() !== 0 && d.getDay() !== 6) {
      dates.push(d.toISOString().split("T")[0]);
    }
  }
  return dates;
}

export function generateMockAttendance(): AttendanceRecord[] {
  const records: AttendanceRecord[] = [];
  const dates = generateDateRange(30);
  const statuses: Array<"present" | "absent" | "late"> = [
    "present",
    "present",
    "present",
    "present",
    "present",
    "present",
    "present",
    "absent",
    "late",
  ];

  let idCounter = 1;
  for (const student of MOCK_STUDENTS) {
    for (const date of dates) {
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      records.push({
        id: `r${idCounter++}`,
        studentId: student.id,
        date,
        status,
      });
    }
  }
  return records;
}
