"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Save, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";
import {
  getStudents,
  getAttendanceForDate,
  upsertAttendanceRecord,
  generateId,
} from "@/lib/store";
import { Student, AttendanceRecord, AttendanceStatus } from "@/lib/types";
import Avatar from "@/components/Avatar";

type DraftRecord = {
  studentId: string;
  status: AttendanceStatus;
  notes: string;
};

const STATUS_OPTIONS: { value: AttendanceStatus; label: string; cls: string }[] = [
  { value: "present", label: "Present", cls: "bg-green-100 text-green-700 border-green-300" },
  { value: "absent", label: "Absent", cls: "bg-red-100 text-red-700 border-red-300" },
  { value: "late", label: "Late", cls: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  { value: "excused", label: "Excused", cls: "bg-blue-100 text-blue-700 border-blue-300" },
];

export default function AttendancePage() {
  const today = format(new Date(), "yyyy-MM-dd");
  const [date, setDate] = useState(today);
  const [students, setStudents] = useState<Student[]>([]);
  const [draft, setDraft] = useState<Record<string, DraftRecord>>({});
  const [saved, setSaved] = useState(false);
  const [filterSection, setFilterSection] = useState("");

  function loadForDate(d: string) {
    const s = getStudents();
    const existing = getAttendanceForDate(d);
    setStudents(s);
    const map: Record<string, DraftRecord> = {};
    for (const st of s) {
      const rec = existing.find((r) => r.studentId === st.id);
      map[st.id] = {
        studentId: st.id,
        status: rec?.status ?? "present",
        notes: rec?.notes ?? "",
      };
    }
    setDraft(map);
    setSaved(false);
  }

  useEffect(() => {
    loadForDate(date);
  }, [date]);

  function setStatus(studentId: string, status: AttendanceStatus) {
    setDraft((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], status },
    }));
    setSaved(false);
  }

  function setNotes(studentId: string, notes: string) {
    setDraft((prev) => ({
      ...prev,
      [studentId]: { ...prev[studentId], notes },
    }));
    setSaved(false);
  }

  function markAll(status: AttendanceStatus) {
    setDraft((prev) => {
      const next = { ...prev };
      for (const id of Object.keys(next)) {
        if (!filterSection || students.find((s) => s.id === id)?.section === filterSection) {
          next[id] = { ...next[id], status };
        }
      }
      return next;
    });
    setSaved(false);
  }

  function handleSave() {
    for (const rec of Object.values(draft)) {
      const record: AttendanceRecord = {
        id: generateId(),
        studentId: rec.studentId,
        date,
        status: rec.status,
        notes: rec.notes || undefined,
      };
      upsertAttendanceRecord(record);
    }
    setSaved(true);
  }

  function shiftDate(days: number) {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    setDate(d.toISOString().split("T")[0]);
  }

  const sections = [...new Set(students.map((s) => s.section))].sort();
  const filteredStudents = filterSection
    ? students.filter((s) => s.section === filterSection)
    : students;

  const counts = Object.values(draft).reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    },
    {} as Record<AttendanceStatus, number>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mark Attendance</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {filteredStudents.length} students
          </p>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
            saved
              ? "bg-green-100 text-green-700"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {saved ? (
            <>
              <CheckCircle2 size={16} />
              Saved!
            </>
          ) : (
            <>
              <Save size={16} />
              Save Attendance
            </>
          )}
        </button>
      </div>

      {/* Date nav */}
      <div className="card !p-4 flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => shiftDate(-1)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <input
            type="date"
            className="input w-auto"
            value={date}
            max={today}
            onChange={(e) => setDate(e.target.value)}
          />
          <button
            onClick={() => shiftDate(1)}
            disabled={date >= today}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-30"
          >
            <ChevronRight size={18} />
          </button>
          {date !== today && (
            <button
              onClick={() => setDate(today)}
              className="text-xs text-blue-600 hover:underline"
            >
              Today
            </button>
          )}
        </div>

        {sections.length > 1 && (
          <select
            className="input w-auto"
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
          >
            <option value="">All Sections</option>
            {sections.map((s) => (
              <option key={s} value={s}>Section {s}</option>
            ))}
          </select>
        )}

        <div className="flex gap-2 ml-auto flex-wrap">
          <span className="text-xs text-gray-500 self-center">Mark all:</span>
          {STATUS_OPTIONS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => markAll(value)}
              className="text-xs px-3 py-1.5 rounded-full border font-medium transition-colors hover:opacity-80"
              style={{ borderColor: "currentColor" }}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {STATUS_OPTIONS.map(({ value, label, cls }) => (
          <div key={value} className={`rounded-xl p-3 text-center border ${cls}`}>
            <p className="text-2xl font-bold">{counts[value] || 0}</p>
            <p className="text-xs font-medium">{label}</p>
          </div>
        ))}
      </div>

      {/* Attendance grid */}
      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Student</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden sm:table-cell">Roll</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden lg:table-cell">Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredStudents.map((s) => {
                const rec = draft[s.id];
                if (!rec) return null;
                return (
                  <tr key={s.id} className="hover:bg-gray-50/30">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={s.name} size="sm" />
                        <div>
                          <p className="font-medium text-gray-900">{s.name}</p>
                          <p className="text-xs text-gray-400">
                            Class {s.class}-{s.section}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs hidden sm:table-cell">
                      {s.rollNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1.5">
                        {STATUS_OPTIONS.map(({ value, label, cls }) => (
                          <button
                            key={value}
                            onClick={() => setStatus(s.id, value)}
                            className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all ${
                              rec.status === value
                                ? cls + " ring-2 ring-offset-1 ring-current"
                                : "bg-white text-gray-400 border-gray-200 hover:border-gray-300"
                            }`}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <input
                        className="input text-xs py-1.5"
                        placeholder="Optional note..."
                        value={rec.notes}
                        onChange={(e) => setNotes(s.id, e.target.value)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Save button at bottom */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all ${
            saved
              ? "bg-green-100 text-green-700"
              : "bg-blue-600 text-white hover:bg-blue-700"
          }`}
        >
          {saved ? (
            <>
              <CheckCircle2 size={16} />
              Attendance Saved
            </>
          ) : (
            <>
              <Save size={16} />
              Save Attendance
            </>
          )}
        </button>
      </div>
    </div>
  );
}
