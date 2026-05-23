import { prisma } from "@/lib/prisma";
import { AttendanceClient } from "./AttendanceClient";

export default async function AttendanceMonitoringPage() {
  // Ambil list semua pegawai
  const allEmployees = await prisma.user.findMany({
    where: { role: "EMPLOYEE", isActive: true }
  });

  // Ambil semua data absensi untuk dikalkulasi secara dinamis di Client
  const allAttendances = await prisma.attendance.findMany({
    include: {
      user: true,
    },
    orderBy: { clockIn: "asc" }
  });

  return (
    <AttendanceClient 
      allEmployees={allEmployees} 
      allAttendances={allAttendances} 
    />
  );
}
