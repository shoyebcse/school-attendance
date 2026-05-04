"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Pencil, Trash2, Eye } from "lucide-react";
import Link from "next/link";
import { getStudents, addStudent, updateStudent, deleteStudent, generateId } from "@/lib/store";
import { Student } from "@/lib/types";
import Avatar from "@/components/Avatar";
import StudentModal from "@/components/StudentModal";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState("");
  const [filterClass, setFilterClass] = useState("");
  const [filterSection, setFilterSection] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  function reload() {
    setStudents(getStudents());
  }

  useEffect(() => {
    reload();
  }, []);

  const classes = [...new Set(students.map((s) => s.class))].sort();
  const sections = [...new Set(students.map((s) => s.section))].sort();

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      s.name.toLowerCase().includes(q) ||
      s.rollNumber.toLowerCase().includes(q) ||
      s.email.toLowerCase().includes(q);
    const matchClass = !filterClass || s.class === filterClass;
    const matchSection = !filterSection || s.section === filterSection;
    return matchSearch && matchClass && matchSection;
  });

  function handleSave(data: Omit<Student, "id">) {
    if (editStudent) {
      updateStudent({ ...data, id: editStudent.id });
    } else {
      addStudent({ ...data, id: generateId() });
    }
    setModalOpen(false);
    setEditStudent(null);
    reload();
  }

  function handleDelete(id: string) {
    deleteStudent(id);
    setDeleteConfirm(null);
    reload();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-500 text-sm mt-0.5">
            {filtered.length} of {students.length} students
          </p>
        </div>
        <button
          onClick={() => { setEditStudent(null); setModalOpen(true); }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="card !p-4 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="input pl-9"
            placeholder="Search by name, roll number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input w-auto min-w-[130px]"
          value={filterClass}
          onChange={(e) => setFilterClass(e.target.value)}
        >
          <option value="">All Classes</option>
          {classes.map((c) => (
            <option key={c} value={c}>Class {c}</option>
          ))}
        </select>
        <select
          className="input w-auto min-w-[130px]"
          value={filterSection}
          onChange={(e) => setFilterSection(e.target.value)}
        >
          <option value="">All Sections</option>
          {sections.map((s) => (
            <option key={s} value={s}>Section {s}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="card !p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Student</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium">Roll No.</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden sm:table-cell">Class</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden md:table-cell">Contact</th>
                <th className="text-left px-4 py-3 text-gray-500 font-medium hidden lg:table-cell">Parent</th>
                <th className="text-right px-4 py-3 text-gray-500 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-gray-400">
                    No students found.{" "}
                    {search && (
                      <button
                        className="text-blue-600 hover:underline"
                        onClick={() => setSearch("")}
                      >
                        Clear search
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={s.name} size="sm" />
                        <div>
                          <p className="font-medium text-gray-900">{s.name}</p>
                          <p className="text-xs text-gray-400">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-mono">{s.rollNumber}</td>
                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">
                      {s.class}-{s.section}
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden md:table-cell">{s.phone}</td>
                    <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                      <div>
                        <p className="text-xs">{s.parentName}</p>
                        <p className="text-xs text-gray-400">{s.parentPhone}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/students/${s.id}`}
                          className="p-1.5 rounded-lg hover:bg-blue-50 text-blue-600 transition-colors"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </Link>
                        <button
                          onClick={() => { setEditStudent(s); setModalOpen(true); }}
                          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(s.id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {modalOpen && (
        <StudentModal
          student={editStudent}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditStudent(null); }}
        />
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl p-6 max-w-sm w-full">
            <h3 className="font-semibold text-gray-900 mb-2">Delete Student?</h3>
            <p className="text-sm text-gray-500 mb-5">
              This will permanently delete the student and all their attendance
              records. This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="btn-danger"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
