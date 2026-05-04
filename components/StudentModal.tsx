"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Student } from "@/lib/types";

interface Props {
  student: Student | null;
  onSave: (data: Omit<Student, "id">) => void;
  onClose: () => void;
}

const EMPTY: Omit<Student, "id"> = {
  name: "",
  rollNumber: "",
  class: "10",
  section: "A",
  email: "",
  phone: "",
  parentName: "",
  parentPhone: "",
  address: "",
  joinDate: new Date().toISOString().split("T")[0],
};

export default function StudentModal({ student, onSave, onClose }: Props) {
  const [form, setForm] = useState<Omit<Student, "id">>(
    student ? { ...student } : { ...EMPTY }
  );
  const [errors, setErrors] = useState<Partial<Record<keyof Student, string>>>({});

  function set(field: keyof Omit<Student, "id">, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  }

  function validate(): boolean {
    const e: Partial<Record<keyof Student, string>> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!form.rollNumber.trim()) e.rollNumber = "Roll number is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.parentName.trim()) e.parentName = "Parent name is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (validate()) onSave(form);
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg my-4">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">
            {student ? "Edit Student" : "Add New Student"}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Full Name *</label>
              <input
                className={`input ${errors.name ? "border-red-400" : ""}`}
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="e.g. Alice Johnson"
              />
              {errors.name && (
                <p className="text-red-500 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="label">Roll Number *</label>
              <input
                className={`input ${errors.rollNumber ? "border-red-400" : ""}`}
                value={form.rollNumber}
                onChange={(e) => set("rollNumber", e.target.value)}
                placeholder="e.g. A001"
              />
              {errors.rollNumber && (
                <p className="text-red-500 text-xs mt-1">{errors.rollNumber}</p>
              )}
            </div>

            <div>
              <label className="label">Email *</label>
              <input
                type="email"
                className={`input ${errors.email ? "border-red-400" : ""}`}
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                placeholder="student@school.edu"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="label">Class</label>
              <select
                className="input"
                value={form.class}
                onChange={(e) => set("class", e.target.value)}
              >
                {["8", "9", "10", "11", "12"].map((c) => (
                  <option key={c} value={c}>Class {c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Section</label>
              <select
                className="input"
                value={form.section}
                onChange={(e) => set("section", e.target.value)}
              >
                {["A", "B", "C", "D"].map((s) => (
                  <option key={s} value={s}>Section {s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Phone</label>
              <input
                className="input"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                placeholder="555-0101"
              />
            </div>

            <div>
              <label className="label">Join Date</label>
              <input
                type="date"
                className="input"
                value={form.joinDate}
                onChange={(e) => set("joinDate", e.target.value)}
              />
            </div>

            <div>
              <label className="label">Parent Name *</label>
              <input
                className={`input ${errors.parentName ? "border-red-400" : ""}`}
                value={form.parentName}
                onChange={(e) => set("parentName", e.target.value)}
                placeholder="Parent full name"
              />
              {errors.parentName && (
                <p className="text-red-500 text-xs mt-1">{errors.parentName}</p>
              )}
            </div>

            <div>
              <label className="label">Parent Phone</label>
              <input
                className="input"
                value={form.parentPhone}
                onChange={(e) => set("parentPhone", e.target.value)}
                placeholder="555-0102"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="label">Address</label>
              <textarea
                className="input resize-none"
                rows={2}
                value={form.address}
                onChange={(e) => set("address", e.target.value)}
                placeholder="123 Main Street, City"
              />
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {student ? "Save Changes" : "Add Student"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
