"use client";

import { useState } from "react";
import { Save, RefreshCw } from "lucide-react";
import { setDailyPrice, syncDailyPriceAction } from "./actions";

export function PriceClient({ current, history }: { current: any, history: any[] }) {
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState("");

  const handleSync = async () => {
    setSyncing(true);
    setError("");
    try {
      await syncDailyPriceAction();
      alert("Harga berhasil disinkronisasi dengan API Metalprice!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSyncing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    try {
      await setDailyPrice(formData);
      alert("Harga berhasil diupdate!");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Form Harga Hari Ini */}
      <div className="glass p-8 rounded-2xl border border-primary/20">
        <h3 className="font-bold text-xl mb-6 text-primary border-b border-primary/20 pb-4">
          Atur Harga Sekarang
        </h3>
        
        {error && <div className="bg-red-500/20 text-red-200 p-3 rounded-lg mb-4">{error}</div>}
        
        <form onSubmit={handleSubmit} className="space-y-6">
           <div>
             <label className="text-sm text-muted-foreground block mb-2">Harga Jual (Toko Ke Pelanggan)</label>
             <div className="relative">
               <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">Rp</span>
               <input 
                 name="sellPerGram" 
                 type="number" 
                 defaultValue={current?.sellPerGram || ""} 
                 required 
                 className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary" 
               />
             </div>
           </div>
           
           <div>
             <label className="text-sm text-muted-foreground block mb-2">Harga Beli / Buyback (Pelanggan Ke Toko)</label>
             <div className="relative">
               <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">Rp</span>
               <input 
                 name="buyPerGram" 
                 type="number" 
                 defaultValue={current?.buyPerGram || ""} 
                 required 
                 className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-primary" 
               />
             </div>
           </div>

           <button disabled={loading} type="submit" className="w-full py-4 bg-primary text-black font-bold text-lg rounded-xl flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(251,191,36,0.4)] transition-all">
             <Save size={24} /> {loading ? "Menyimpan..." : "Simpan Harga Manual"}
           </button>

           <button 
             type="button" 
             onClick={handleSync}
             disabled={syncing}
             className="w-full py-4 bg-blue-600 text-white font-bold text-lg rounded-xl flex items-center justify-center gap-2 hover:bg-blue-500 transition-all mt-4"
           >
             <RefreshCw size={24} className={syncing ? "animate-spin" : ""} /> 
             {syncing ? "Sinkronisasi..." : "Sync dari API Sekarang"}
           </button>
        </form>
      </div>

      {/* Riwayat Harga */}
      <div className="glass p-8 rounded-2xl">
        <h3 className="font-bold text-xl mb-6 border-b border-white/10 pb-4">
          Riwayat Perubahan Harga (5 Hari Terakhir)
        </h3>
        <div className="space-y-4">
          {history.length === 0 && <p className="text-muted-foreground">Belum ada riwayat harga.</p>}
          {history.map((h) => (
            <div key={h.id} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
              <div>
                <p className="font-semibold text-white">{new Date(h.date).toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Jual: <span className="text-primary font-bold">Rp {h.sellPerGram.toLocaleString("id-ID")}</span></p>
                <p className="text-sm text-muted-foreground">Beli: <span className="text-white font-bold">Rp {h.buyPerGram.toLocaleString("id-ID")}</span></p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
