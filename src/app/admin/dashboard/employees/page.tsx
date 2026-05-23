import { prisma } from "@/lib/prisma";
import { EmployeeClient } from "./EmployeeClient";

export default async function EmployeesPage() {
  const employees = await prisma.user.findMany({
    where: { 
      role: "EMPLOYEE",
      username: {
        not: {
          startsWith: "deleted_"
        }
      }
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Manajemen Karyawan</h2>
      <EmployeeClient employees={employees} />
    </div>
  );
}
