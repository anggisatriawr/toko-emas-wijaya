"use server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function createEmployee(data: FormData) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") throw new Error("Unauthorized");

  const name = data.get("name") as string;
  const username = data.get("username") as string;
  const password = data.get("password") as string;

  if (!name || !username || !password) throw new Error("All fields are required");

  if (!/^[a-zA-Z0-9]+$/.test(password)) {
    throw new Error("Password hanya boleh berisi huruf dan angka");
  }

  // Check if username exists
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) throw new Error("Username already taken");

  const hashedPassword = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      name,
      username,
      password: hashedPassword,
      role: "EMPLOYEE",
      isActive: true,
    }
  });

  revalidatePath("/admin/dashboard/employees");
  return { success: true };
}

export async function updateEmployee(userId: string, data: FormData) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") throw new Error("Unauthorized");

  const name = data.get("name") as string;
  const password = data.get("password") as string;
  const isActiveStr = data.get("isActive") as string;
  
  const updateData: any = { name, isActive: isActiveStr === "true" };

  if (password) {
    if (!/^[a-zA-Z0-9]+$/.test(password)) {
      throw new Error("Password hanya boleh berisi huruf dan angka");
    }
    updateData.password = await bcrypt.hash(password, 10);
  }

  await prisma.user.update({
    where: { id: userId },
    data: updateData,
  });

  revalidatePath("/admin/dashboard/employees");
  return { success: true };
}

export async function deleteEmployee(userId: string) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") throw new Error("Unauthorized");

  // Soft delete instead of hard delete to preserve transaction history
  await prisma.user.update({
    where: { id: userId },
    data: { isActive: false, username: `deleted_${Date.now()}_${userId}` }, // Free up username
  });

  revalidatePath("/admin/dashboard/employees");
  return { success: true };
}
