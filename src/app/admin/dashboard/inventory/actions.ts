"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

async function saveImage(file: File | null): Promise<string | undefined> {
  if (!file || file.size === 0) return undefined;
  
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const mimeType = file.type || "image/jpeg";
  
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

export async function createInventoryItem(data: FormData) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") throw new Error("Unauthorized");

  const code = data.get("code") as string;
  const type = data.get("type") as string;
  const karat = data.get("karat") as string;
  const weight = parseFloat(data.get("weight") as string);
  const ongkos = parseFloat(data.get("ongkos") as string);
  const potongan = parseFloat(data.get("potongan") as string) || 0;
  const description = data.get("description") as string | null;
  const file = data.get("image") as File | null;

  if (!code || !type || !karat || !weight || !ongkos) throw new Error("Missing required fields");

  const existing = await prisma.inventory.findUnique({ where: { code } });
  if (existing) throw new Error("Kode Emas sudah terdaftar");

  const imageUrl = await saveImage(file);

  await prisma.inventory.create({
    data: {
      code, type, karat, weight, ongkos, potongan, status: "AVAILABLE", description, imageUrl
    }
  });

  revalidatePath("/admin/dashboard/inventory");
  return { success: true };
}

export async function updateInventoryItem(data: FormData) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") throw new Error("Unauthorized");

  const id = data.get("id") as string;
  if (!id) throw new Error("ID required");

  const payload: any = {};
  
  const status = data.get("status") as string;
  if (status) payload.status = status;
  
  const type = data.get("type") as string;
  if (type) payload.type = type;

  const karat = data.get("karat") as string;
  if (karat) payload.karat = karat;

  const weightStr = data.get("weight") as string;
  if (weightStr) payload.weight = parseFloat(weightStr);

  const ongkosStr = data.get("ongkos") as string;
  if (ongkosStr) payload.ongkos = parseFloat(ongkosStr);

  const potonganStr = data.get("potongan") as string;
  if (potonganStr !== null && potonganStr !== undefined && potonganStr !== "") {
    payload.potongan = parseFloat(potonganStr);
  }

  const description = data.get("description") as string | null;
  if (description !== null) payload.description = description;

  const file = data.get("image") as File | null;
  if (file && file.size > 0) {
    const imageUrl = await saveImage(file);
    if (imageUrl) payload.imageUrl = imageUrl;
  }

  await prisma.inventory.update({
    where: { id },
    data: payload
  });

  revalidatePath("/admin/dashboard/inventory");
  return { success: true };
}

export async function deleteInventoryItem(id: string) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") throw new Error("Unauthorized");

  // Only allow delete if not sold or used in transaction (Prisma relation will throw error if used, which is good)
  try {
    await prisma.inventory.delete({ where: { id } });
  } catch (err) {
    throw new Error("Gagal menghapus inventaris, barang mungkin sudah terlibat transaksi");
  }

  revalidatePath("/admin/dashboard/inventory");
  return { success: true };
}
