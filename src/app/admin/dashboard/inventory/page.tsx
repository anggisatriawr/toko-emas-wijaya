import { prisma } from "@/lib/prisma";
import { InventoryClient } from "./InventoryClient";

export default async function InventoryPage() {
  const inventory = await prisma.inventory.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Manajemen Inventaris Emas</h2>
      <InventoryClient items={inventory} />
    </div>
  );
}
