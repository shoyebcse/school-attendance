"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { TeacherWithProfile } from "@/lib/types";

type FormData = {
  name: string;
  email: string;
  password: string;
  qualification: string;
  subjectsRaw: string;      // comma-separated, split on save
  phone: string;
  address: string;
  classesRaw: string;       // comma-separated, split on save
  bio: string;
  joiningDate: string;
};

type SavePayload = Omit<TeacherWithProfile, "id"> & { password: string };

interface Props {
  teacher?: TeacherWithProfile | null;
  onSave: (data: SavePayload) => void;
  onClose: () => void;
}

function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

export default function TeacherModal({ teacher, onSave, onClose }: Props) {
  const isEdit = !!teacher;

  const [form, setForm] = useState<FormData>({
    name: teacher?.name ?? "",
    email: teacher?.email ?? "",
    password: "",
    qualification: teacher?.qualification ?? "",
    subjectsRaw: teacher?.subjects.join(", ") ?? "",
    phone: teacher?.phone ?? "",
    address: teacher?.address ?? "",
    classesRaw: teacher?.classesAssigned.join(", ") ?? "",
    bio: teacher?.bio ?? "",
    joiningDate: teacher?.joiningDate ?? "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});
  const [saving, setSaving] = useState(false);

  // Keep form in sync if teacher prop changes (e.g. modal re-used)
  useEffect(() => {
    setForm({
      name: teacher?.name ?? "",
      email: teacher?.email ?? "",
      password: "",
      qualification: teacher?.qualification ?? "",
      subjectsRaw: teacher?.subjects.join(", ") ?? "",
      phone: teacher?.phone ?? "",
      address: teacher?.address ?? "",
      classesRaw: teacher?.classesAssigned.join(", ") ?? "",
      bio: teacher?.bio ?? "",
      joiningDate: teacher?.joiningDate ?? "",
    });
    setErrors({});
  }, [teacher]);

  function set(field: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  }

  function validate(): boolean {
    const errs: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim()) errs.name = "Name is required.";
    if (!form.email.trim()) {
      errs.email = "Email is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = "Enter a valid email address.";
    }
    if (!isEdit && !form.password.trim()) errs.password = "Password is required.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);

    const splitTrim = (s: string) =>
      s.split(",").map((v) => v.trim()).filter(Boolean);

    onSave({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      initials: initials(form.name),
      qualification: form.qualification.trim(),
      subjects: splitTrim(form.subjectsRaw),
      phone: form.phone.trim(),
      address: form.address.trim(),
      classesAssigned: splitTrim(form.classesRaw),
      bio: form.bio.trim(),
      joiningDate: form.joiningDate,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? "Edit Teacher" : "Add New Teacher"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          {/* Name */}
          <div>
            <label className="label">Full Name *</label>
            <input
              className="input"
              placeholder="Ms. Jane Smith"
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="label">Email Address *</label>
            <input
              type="email"
              className="input"
              placeholder="jane@school.edu"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="label">
              Password {isEdit ? "(leave blank to keep unchanged)" : "*"}
            </label>
            <input
              type="password"
              className="input"
              placeholder={isEdit ? "Enter new password to change" : "Set login password"}
              value={form.password}
              onChange={(e) => set("password", e.target.value)}
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          {/* Qualification */}
          <div>
            <label className="label">Qualification</label>
            <input
              className="input"
              placeholder="e.g. M.Sc. Mathematics"
              value={form.qualification}
              onChange={(e) => set("qualification", e.target.value)}
            />
          </div>

          {/* Subjects */}
          <div>
            <label className="label">Subjects (comma-separated)</label>
            <input
              className="input"
              placeholder="e.g. Mathematics, Physics"
              value={form.subjectsRaw}
              onChange={(e) => set("subjectsRaw", e.target.value)}
            />
          </div>

          {/* Phone */}
          <div>
            <label className="label">Phone</label>
            <input
              className="input"
              placeholder="+1-555-0100"
              value={form.phone}
              onChange={(e) => set("phone", e.target.value)}
            />
          </div>

          {/* Classes Assigned */}
          <div>
            <label className="label">Classes Assigned (comma-separated)</label>
            <input
              className="input"
              placeholder="e.g. 10-A, 10-B, 11-A"
              value={form.classesRaw}
              onChange={(e) => set("classesRaw", e.target.value)}
            />
          </div>

          {/* Joining Date */}
          <div>
            <label className="label">Joining Date</label>
            <input
              type="date"
              className="input"
              value={form.joiningDate}
              onChange={(e) => set("joiningDate", e.target.value)}
            />
          </div>

          {/* Address */}
          <div>
            <label className="label">Address</label>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="123 School St, City"
              value={form.address}
              onChange={(e) => set("address", e.target.value)}
            />
          </div>

          {/* Bio */}
          <div>
            <label className="label">Bio / Notes</label>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="Short bio or additional notes…"
              value={form.bio}
              onChange={(e) => set("bio", e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1 disabled:opacity-60"
            >
              {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Teacher"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
