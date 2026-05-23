import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function EmployeeDashboardPage() {
  const session = await getServerSession(authOptions);
  
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const transactionsToday = await prisma.transaction.count({
    where: { 
      userId: (session?.user as any).id,
      createdAt: { gte: today }
    }
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass p-6 rounded-2xl flex flex-col justify-center border-l-4 border-emerald-500">
          <p className="text-muted-foreground text-sm font-medium">Transaksi Hari Ini</p>
          <h3 className="text-4xl font-bold mt-2">{transactionsToday}</h3>
        </div>
        <div className="glass p-6 rounded-2xl flex flex-col justify-center border-l-4 border-amber-500">
          <p className="text-muted-foreground text-sm font-medium">Status Absensi</p>
          <h3 className="text-2xl font-bold mt-2">Belum Absen Masuk</h3>
        </div>
      </div>

      <div className="glass p-8 rounded-2xl">
        <h2 className="text-xl font-bold mb-4">Pengumuman Toko</h2>
        <p className="text-muted-foreground">Selamat bekerja! Pastikan untuk selalu mengecek harga emas harian yang diatur oleh Admin sebelum melakukan transaksi dengan pelanggan. Harga dapat berubah sewaktu-waktu.</p>
      </div>
    </div>
  );
}
