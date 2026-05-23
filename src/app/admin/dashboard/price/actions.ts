"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function setDailyPrice(data: FormData) {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") throw new Error("Unauthorized");

  const sellPerGram = parseFloat(data.get("sellPerGram") as string);
  const buyPerGram = parseFloat(data.get("buyPerGram") as string);

  if (!sellPerGram || !buyPerGram) throw new Error("Form belum lengkap");

  const today = new Date();
  today.setHours(0,0,0,0);

  // Check if today exists
  const existing = await prisma.dailyPrice.findUnique({ where: { date: today } });

  if (existing) {
    await prisma.dailyPrice.update({
      where: { date: today },
      data: { sellPerGram, buyPerGram }
    });
  } else {
    await prisma.dailyPrice.create({
      data: { date: today, sellPerGram, buyPerGram }
    });
  }

  revalidatePath("/admin/dashboard/price");
  revalidatePath("/employee/dashboard/pos");
  revalidatePath("/");
  return { success: true };
}

export async function syncDailyPriceAction() {
  const session = await getServerSession(authOptions);
  if ((session?.user as any)?.role !== "ADMIN") throw new Error("Unauthorized");

  try {
    // Delete today's price first so getOrSyncDailyPrice fetches fresh
    const today = new Date();
    today.setHours(0,0,0,0);
    
    await prisma.dailyPrice.deleteMany({
      where: { date: today }
    });

    const { getOrSyncDailyPrice } = await import('@/lib/price');
    await getOrSyncDailyPrice();

    revalidatePath("/admin/dashboard/price");
    revalidatePath("/employee/dashboard/pos");
    revalidatePath("/");
    
    return { success: true };
  } catch (err: any) {
    throw new Error("Gagal sinkronisasi dari API: " + err.message);
  }
}
