import { prisma } from "@/lib/prisma";
import { CollectionClient } from "./CollectionClient";

export default async function CatalogCollectionPage() {
  // Fetch existing items, we'll try/catch this gracefully since the client might not have CatalogItem yet
  let items = [];
  try {
    items = await (prisma as any).catalogItem.findMany({
      orderBy: { createdAt: "desc" }
    });
  } catch (e) {
    console.error("Database table likely not created yet. Run prisma db push.");
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Katalog Koleksi Layar Depan</h2>
        <p className="text-muted-foreground mt-1">Kelola perhiasan unggulan yang tampil di Landing Page (Maksimal 6 item disarankan).</p>
      </div>

      <CollectionClient initialItems={items} />
    </div>
  );
}
