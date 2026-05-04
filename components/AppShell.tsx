"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { isAuthenticated, getRole } from "@/lib/auth";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);

  const isLoginPage = pathname === "/login";

  useEffect(() => {
    if (isLoginPage) {
      setChecking(false);
      return;
    }

    if (!isAuthenticated()) {
      router.replace("/login");
      return;
    }

    const role = getRole();

    // Manager accessing teacher-only routes → redirect to /teachers
    if (
      role === "manager" &&
      (pathname.startsWith("/students") || pathname.startsWith("/attendance"))
    ) {
      router.replace("/teachers");
      return;
    }

    // Teacher accessing manager-only routes → redirect to /
    if (role === "teacher" && pathname.startsWith("/teachers")) {
      router.replace("/");
      return;
    }

    setChecking(false);
  }, [isLoginPage, pathname, router]);

  if (isLoginPage) {
    return <>{children}</>;
  }

  if (checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">{children}</div>
      </main>
    </div>
  );
}
