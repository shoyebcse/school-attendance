"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, BookOpen, GraduationCap, Pencil } from "lucide-react";
import Link from "next/link";
import { getTeacherById, updateTeacher } from "@/lib/store";
import { TeacherWithProfile } from "@/lib/types";
import Avatar from "@/components/Avatar";
import TeacherModal from "@/components/TeacherModal";

export default function TeacherDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [teacher, setTeacher] = useState<TeacherWithProfile | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  async function reload() {
    const t = await getTeacherById(id);
    if (!t) { router.push("/teachers"); return; }
    setTeacher(t);
  }

  useEffect(() => { void reload(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!teacher) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  async function handleSave(data: Omit<TeacherWithProfile, "id"> & { password: string }) {
    await updateTeacher(teacher!.id, data);
    setEditOpen(false);
    void reload();
  }

  return (
    <div className="space-y-6">
      {/* Back + Edit */}
      <div className="flex items-center justify-between">
        <Link
          href="/teachers"
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 text-sm"
        >
          <ArrowLeft size={16} />
          Back to Teachers
        </Link>
        <button onClick={() => setEditOpen(true)} className="btn-secondary flex items-center gap-2">
          <Pencil size={14} />
          Edit
        </button>
      </div>

      {/* Profile card */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-5">
          <Avatar name={teacher.name} size="lg" />
          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <h1 className="text-xl font-bold text-gray-900">{teacher.name}</h1>
                <p className="text-gray-500 text-sm">{teacher.email}</p>
              </div>
              <span className="px-3 py-1 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                Teacher
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
              {teacher.phone && (
                <InfoRow icon={<Phone size={14} />} label={teacher.phone} />
              )}
              {teacher.address && (
                <InfoRow icon={<MapPin size={14} />} label={teacher.address} />
              )}
              {teacher.joiningDate && (
                <InfoRow icon={<Calendar size={14} />} label={`Joined ${teacher.joiningDate}`} />
              )}
              {teacher.qualification && (
                <InfoRow icon={<GraduationCap size={14} />} label={teacher.qualification} />
              )}
              <InfoRow icon={<Mail size={14} />} label={teacher.email} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subjects */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={16} className="text-blue-500" />
            <h2 className="font-semibold text-gray-800">Subjects</h2>
          </div>
          {teacher.subjects.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {teacher.subjects.map((s) => (
                <span key={s} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
                  {s}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No subjects assigned.</p>
          )}
        </div>

        {/* Classes */}
        <div className="card">
          <div className="flex items-center gap-2 mb-4">
            <GraduationCap size={16} className="text-purple-500" />
            <h2 className="font-semibold text-gray-800">Classes Assigned</h2>
          </div>
          {teacher.classesAssigned.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {teacher.classesAssigned.map((c) => (
                <span key={c} className="px-3 py-1 bg-purple-50 text-purple-700 text-sm font-medium rounded-full">
                  {c}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-400">No classes assigned.</p>
          )}
        </div>
      </div>

      {/* Bio */}
      {teacher.bio && (
        <div className="card">
          <h2 className="font-semibold text-gray-800 mb-2">Bio</h2>
          <p className="text-sm text-gray-600 leading-relaxed">{teacher.bio}</p>
        </div>
      )}

      {editOpen && (
        <TeacherModal
          teacher={teacher}
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
      <span className="truncate">{label}</span>
    </div>
  );
}
