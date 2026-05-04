"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ClipboardCheck,
  BarChart2,
  GraduationCap,
  UserCog,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { useState, useEffect } from "react";
import { getSession, logout, User } from "@/lib/auth";

const TEACHER_NAV = [
  { href: "/",           label: "Dashboard", icon: LayoutDashboard },
  { href: "/students",   label: "Students",  icon: Users },
  { href: "/attendance", label: "Attendance",icon: ClipboardCheck },
  { href: "/reports",    label: "Reports",   icon: BarChart2 },
];

const MANAGER_NAV = [
  { href: "/",         label: "Dashboard", icon: LayoutDashboard },
  { href: "/teachers", label: "Teachers",  icon: UserCog },
  { href: "/reports",  label: "Reports",   icon: BarChart2 },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(getSession());
  }, []);

  const navItems = user?.role === "manager" ? MANAGER_NAV : TEACHER_NAV;

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-blue-700 text-white lg:hidden shadow-md"
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 bg-gradient-to-b from-blue-900 to-blue-800
          text-white flex flex-col shadow-xl
          transform transition-transform duration-200
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-blue-700">
          <div className="p-2 bg-blue-700 rounded-lg">
            <GraduationCap size={22} />
          </div>
          <div>
            <p className="font-bold text-base leading-tight">EduAttend</p>
            <p className="text-blue-300 text-xs">Attendance Manager</p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active =
              href === "/" ? pathname === "/" : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${
                    active
                      ? "bg-white/20 text-white shadow-sm"
                      : "text-blue-200 hover:bg-white/10 hover:text-white"
                  }
                `}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* User info + logout */}
        <div className="px-4 py-4 border-t border-blue-700 space-y-2">
          {user && (
            <div className="flex items-center gap-3 px-2 py-1">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  user.role === "manager" ? "bg-amber-600" : "bg-blue-600"
                }`}
              >
                {user.initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.name}</p>
                <p className="text-blue-300 text-xs truncate capitalize">
                  {user.role === "manager"
                    ? "School Manager"
                    : user.classes || user.subject || "Teacher"}
                </p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-blue-200 hover:bg-white/10 hover:text-white transition-all"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
