import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { AttendanceClient } from "./AttendanceClient";

export default async function AttendancePage() {
  const session = await getServerSession(authOptions);
  const employeeId = (session?.user as any)?.id;

  const today = new Date();
  today.setHours(0,0,0,0);

  // Cek apakah hari ini sudah absen
  const todayRecord = await prisma.attendance.findFirst({
    where: { userId: employeeId, date: { gte: today } }
  });

  // Ambil history sebulan terakhir
  const history = await prisma.attendance.findMany({
    where: { userId: employeeId },
    orderBy: { date: "desc" },
    take: 30
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Portal Kehadiran Pegawai</h2>
      <AttendanceClient todayRecord={todayRecord} history={history} />
    </div>
  );
}
