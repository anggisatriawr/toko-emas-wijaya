import { prisma } from "@/lib/prisma";
import { TransactionsClient } from "./TransactionsClient";

export default async function TransactionsPage() {
  const transactions = await prisma.transaction.findMany({
    include: {
      customer: true,
      user: true,
      inventory: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const buybacks = await prisma.buyback.findMany({
    include: {
      customer: true,
      user: true,
      inventory: true,
      transaction: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const employees = await prisma.user.findMany({
    where: { role: "EMPLOYEE" },
    select: { name: true }
  });

  return (
    <TransactionsClient transactions={transactions} buybacks={buybacks} employees={employees.map(e => e.name)} />
  );
}
