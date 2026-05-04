"use client";

import { useEffect, useState } from "react";
import { UserPlus, Pencil, Trash2, Eye, Search } from "lucide-react";
import Link from "next/link";
import { getTeachers, addTeacher, updateTeacher, deleteTeacher } from "@/lib/store";
import { TeacherWithProfile } from "@/lib/types";
import Avatar from "@/components/Avatar";
import TeacherModal from "@/components/TeacherModal";

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<TeacherWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<TeacherWithProfile | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<TeacherWithProfile | null>(null);

  async function reload() {
    setLoading(true);
    setTeachers(await getTeachers());
    setLoading(false);
  }

  useEffect(() => { void reload(); }, []);

  const filtered = teachers.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase()) ||
      t.subjects.join(" ").toLowerCase().includes(search.toLowerCase())
  );

  async function handleSave(data: Omit<TeacherWithProfile, "id"> & { password: string }) {
    if (editing) {
      await updateTeacher(editing.id, data);
    } else {
      await addTeacher(data);
    }
    setModalOpen(false);
    setEditing(null);
    void reload();
  }

  async function handleDelete(t: TeacherWithProfile) {
    await deleteTeacher(t.id);
    setDeleteTarget(null);
    void reload();
  }

  function openAdd() {
    setEditing(null);
    setModalOpen(true);
  }

  function openEdit(t: TeacherWithProfile) {
    setEditing(t);
    setModalOpen(true);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teachers</h1>
          <p className="text-gray-500 text-sm mt-0.5">{teachers.length} teacher{teachers.length !== 1 ? "s" : ""} registered</p>
        </div>
        <button onClick={openAdd} className="btn-primary flex items-center gap-2">
          <UserPlus size={16} />
          Add Teacher
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          className="input pl-9"
          placeholder="Search by name, email or subject…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center">
            <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-sm">
              {search ? "No teachers match your search." : "No teachers yet. Click \"Add Teacher\" to get started."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-6 py-3 text-gray-500 font-medium">Teacher</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium hidden md:table-cell">Subjects</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium hidden lg:table-cell">Classes</th>
                  <th className="text-left px-6 py-3 text-gray-500 font-medium hidden lg:table-cell">Qualification</th>
                  <th className="px-6 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={t.name} size="sm" />
                        <div>
                          <p className="font-medium text-gray-900">{t.name}</p>
                          <p className="text-xs text-gray-400">{t.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {t.subjects.length > 0 ? (
                          t.subjects.map((s) => (
                            <span key={s} className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-full">
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell text-gray-600">
                      {t.classesAssigned.length > 0 ? t.classesAssigned.join(", ") : "—"}
                    </td>
                    <td className="px-6 py-4 hidden lg:table-cell text-gray-600">
                      {t.qualification || "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 justify-end">
                        <Link
                          href={`/teachers/${t.id}`}
                          className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View profile"
                        >
                          <Eye size={15} />
                        </Link>
                        <button
                          onClick={() => openEdit(t)}
                          className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(t)}
                          className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit modal */}
      {modalOpen && (
        <TeacherModal
          teacher={editing}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditing(null); }}
        />
      )}

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">Delete Teacher</h3>
            <p className="text-sm text-gray-500 mb-5">
              Are you sure you want to remove <strong>{deleteTarget.name}</strong>?
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button className="btn-secondary flex-1" onClick={() => setDeleteTarget(null)}>
                Cancel
              </button>
              <button className="btn-danger flex-1" onClick={() => handleDelete(deleteTarget)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
