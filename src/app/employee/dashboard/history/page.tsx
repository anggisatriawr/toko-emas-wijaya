import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { HistoryClient } from "./HistoryClient";

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);
  const employeeId = (session?.user as any)?.id;

  const transactions = await prisma.transaction.findMany({
    where: { userId: employeeId },
    include: {
      customer: true,
      inventory: true,
      user: true, // Needed for printing the cashier's name on the modal receipt
    },
    orderBy: { createdAt: "desc" },
  });

  const buybacks = await prisma.buyback.findMany({
    where: { userId: employeeId },
    include: {
      customer: true,
      inventory: true,
      transaction: true,
      user: true, // Needed for printing the cashier's name on the modal receipt
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <HistoryClient transactions={transactions} buybacks={buybacks} />
  );
}
