import { prisma } from "@/lib/prisma";
import { PosForm } from "./PosForm";

export default async function POSPage() {
  // Fetch available inventory and price for the client to use
  const inventory = await prisma.inventory.findMany({
    where: { status: "AVAILABLE" }
  });

  const { getOrSyncDailyPrice } = await import('@/lib/price');
  const dailyPrice = await getOrSyncDailyPrice();

  if (!dailyPrice) {
    return (
      <div className="bg-red-500/20 text-red-100 p-6 rounded-2xl glass">
        <h2 className="text-xl font-bold">Gagal Mengambil Harga Emas</h2>
        <p className="mt-2 text-red-200">Sistem gagal mengambil harga emas terbaru dari API. Silakan hubungi Admin.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Proses Transaksi Penjualan</h2>
      <PosForm inventory={inventory} dailyPrice={dailyPrice} />
    </div>
  );
}
