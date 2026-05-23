"use client";

import { useState, useMemo } from "react";
import { Printer } from "lucide-react";

export function AttendanceClient({ allEmployees, allAttendances }: { allEmployees: any[], allAttendances: any[] }) {
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });

  const generateFilteredData = () => {
    const [yearStr, monthStr] = selectedMonth.split("-");
    const y = parseInt(yearStr);
    const m = parseInt(monthStr) - 1; // 0-based month

    // Create start and end date for the selected month
    const startOfMonth = new Date(y, m, 1);
    const endOfMonth = new Date(y, m + 1, 0, 23, 59, 59, 999);
    
    // Total days in the month
    const daysInMonth = endOfMonth.getDate();

    // Filter attendances to just this month
    const monthlyAttendances = allAttendances.filter(a => {
      const d = new Date(a.date);
      return d >= startOfMonth && d <= endOfMonth;
    });

    return { monthlyAttendances, daysInMonth, m, y, startOfMonth, endOfMonth };
  };

  const { monthlyAttendances, daysInMonth, startOfMonth } = generateFilteredData();

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 print:hidden">
        <div>
          <h2 className="text-2xl font-bold mb-1">Monitoring Absensi Pegawai</h2>
          <p className="text-muted-foreground text-sm">Pilih bulan untuk melihat rekap kehadiran karyawan.</p>
        </div>
        <div className="flex gap-4 items-center">
          <input 
            type="month" 
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-black/40 border border-white/10 rounded-xl p-2.5 text-white focus:outline-none focus:ring-1 focus:ring-primary shadow-[0_0_15px_rgba(251,191,36,0.1)]"
          />
          <button 
            onClick={handlePrint}
            className="bg-primary text-black font-semibold py-2.5 px-4 rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-colors"
          >
            <Printer size={18} /> Cetak Rekap Bulanan
          </button>
        </div>
      </div>

      <div className="glass rounded-2xl overflow-hidden print:hidden border">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="p-4 font-medium text-muted-foreground w-1/4">Nama Pegawai</th>
                <th className="p-4 font-medium text-muted-foreground text-center">Total Hari Hadir</th>
                <th className="p-4 font-medium text-muted-foreground text-center">Total Mangkir/Libur</th>
                <th className="p-4 font-medium text-muted-foreground text-center">Tingkat Kehadiran (%)</th>
              </tr>
            </thead>
            <tbody>
              {allEmployees.map((emp) => {
                const userAttendances = monthlyAttendances.filter((a) => a.userId === emp.id);
                const hadir = userAttendances.length;
                const mangkir = daysInMonth - hadir;
                const persentase = daysInMonth > 0 ? ((hadir / daysInMonth) * 100).toFixed(1) : 0;

                return (
                  <tr key={emp.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-white">{emp.name}</div>
                      <div className="text-xs text-muted-foreground">{emp.username}</div>
                    </td>
                    <td className="p-4 font-mono text-center text-emerald-400 font-bold">{hadir} hari</td>
                    <td className="p-4 font-mono text-center text-red-400 font-bold">{mangkir} hari</td>
                    <td className="p-4 text-center">
                      <span className="px-2.5 py-1 bg-white/10 rounded-full text-xs font-semibold">{persentase}%</span>
                    </td>
                  </tr>
                );
              })}
              {allEmployees.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Belum ada data pegawai.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* TAMPILAN KHUSUS CETAK (PRINT) */}
      <div className="hidden print:block print:bg-white print:text-black print:p-8 print:w-full print:m-0" id="printable-attendance">
        <div className="text-center mb-8 border-b-2 border-black pb-4">
          <h1 className="text-3xl font-black font-sans uppercase">TOKO EMAS WIJAYA</h1>
          <h2 className="text-xl font-bold mt-1">LAPORAN REKAPITULASI ABSENSI</h2>
          <p className="text-gray-600 mt-2">Periode: {startOfMonth.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}</p>
        </div>

        <table className="w-full text-left text-sm whitespace-nowrap border-collapse border border-black mb-8">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3 border border-black font-bold">No</th>
              <th className="p-3 border border-black font-bold">Nama Pegawai (Username)</th>
              <th className="p-3 border border-black font-bold text-center">Total Hari Hadir</th>
              <th className="p-3 border border-black font-bold text-center">Total Libur/Alpa</th>
              <th className="p-3 border border-black font-bold text-center">Persentase</th>
            </tr>
          </thead>
          <tbody>
            {allEmployees.map((emp, idx) => {
              const userAttendances = monthlyAttendances.filter((a) => a.userId === emp.id);
              const hadir = userAttendances.length;
              const mangkir = daysInMonth - hadir;
              const persentase = daysInMonth > 0 ? ((hadir / daysInMonth) * 100).toFixed(1) : 0;
              return (
                <tr key={emp.id} className="border-b border-black">
                   <td className="p-2 border border-black text-center">{idx + 1}</td>
                   <td className="p-2 border border-black">
                      <div className="font-bold">{emp.name}</div>
                      <div className="text-xs text-gray-600">({emp.username})</div>
                   </td>
                   <td className="p-2 border border-black text-center font-mono">{hadir}</td>
                   <td className="p-2 border border-black text-center font-mono">{mangkir}</td>
                   <td className="p-2 border border-black text-center font-bold">{persentase}%</td>
                </tr>
              )
            })}
          </tbody>
        </table>

        <div className="flex justify-end mt-16 print:mb-8">
           <div className="text-center">
             <p className="mb-16">Pimpinan Toko,</p>
             <p className="font-bold border-b border-black pb-1 px-4 inline-block">Bpk. Wijaya</p>
           </div>
        </div>
      </div>

    </div>
  );
}
