"use client";

import { useState } from "react";
import { Search, Calculator, CheckCircle2, ChevronRight, Ban } from "lucide-react";
import { searchTransactionsByQuery, processBuyback } from "./actions";

export function BuybackClient({ dailyHarga }: { dailyHarga: any }) {
  const [query, setQuery] = useState("");
  const [resultsList, setResultsList] = useState<any[]>([]);
  const [selectedResult, setSelectedResult] = useState<any>(null);
  
  const [loading, setLoading] = useState(false);
  const [errorSearch, setErrorSearch] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [actualWeight, setActualWeight] = useState<number | "">("");
  const [damagePutus, setDamagePutus] = useState(false);
  const [damageBengkok, setDamageBengkok] = useState(false);
  const [damagePermata, setDamagePermata] = useState(false);

  const damagePenalty = (damagePutus ? 25000 : 0) + (damageBengkok ? 10000 : 0) + (damagePermata ? 15000 : 0);
  const currentWeight = Number(actualWeight) || 0;
  const buybackPricePerGram = selectedResult?.calculatedBuyPerGram || dailyHarga.buyPerGram;
  const clientTotalBuyback = (currentWeight * buybackPricePerGram) - damagePenalty;

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorSearch("");
    setResultsList([]);
    setSelectedResult(null);
    setSuccessMsg("");

    try {
      const resp = await searchTransactionsByQuery(query);
      if (resp.success) {
        setResultsList(resp.transactions || []);
      } else {
        setErrorSearch(resp.error || "Pencarian nihil.");
      }
    } catch(err: any) {
      setErrorSearch("Terjadi kesalahan sistem saat melacak nota.");
    } finally {
      setLoading(false);
    }
  };

  const handleProcessBuyback = async () => {
    if (!selectedResult?.id) return;
    
    if (confirm("Ingin memproses konfirmasi BUYBACK? Status emas di Sistem akan kembali menjadi aset Toko (Buyback) dan Uang senilai estimasi harus dibayarkan ke pelanggan!")) {
      setLoading(true);
      try {
         await processBuyback(selectedResult.id, currentWeight, damagePenalty);
         setSuccessMsg("Berhasil! Asset kembali ke toko. Kwitansi Buyback telah selesai dibuat.");
         setQuery("");
         setResultsList([]);
         setSelectedResult(null);
      } catch (err: any) {
         setErrorSearch("Gagal Memproses: " + err.message);
      } finally {
         setLoading(false);
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Kolom 1: Pencarian Fleksibel */}
      <div className="glass p-8 rounded-2xl border border-primary/20 bg-primary/5 flex flex-col h-full">
        <h3 className="text-xl font-bold text-primary mb-4">Lacak Riwayat Pembelian</h3>
        <p className="text-muted-foreground text-sm mb-6">Anda bisa melacak berdasarkan nomor <b>Invoice</b> (Faktur), <b>Nama Lengkap</b>, <b>Alamat</b>, atau <b>No HP</b> Pembeli dari kuitansi lama.</p>
        
        <form onSubmit={handleSearch} className="flex gap-4 mb-6">
          <input 
            type="text" 
            placeholder="Ketik nama, no HP, atau INV-XXXX..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            required
            className="flex-1 bg-black/40 border border-white/20 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary"
          />
          <button disabled={loading} type="submit" className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold flex items-center gap-2">
            <Search size={20} /> Cari
          </button>
        </form>

        {errorSearch && (
          <div className="mb-6 bg-red-500/20 text-red-200 p-4 rounded-xl text-sm border-l-4 border-red-500 flex items-center gap-3">
             <Ban size={20} /> {errorSearch}
          </div>
        )}
        {successMsg && (
          <div className="mb-6 bg-green-500/20 text-green-300 p-4 rounded-xl text-sm border-l-4 border-green-500 font-semibold flex items-center gap-2">
            <CheckCircle2 size={24} className="text-green-500" />
            {successMsg}
          </div>
        )}

        {/* Daftar Hasil Rekomendasi / Identitas Orang */}
        {resultsList.length > 0 && !selectedResult && (
          <div className="flex-1 overflow-y-auto pr-2 space-y-3">
             <h4 className="font-semibold text-white/80 mb-2 border-b border-white/10 pb-2">Ditemukan {resultsList.length} Transaksi Terkait:</h4>
             {resultsList.map((t) => (
                <div key={t.id} onClick={() => {
                    setSelectedResult(t);
                    setActualWeight(t.weight);
                    setDamagePutus(false);
                    setDamageBengkok(false);
                    setDamagePermata(false);
                }} className="bg-white/5 border border-white/10 hover:border-primary/50 rounded-xl p-4 cursor-pointer transition-colors flex justify-between items-center group">
                  <div>
                    <p className="font-bold text-primary">{t.customer.name}</p>
                    <p className="text-xs text-muted-foreground mb-2">📞 {t.customer.phone} • {t.invoice}</p>
                    <p className="text-sm">Barang: <span className="text-white font-semibold">{t.inventory.type} ({t.inventory.code})</span></p>
                  </div>
                  <ChevronRight size={20} className="text-white/30 group-hover:text-primary transition-colors" />
                </div>
             ))}
          </div>
        )}
      </div>

      {/* Kolom 2: Hasil Review dan Kalkulasi (Spesifik 1 Barang) */}
      <div className={`glass p-8 rounded-2xl border flex flex-col ${selectedResult ? "border-purple-500/40 bg-purple-900/10" : "border-white/10"}`}>
         <div className="flex justify-between items-start mb-4">
            <h3 className="text-xl font-bold flex items-center gap-2 text-purple-200">
              <Calculator size={24} /> Hasil Kalkulasi Buyback
            </h3>
            {selectedResult && (
              <button onClick={() => setSelectedResult(null)} className="text-xs text-muted-foreground hover:text-white underline p-1">Batal Pilih</button>
            )}
         </div>

         {!selectedResult ? (
           <div className="flex-1 min-h-[250px] flex items-center justify-center text-muted-foreground italic text-center text-sm border-2 border-dashed border-white/10 rounded-xl mt-4">
             {resultsList.length > 0 ? "Pilih salah satu barang di kolom kiri untuk melihat kalkulasi." : "Masukan kata kunci di form pencarian terlebih dahulu."}
           </div>
         ) : (
           <div className="space-y-4 flex-1 flex flex-col">
             <div className="bg-black/20 p-4 rounded-xl border border-white/5 mb-2">
                <span className="text-xs text-purple-400 font-bold tracking-widest uppercase mb-2 block">Identitas Fokus</span>
                <p className="font-bold text-lg">{selectedResult.customer.name}</p>
                <p className="text-sm text-muted-foreground">{selectedResult.customer.phone} | {selectedResult.customer.address}</p>
             </div>

             <div className="grid grid-cols-2 gap-4 mb-4 pb-4 border-b border-white/10">
               <div>
                  <p className="text-xs text-muted-foreground">Nota / Kuitansi Sistem</p>
                  <p className="font-mono font-bold">{selectedResult.invoice}</p>
               </div>
               <div>
                  <p className="text-xs text-muted-foreground">Objek Perhiasan</p>
                  <p className="font-bold">{selectedResult.inventory.type} {selectedResult.inventory.karat} ({selectedResult.inventory.code})</p>
               </div>
             </div>

              <div className="space-y-2 text-sm flex-1">
                 <div className="flex justify-between">
                   <span className="text-muted-foreground">Harga Jual Awal (Riwayat Modal Kita)</span>
                   <span>Rp {selectedResult.totalPrice.toLocaleString("id-ID")}</span>
                 </div>
                 <div className="text-xs text-muted-foreground/60 text-right mt-1 mb-2">
                   ({selectedResult.weight}g &times; Rp {selectedResult.pricePerGram.toLocaleString("id-ID")}) + Ongkos Rp {selectedResult.ongkos.toLocaleString("id-ID")}
                 </div>
                 <div className="flex justify-between items-center bg-black/20 p-2 rounded-lg border border-white/5 mt-2">
                   <span className="text-muted-foreground font-semibold">Berat Aktual (g)</span>
                   <input 
                      type="number" 
                      step="0.01" 
                      value={actualWeight} 
                      onChange={(e) => setActualWeight(e.target.value ? Number(e.target.value) : "")} 
                      className="w-24 bg-black/60 border border-purple-500/50 rounded-lg px-3 py-1.5 text-right text-white font-bold focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-400 transition-all"
                   />
                 </div>
                 <div className="flex justify-between border-b border-purple-500/30 pb-2 mb-2 mt-2">
                   <span className="text-muted-foreground">Harga Dasar Beli (24K)</span>
                   <span>Rp {dailyHarga.buyPerGram.toLocaleString("id-ID")}</span>
                 </div>
                 <div className="flex justify-between border-b border-purple-500/30 pb-2 mb-2 mt-2">
                   <span className="text-muted-foreground">Harga Beli {selectedResult.inventory.karat} (/g)</span>
                   <span className="font-bold text-white">Rp {buybackPricePerGram.toLocaleString("id-ID")}</span>
                 </div>

                 <div className="mt-4 border-b border-purple-500/30 pb-4">
                   <p className="text-xs font-bold text-purple-300 uppercase tracking-widest mb-3">Kondisi Barang (Kerusakan)</p>
                   <div className="space-y-3">
                     <label className="flex items-center justify-between cursor-pointer group p-2 rounded-lg hover:bg-white/5 transition-colors">
                       <div className="flex items-center gap-3">
                         <input type="checkbox" checked={damagePutus} onChange={(e) => setDamagePutus(e.target.checked)} className="w-4 h-4 accent-purple-500 cursor-pointer" />
                         <span className={damagePutus ? "text-purple-300 font-bold" : "text-gray-300 group-hover:text-white transition-colors"}>Barang Putus</span>
                       </div>
                       <span className={damagePutus ? "text-red-400 font-bold" : "text-muted-foreground"}>-Rp 25.000</span>
                     </label>
                     <label className="flex items-center justify-between cursor-pointer group p-2 rounded-lg hover:bg-white/5 transition-colors">
                       <div className="flex items-center gap-3">
                         <input type="checkbox" checked={damageBengkok} onChange={(e) => setDamageBengkok(e.target.checked)} className="w-4 h-4 accent-purple-500 cursor-pointer" />
                         <span className={damageBengkok ? "text-purple-300 font-bold" : "text-gray-300 group-hover:text-white transition-colors"}>Barang Bengkok</span>
                       </div>
                       <span className={damageBengkok ? "text-red-400 font-bold" : "text-muted-foreground"}>-Rp 10.000</span>
                     </label>
                     <label className="flex items-center justify-between cursor-pointer group p-2 rounded-lg hover:bg-white/5 transition-colors">
                       <div className="flex items-center gap-3">
                         <input type="checkbox" checked={damagePermata} onChange={(e) => setDamagePermata(e.target.checked)} className="w-4 h-4 accent-purple-500 cursor-pointer" />
                         <span className={damagePermata ? "text-purple-300 font-bold" : "text-gray-300 group-hover:text-white transition-colors"}>Permata Hilang</span>
                       </div>
                       <span className={damagePermata ? "text-red-400 font-bold" : "text-muted-foreground"}>-Rp 15.000</span>
                     </label>
                   </div>
                 </div>
                 
                 <div className="flex justify-between items-center bg-black/40 p-4 rounded-xl mt-4 border border-purple-500/20">
                   <span className="font-bold text-gray-300">Total Uang Diberikan (Refund)</span>
                   <span className="text-2xl font-bold text-emerald-400">Rp {Math.max(0, clientTotalBuyback).toLocaleString("id-ID")}</span>
                 </div>
                 
                 {selectedResult.totalPrice > clientTotalBuyback && (
                   <p className="text-xs text-purple-300 text-right mt-2 flex justify-end">
                     Nilai Kerugian Konsumen: -Rp {Math.max(0, selectedResult.totalPrice - clientTotalBuyback).toLocaleString("id-ID")}
                   </p>
                 )}
              </div>

             <button disabled={loading} onClick={handleProcessBuyback} className="w-full mt-6 bg-purple-600 hover:bg-purple-500 transition-colors text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(147,51,234,0.3)]">
               {loading ? "Menulis Data Sistem..." : "Resmikan Transaksi Buyback"}
             </button>
           </div>
         )}
      </div>
    </div>
  );
}
