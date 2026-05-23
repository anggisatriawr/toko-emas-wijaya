"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function submitClockIn() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "EMPLOYEE") throw new Error("Unauthorized");
  const userId = (session.user as any).id;

  const today = new Date();
  today.setHours(0,0,0,0);

  const existing = await prisma.attendance.findFirst({
    where: { userId, date: { gte: today } }
  });

  if (existing) throw new Error("Anda sudah clock-in hari ini");

  await prisma.attendance.create({
    data: {
      userId,
      date: new Date(),
      clockIn: new Date(),
    }
  });

  revalidatePath("/employee/dashboard/attendance");
  revalidatePath("/admin/dashboard/attendance");
  revalidatePath("/employee/dashboard");
  return { success: true };
}

export async function submitClockOut() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "EMPLOYEE") throw new Error("Unauthorized");
  const userId = (session.user as any).id;

  const today = new Date();
  today.setHours(0,0,0,0);

  const existing = await prisma.attendance.findFirst({
    where: { userId, date: { gte: today } }
  });

  if (!existing) throw new Error("Tidak ada rekam jejak clock-in hari ini");
  if (existing.clockOut) throw new Error("Anda sudah menyelesaikan shift hari ini");

  await prisma.attendance.update({
    where: { id: existing.id },
    data: { clockOut: new Date() }
  });

  revalidatePath("/employee/dashboard/attendance");
  revalidatePath("/admin/dashboard/attendance");
  revalidatePath("/employee/dashboard");
  return { success: true };
}
