import { AttendanceStatus } from "@/lib/types";

export default function StatusBadge({ status }: { status: AttendanceStatus }) {
  const map: Record<AttendanceStatus, string> = {
    present: "badge-present",
    absent: "badge-absent",
    late: "badge-late",
    excused: "badge-excused",
  };
  const labels: Record<AttendanceStatus, string> = {
    present: "Present",
    absent: "Absent",
    late: "Late",
    excused: "Excused",
  };
  return <span className={map[status]}>{labels[status]}</span>;
}
