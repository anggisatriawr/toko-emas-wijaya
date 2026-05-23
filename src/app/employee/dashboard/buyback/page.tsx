import { prisma } from "@/lib/prisma";
import { BuybackClient } from "./BuybackClient";

export default async function BuybackPage() {
  const today = new Date();
  today.setHours(0,0,0,0);
  const dailyPrice = await prisma.dailyPrice.findUnique({ where: { date: today } });

  if (!dailyPrice) {
    return (
      <div className="bg-red-500/20 text-red-100 p-6 rounded-2xl glass border border-red-500/30">
        <h2 className="text-xl font-bold">Akses Fitur Buyback Tertutup</h2>
        <p className="mt-2 text-red-200">Admin belum mengatur **Harga Beli Nasional** untuk hari ini. Silakan hubungi admin sebelum memproses pembelian kembali barang pelanggan.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Layanan Pembelian Kembali (Buyback)</h2>
      <BuybackClient dailyHarga={dailyPrice} />
    </div>
  );
}
