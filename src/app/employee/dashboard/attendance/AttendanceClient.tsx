"use client";

import { useState } from "react";
import { LogIn, LogOut, CheckCircle } from "lucide-react";
import { submitClockIn, submitClockOut } from "./actions";

export function AttendanceClient({ todayRecord, history }: { todayRecord: any, history: any[] }) {
  const [loading, setLoading] = useState(false);
  const [errorStatus, setError] = useState("");

  const handleClockIn = async () => {
    setLoading(true);
    setError("");
    try {
      await submitClockIn();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    setLoading(true);
    setError("");
    try {
      await submitClockOut();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Kolom 1: Aksi Hari Ini */}
      <div className="glass p-8 rounded-2xl border flex flex-col items-center justify-center text-center space-y-6">
        <h3 className="text-xl font-bold">Status Hari Ini</h3>
        
        <p className="text-muted-foreground text-sm max-w-sm">
          Demi keamanan, pastikan Anda menekan tombol absen hanya saat Anda berada di dalam wilayah toko Wijaya sesaat sebelum dan sesudah sift kerja Anda.
        </p>

        {errorStatus && (
          <div className="bg-red-500/20 text-red-200 p-3 rounded-xl text-sm border-l-4 border-red-500 w-full">
            {errorStatus}
          </div>
        )}

        <div className="w-full max-w-xs space-y-4">
          {!todayRecord ? (
            <button disabled={loading} onClick={handleClockIn} className="w-full py-6 rounded-2xl bg-blue-500 hover:bg-blue-400 text-white font-bold text-xl flex flex-col items-center justify-center gap-2 transition-all shadow-[0_0_30px_rgba(59,130,246,0.3)]">
              <LogIn size={40} />
              {loading ? "Merekam..." : "Clock In (Masuk)"}
            </button>
          ) : !todayRecord.clockOut ? (
            <button disabled={loading} onClick={handleClockOut} className="w-full py-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xl flex flex-col items-center justify-center gap-2 transition-all shadow-[0_0_30px_rgba(16,185,129,0.3)]">
              <LogOut size={40} />
              {loading ? "Merekam..." : "Clock Out (Pulang)"}
            </button>
          ) : (
            <div className="w-full py-6 rounded-2xl border-2 border-emerald-500/50 bg-emerald-500/10 text-emerald-400 font-bold text-lg flex flex-col items-center justify-center gap-2">
              <CheckCircle size={40} />
              Shift Selesai
            </div>
          )}
        </div>
      </div>

      {/* Kolom 2: Riwayat */}
      <div className="glass p-8 rounded-2xl border border-white/10 max-h-[500px] overflow-y-auto">
         <h3 className="text-xl font-bold mb-4">Riwayat Kehadiran (30 Hari)</h3>
         <div className="space-y-4">
           {history.length === 0 && (
             <p className="text-center text-muted-foreground p-8">Belum ada catatan keberangkatan sama sekali.</p>
           )}
           {history.map((record) => (
             <div key={record.id} className="flex flex-col sm:flex-row justify-between items-center sm:items-start p-4 bg-white/5 rounded-xl">
               <div className="mb-2 sm:mb-0">
                 <p className="font-bold text-white mb-1">
                   {new Date(record.date).toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                 </p>
                 <span className={`text-xs px-2 py-1 rounded-full font-semibold ${record.clockOut ? 'bg-emerald-500/20 text-emerald-300' : 'bg-yellow-500/20 text-yellow-300'}`}>
                   {record.clockOut ? "Tuntas" : "Sedang Bekerja"}
                 </span>
               </div>
               <div className="text-right flex flex-col gap-1 items-end">
                 <div className="text-sm bg-black/40 px-3 py-1 rounded-md text-blue-300 flex items-center justify-between min-w-[120px]">
                   <span>IN :</span> <span className="font-mono">{new Date(record.clockIn).toLocaleTimeString("id-ID")}</span>
                 </div>
                 <div className="text-sm bg-black/40 px-3 py-1 rounded-md text-emerald-300 flex items-center justify-between min-w-[120px]">
                   <span>OUT:</span> <span className="font-mono">{record.clockOut ? new Date(record.clockOut).toLocaleTimeString("id-ID") : "--:--:--"}</span>
                 </div>
               </div>
             </div>
           ))}
         </div>
      </div>
    </div>
  );
}
