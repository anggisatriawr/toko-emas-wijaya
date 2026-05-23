import { prisma } from "@/lib/prisma";
import { DashboardChart } from "./DashboardChart";

export default async function AdminDashboardPage() {
  const employeesCount = await prisma.user.count({ where: { role: "EMPLOYEE" } });
  const soldItems = await prisma.inventory.count({ where: { status: "SOLD" } });
  const totalItems = await prisma.inventory.count();

  // Chart Data preparation (Current Month)
  const currentMonthStart = new Date();
  currentMonthStart.setDate(1);
  currentMonthStart.setHours(0, 0, 0, 0);

  const transactions = await prisma.transaction.findMany({
    where: { createdAt: { gte: currentMonthStart } },
    select: { createdAt: true, totalPrice: true }
  });

  const buybacks = await prisma.buyback.findMany({
    where: { createdAt: { gte: currentMonthStart } },
    select: { createdAt: true, totalBuyback: true }
  });

  // Group by day (1 to 31)
  const chartData = [];
  const daysInMonth = new Date(currentMonthStart.getFullYear(), currentMonthStart.getMonth() + 1, 0).getDate();
  
  for(let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${currentMonthStart.getFullYear()}-${String(currentMonthStart.getMonth() + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    
    // filter records for this day
    const dayTxs = transactions.filter(t => t.createdAt.getDate() === i);
    const dayBuybacks = buybacks.filter(b => b.createdAt.getDate() === i);

    const penjualan = dayTxs.reduce((sum, t) => sum + t.totalPrice, 0);
    const buyback = dayBuybacks.reduce((sum, b) => sum + b.totalBuyback, 0);

    chartData.push({
      date: dateStr,
      day: i.toString(),
      penjualan,
      buyback
    });
  }

  // Simple statistics view
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass p-6 rounded-2xl flex flex-col justify-center border border-white/5">
          <p className="text-muted-foreground text-sm font-medium">Total Pegawai Aktif</p>
          <h3 className="text-4xl font-bold mt-2">{employeesCount}</h3>
        </div>
        <div className="glass p-6 rounded-2xl flex flex-col justify-center border border-white/5">
          <p className="text-muted-foreground text-sm font-medium">Emas Terjual</p>
          <h3 className="text-4xl font-bold text-primary mt-2">{soldItems}</h3>
        </div>
        <div className="glass p-6 rounded-2xl flex flex-col justify-center border border-white/5">
          <p className="text-muted-foreground text-sm font-medium">Total Inventaris Emas</p>
          <h3 className="text-4xl font-bold mt-2">{totalItems}</h3>
        </div>
      </div>

      <div className="glass p-8 rounded-2xl flex flex-col border border-white/5 shadow-2xl">
        <div className="mb-6">
           <h3 className="text-xl font-bold">Grafik Transaksi Bulan Ini</h3>
           <p className="text-muted-foreground text-sm">Perbandingan antara pemasukan penjualan dan pengeluaran buyback per hari.</p>
        </div>
        <DashboardChart data={chartData} />
      </div>
    </div>
  );
}
