"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function processTransaction(data: any) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== "EMPLOYEE") {
    return { success: false, error: "Unauthorized" };
  }

  const { customerName, customerPhone, customerAddress, inventoryId } = data;

  try {
    // Check inventory and current price
    const item = await prisma.inventory.findUnique({ where: { id: inventoryId } });
    if (!item || item.status !== "AVAILABLE") throw new Error("Barang tidak tersedia");

    const today = new Date();
    today.setHours(0,0,0,0);
    const dailyPrice = await prisma.dailyPrice.findUnique({ where: { date: today } });
    
    if (!dailyPrice) throw new Error("Harga harian belum diatur oleh Admin");

    const { getSellKaratMultiplier } = await import("@/lib/karat");
    const multiplier = getSellKaratMultiplier(item.karat);

    const pricePerGram = Math.round(dailyPrice.sellPerGram * multiplier);
    const totalPrice = (item.weight * pricePerGram) + item.ongkos;

    // Create unique invoice
    const invoice = `INV-${Date.now().toString().slice(-6)}`;

    // Do in transaction
    const result = await prisma.$transaction(async (tx: any) => {
      // Upsert Customer
      let customer = await tx.customer.findUnique({ where: { phone: customerPhone }});
      if (!customer) {
        customer = await tx.customer.create({
          data: { name: customerName, phone: customerPhone, address: customerAddress }
        });
      }

      // Record trans
      const trans = await tx.transaction.create({
        data: {
          invoice,
          customerId: customer.id,
          userId: (session.user as any).id,
          inventoryId: item.id,
          weight: item.weight,
          pricePerGram: pricePerGram,
          ongkos: item.ongkos,
          totalPrice: totalPrice,
        }
      });

      // Update Inventory
      await tx.inventory.update({
        where: { id: item.id },
        data: { status: "SOLD" }
      });

      return trans;
    });

    revalidatePath("/employee/dashboard/pos");
    revalidatePath("/employee/dashboard");
    revalidatePath("/admin/dashboard/transactions");
    revalidatePath("/admin/dashboard/inventory");
    revalidatePath("/admin/dashboard");
    
    return { success: true, transaction: result };
  } catch(err: any) {
    console.error(err);
    return { success: false, error: err.message };
  }
}
