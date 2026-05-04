"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  Calendar,
  Clock,
} from "lucide-react";
import Link from "next/link";
import {
  getStudents,
  getAttendanceForDate,
  getAttendance,
} from "@/lib/store";
import { Student, AttendanceRecord } from "@/lib/types";
import StatusBadge from "@/components/StatusBadge";
import Avatar from "@/components/Avatar";

export default function Dashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [todayRecords, setTodayRecords] = useState<AttendanceRecord[]>([]);
  const [allRecords, setAllRecords] = useState<AttendanceRecord[]>([]);
  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    async function load() {
      const [s, t, all] = await Promise.all([
        getStudents(),
        getAttendanceForDate(today),
        getAttendance(),
      ]);
      setStudents(s);
      setTodayRecords(t);
      setAllRecords(all);
    }
    void load();
  }, [today]);

  const totalStudents = students.length;
  const presentToday = todayRecords.filter(
    (r) => r.status === "present" || r.status === "late"
  ).length;
  const absentToday = todayRecords.filter((r) => r.status === "absent").length;
  const markedToday = todayRecords.length;

  // Overall attendance rate (last 30 days)
  const presentRecords = allRecords.filter(
    (r) => r.status === "present" || r.status === "late"
  ).length;
  const rate =
    allRecords.length > 0
      ? Math.round((presentRecords / allRecords.length) * 100)
      : 0;

  // Recent activity: last 5 attendance records for today
  const recentActivity = todayRecords
    .slice(-5)
    .reverse()
    .map((r) => ({
      ...r,
      student: students.find((s) => s.id === r.studentId),
    }));

  const statsCards = [
    {
      title: "Total Students",
      value: totalStudents,
      icon: Users,
      color: "bg-blue-500",
      bg: "bg-blue-50",
      text: "text-blue-600",
    },
    {
      title: "Present Today",
      value: presentToday,
      icon: UserCheck,
      color: "bg-green-500",
      bg: "bg-green-50",
      text: "text-green-600",
      sub: markedToday > 0 ? `${markedToday} marked` : "Not marked yet",
    },
    {
      title: "Absent Today",
      value: absentToday,
      icon: UserX,
      color: "bg-red-500",
      bg: "bg-red-50",
      text: "text-red-600",
    },
    {
      title: "Attendance Rate",
      value: `${rate}%`,
      icon: TrendingUp,
      color: "bg-purple-500",
      bg: "bg-purple-50",
      text: "text-purple-600",
      sub: "Last 30 days",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5 flex items-center gap-1.5">
            <Calendar size={14} />
            {format(new Date(), "EEEE, MMMM d, yyyy")}
          </p>
        </div>
        <Link href="/attendance" className="btn-primary flex items-center gap-2">
          <ClockIcon />
          Mark Attendance
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((card) => (
          <div key={card.title} className="card">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm text-gray-500 font-medium">{card.title}</p>
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <card.icon size={18} className={card.text} />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
            {card.sub && (
              <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Today's attendance summary */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">
              Today&apos;s Attendance
            </h2>
            {markedToday === 0 && (
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                Not marked yet
              </span>
            )}
          </div>
          {markedToday === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <ClipboardIcon className="mx-auto mb-2 opacity-40" />
              <p className="text-sm">No attendance marked for today.</p>
              <Link href="/attendance" className="btn-primary mt-3 inline-flex">
                Mark Now
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Progress bar */}
              <div>
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Present</span>
                  <span>
                    {presentToday}/{totalStudents}
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{
                      width: `${
                        totalStudents > 0
                          ? (presentToday / totalStudents) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3 pt-2">
                {[
                  {
                    label: "Present",
                    count: todayRecords.filter((r) => r.status === "present")
                      .length,
                    cls: "text-green-600 bg-green-50",
                  },
                  {
                    label: "Absent",
                    count: absentToday,
                    cls: "text-red-600 bg-red-50",
                  },
                  {
                    label: "Late",
                    count: todayRecords.filter((r) => r.status === "late")
                      .length,
                    cls: "text-yellow-600 bg-yellow-50",
                  },
                ].map(({ label, count, cls }) => (
                  <div key={label} className={`rounded-lg p-3 text-center ${cls}`}>
                    <p className="text-2xl font-bold">{count}</p>
                    <p className="text-xs font-medium">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Recent students */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-800">Students</h2>
            <Link
              href="/students"
              className="text-blue-600 text-sm hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="space-y-2">
            {students.slice(0, 5).map((s) => {
              const rec = todayRecords.find((r) => r.studentId === s.id);
              return (
                <Link
                  key={s.id}
                  href={`/students/${s.id}`}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Avatar name={s.name} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {s.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      Roll {s.rollNumber} · Class {s.class}-{s.section}
                    </p>
                  </div>
                  {rec ? (
                    <StatusBadge status={rec.status} />
                  ) : (
                    <span className="text-xs text-gray-300">—</span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ClockIcon() {
  return <Clock size={16} />;
}

function ClipboardIcon({ className }: { className?: string }) {
  return (
    <svg
      className={`w-10 h-10 ${className}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
      />
    </svg>
  );
}
