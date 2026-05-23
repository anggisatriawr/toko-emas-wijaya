"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function searchTransactionsByQuery(query: string) {
  const today = new Date();
  today.setHours(0,0,0,0);
  const dailyPrice = await prisma.dailyPrice.findUnique({ where: { date: today } });
  
  if (!dailyPrice) return { success: false, error: "Harga Emas (Beli) hari ini belum diatur oleh Admin." };

  // Search by multiple fields using OR
  const transactions = await prisma.transaction.findMany({
    where: {
      OR: [
        { invoice: { contains: query } },
        { customer: { name: { contains: query } } },
        { customer: { phone: { contains: query } } },
        { customer: { address: { contains: query } } },
      ],
      // Only return transactions that DO NOT have a Buyback record yet
      buyback: null,
    },
    include: {
      customer: true,
      inventory: true,
    },
    orderBy: { createdAt: "desc" },
    take: 20
  });

  if (transactions.length === 0) {
    return { success: false, error: "Data transaksi tidak ditemukan, atau barang (kuitansi) mungkin sudah pernah diserahkan kembali (Buyback) sebelumnya kepada Toko." };
  }

  // Pre-calculate the potential buyback nominal for all returned transactions to simplify the client
  const mappedResults = transactions.map(t => ({
    ...t,
    totalBuyback: t.weight * dailyPrice.buyPerGram
  }));

  return {
    success: true,
    transactions: mappedResults,
    buyPerGram: dailyPrice.buyPerGram
  };
}

export async function processBuyback(transactionId: string, actualWeight: number, damagePenalty: number) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "EMPLOYEE") throw new Error("Unauthorized");

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { inventory: true }
  });

  if (!transaction) throw new Error("Transaksi tidak valid");

  const today = new Date();
  today.setHours(0,0,0,0);
  const dailyPrice = await prisma.dailyPrice.findUnique({ where: { date: today } });
  if (!dailyPrice) throw new Error("Harga Emas (Beli) hari ini belum diatur oleh Admin.");

  const grossBuyback = actualWeight * dailyPrice.buyPerGram;
  const totalBuyback = grossBuyback - damagePenalty;
  const deduction = transaction.totalPrice - totalBuyback; // Loss for customer

  await prisma.$transaction(async (tx) => {
    // Creat Buyback record
    await tx.buyback.create({
      data: {
        transactionId: transaction.id,
        customerId: transaction.customerId,
        userId: (session.user as any).id,
        inventoryId: transaction.inventoryId,
        actualWeight: actualWeight, 
        pricePerGram: dailyPrice.buyPerGram,
        deduction: deduction > 0 ? deduction : 0,
        totalBuyback: totalBuyback > 0 ? totalBuyback : 0,
      }
    });

    // Update inventory status
    await tx.inventory.update({
      where: { id: transaction.inventoryId },
      data: { 
        status: "BUYBACK",
        weight: actualWeight
      }
    });
  });

  revalidatePath("/employee/dashboard/buyback");
  revalidatePath("/admin/dashboard/transactions");
  revalidatePath("/admin/dashboard/inventory");
  revalidatePath("/employee/dashboard/history");

  return { success: true };
}
