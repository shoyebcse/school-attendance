"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Users,
  TrendingUp,
  Pencil,
} from "lucide-react";
import Link from "next/link";
import {
  getStudentById,
  getAttendanceForStudent,
  updateStudent,
} from "@/lib/store";
import { Student, AttendanceRecord } from "@/lib/types";
import Avatar from "@/components/Avatar";
import StatusBadge from "@/components/StatusBadge";
import StudentModal from "@/components/StudentModal";

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [student, setStudent] = useState<Student | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [editOpen, setEditOpen] = useState(false);

  function reload() {
    const s = getStudentById(id);
    if (!s) { router.push("/students"); return; }
    setStudent(s);
    setRecords(getAttendanceForStudent(id));
  }

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!student) return null;

  const total = records.length;
  const present = records.filter((r) => r.status === "present").length;
  const late = records.filter((r) => r.status === "late").length;
  const absent = records.filter((r) => r.status === "absent").length;
  const excused = records.filter((r) => r.status === "excused").length;
  const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

  function handleSave(data: Omit<Student, "id">) {
    updateStudent({ ...data, id: student!.id });
    setEditOpen(false);
    reload();
  }

  return (
    <div className="space-y-6">
      {/* Back + actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/students"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm"
        >
          <ArrowLeft size={16} />
          Back to Students
        </Link>
        <button
          onClick={() => setEditOpen(true)}
          className="btn-secondary flex items-center gap-2"
        >
          <Pencil size={14} />
          Edit
        </button>
      </div>

      {/* Profile card */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-5">
          <Avatar name={student.name} size="lg" />
          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{student.name}</h1>
                <p className="text-gray-500 text-sm">
                  Roll No: <span className="font-mono font-medium text-gray-700">{student.rollNumber}</span>
                  {" · "}Class {student.class}-{student.section}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-center px-4 py-2 bg-blue-50 rounded-lg">
                  <p className="text-2xl font-bold text-blue-600">{rate}%</p>
                  <p className="text-xs text-gray-500">Attendance</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
              <InfoRow icon={<Mail size={14} />} label={student.email} />
              <InfoRow icon={<Phone size={14} />} label={student.phone} />
              <InfoRow icon={<MapPin size={14} />} label={student.address} />
              <InfoRow
                icon={<Calendar size={14} />}
                label={`Joined ${format(parseISO(student.joinDate), "MMM d, yyyy")}`}
              />
              <InfoRow
                icon={<Users size={14} />}
                label={`${student.parentName} · ${student.parentPhone}`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Attendance summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Present", count: present, cls: "text-green-600 bg-green-50" },
          { label: "Absent", count: absent, cls: "text-red-600 bg-red-50" },
          { label: "Late", count: late, cls: "text-yellow-600 bg-yellow-50" },
          { label: "Excused", count: excused, cls: "text-blue-600 bg-blue-50" },
        ].map(({ label, count, cls }) => (
          <div key={label} className={`card text-center ${cls} !border-0`}>
            <p className="text-3xl font-bold">{count}</p>
            <p className="text-sm font-medium mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Attendance history */}
      <div className="card !p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Attendance History</h2>
          <span className="text-xs text-gray-400">{total} records</span>
        </div>
        {records.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">
            No attendance records yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Date</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Day</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Status</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium hidden md:table-cell">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {records.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-3 font-medium text-gray-900">
                      {format(parseISO(r.date), "MMM d, yyyy")}
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {format(parseISO(r.date), "EEEE")}
                    </td>
                    <td className="px-6 py-3">
                      <StatusBadge status={r.status} />
                    </td>
                    <td className="px-6 py-3 text-gray-400 hidden md:table-cell">
                      {r.notes || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editOpen && (
        <StudentModal
          student={student}
          onSave={handleSave}
          onClose={() => setEditOpen(false)}
        />
      )}
    </div>
  );
}

function InfoRow({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-600">
      <span className="text-gray-400 flex-shrink-0">{icon}</span>
      <span className="truncate">{label || "—"}</span>
    </div>
  );
}
