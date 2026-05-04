"use client";

import { useEffect, useState } from "react";
import { format, parseISO, subDays } from "date-fns";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { TrendingUp, TrendingDown, Award, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { getStudents, getAttendance } from "@/lib/store";
import { Student, AttendanceRecord } from "@/lib/types";
import Avatar from "@/components/Avatar";

interface StudentStat {
  student: Student;
  total: number;
  present: number;
  absent: number;
  late: number;
  rate: number;
}

export default function ReportsPage() {
  const [stats, setStats] = useState<StudentStat[]>([]);
  const [weeklyData, setWeeklyData] = useState<
    { date: string; present: number; absent: number; late: number }[]
  >([]);

  useEffect(() => {
    const students = getStudents();
    const records = getAttendance();

    // Per-student stats
    const studentStats: StudentStat[] = students.map((s) => {
      const recs = records.filter((r) => r.studentId === s.id);
      const present = recs.filter((r) => r.status === "present").length;
      const absent = recs.filter((r) => r.status === "absent").length;
      const late = recs.filter((r) => r.status === "late").length;
      const total = recs.length;
      const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0;
      return { student: s, total, present, absent, late, rate };
    });
    setStats(studentStats.sort((a, b) => b.rate - a.rate));

    // Weekly data (last 7 weekdays)
    const today = new Date();
    const weekly: typeof weeklyData = [];
    let counted = 0;
    let offset = 0;
    while (counted < 7) {
      const d = subDays(today, offset);
      offset++;
      if (d.getDay() === 0 || d.getDay() === 6) continue;
      const dateStr = d.toISOString().split("T")[0];
      const dayRecs = records.filter((r) => r.date === dateStr);
      weekly.unshift({
        date: format(d, "EEE d"),
        present: dayRecs.filter((r) => r.status === "present").length,
        absent: dayRecs.filter((r) => r.status === "absent").length,
        late: dayRecs.filter((r) => r.status === "late").length,
      });
      counted++;
    }
    setWeeklyData(weekly);
  }, []);

  const avgRate =
    stats.length > 0
      ? Math.round(stats.reduce((s, r) => s + r.rate, 0) / stats.length)
      : 0;

  const perfect = stats.filter((s) => s.rate === 100).length;
  const atRisk = stats.filter((s) => s.rate < 75).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500 text-sm mt-0.5">
          Attendance analytics &amp; insights
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-blue-50 rounded-xl">
            <TrendingUp size={20} className="text-blue-600" />
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{avgRate}%</p>
            <p className="text-sm text-gray-500">Average Rate</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-green-50 rounded-xl">
            <Award size={20} className="text-green-600" />
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{perfect}</p>
            <p className="text-sm text-gray-500">Perfect Attendance</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div className="p-3 bg-red-50 rounded-xl">
            <AlertTriangle size={20} className="text-red-600" />
          </div>
          <div>
            <p className="text-3xl font-bold text-gray-900">{atRisk}</p>
            <p className="text-sm text-gray-500">At Risk (&lt;75%)</p>
          </div>
        </div>
      </div>

      {/* Weekly chart */}
      <div className="card">
        <h2 className="font-semibold text-gray-800 mb-4">Last 7 School Days</h2>
        {weeklyData.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No data yet.</p>
        ) : (
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={weeklyData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="present" name="Present" fill="#22c55e" radius={[4, 4, 0, 0]} />
              <Bar dataKey="late" name="Late" fill="#eab308" radius={[4, 4, 0, 0]} />
              <Bar dataKey="absent" name="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Student ranking */}
      <div className="card !p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-800">Student Attendance Ranking</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-gray-500 font-medium w-8">#</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Student</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden sm:table-cell">Present</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden sm:table-cell">Absent</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden sm:table-cell">Late</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Rate</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden md:table-cell">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {stats.map((s, i) => (
                <tr key={s.student.id} className="hover:bg-gray-50/50">
                  <td className="px-4 py-3 text-gray-400 font-medium">{i + 1}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/students/${s.student.id}`}
                      className="flex items-center gap-3 hover:text-blue-600"
                    >
                      <Avatar name={s.student.name} size="sm" />
                      <div>
                        <p className="font-medium text-gray-900">{s.student.name}</p>
                        <p className="text-xs text-gray-400">{s.student.rollNumber}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-green-600 hidden sm:table-cell">{s.present}</td>
                  <td className="px-4 py-3 text-red-600 hidden sm:table-cell">{s.absent}</td>
                  <td className="px-4 py-3 text-yellow-600 hidden sm:table-cell">{s.late}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 bg-gray-100 rounded-full h-1.5 hidden sm:block">
                        <div
                          className={`h-1.5 rounded-full ${
                            s.rate >= 90
                              ? "bg-green-500"
                              : s.rate >= 75
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          }`}
                          style={{ width: `${s.rate}%` }}
                        />
                      </div>
                      <span
                        className={`font-semibold ${
                          s.rate >= 90
                            ? "text-green-600"
                            : s.rate >= 75
                            ? "text-yellow-600"
                            : "text-red-600"
                        }`}
                      >
                        {s.rate}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    {s.rate >= 90 ? (
                      <span className="flex items-center gap-1 text-green-600 text-xs">
                        <TrendingUp size={12} /> Good
                      </span>
                    ) : s.rate < 75 ? (
                      <span className="flex items-center gap-1 text-red-600 text-xs">
                        <AlertTriangle size={12} /> At Risk
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-yellow-600 text-xs">
                        <TrendingDown size={12} /> Average
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
