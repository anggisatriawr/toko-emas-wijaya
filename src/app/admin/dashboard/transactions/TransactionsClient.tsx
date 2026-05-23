"use client";

import { useState, useMemo } from "react";
import { Search, X, Printer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface TransactionsClientProps {
  transactions: any[];
  buybacks: any[];
  employees: string[];
}

export function TransactionsClient({ transactions, buybacks, employees }: TransactionsClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCashier, setSelectedCashier] = useState<string>("ALL");
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  });
  
  // States untuk Modal Detail
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [selectedBuyback, setSelectedBuyback] = useState<any>(null);

  const currentYear = new Date().getFullYear();
  const monthsIndo = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const parsedMonth = useMemo(() => {
    const [yearStr, monthStr] = selectedMonth.split("-");
    const y = parseInt(yearStr);
    const m = parseInt(monthStr) - 1;
    return {
      start: new Date(y, m, 1),
      end: new Date(y, m + 1, 0, 23, 59, 59, 999),
      year: y,
      month: m
    };
  }, [selectedMonth]);

  const cashiers = useMemo(() => {
    const names = new Set<string>(employees);
    transactions.forEach(t => names.add(t.user?.name || "Unknown"));
    buybacks.forEach(b => names.add(b.user?.name || "Unknown"));
    return Array.from(names).sort();
  }, [transactions, buybacks, employees]);

  const monthFilteredTxs = useMemo(() => {
    return transactions.filter(t => {
      const d = new Date(t.createdAt);
      const isMonthMatch = d >= parsedMonth.start && d <= parsedMonth.end;
      const isCashierMatch = selectedCashier === "ALL" || (t.user?.name || "Unknown") === selectedCashier;
      return isMonthMatch && isCashierMatch;
    });
  }, [transactions, parsedMonth, selectedCashier]);

  const monthFilteredBuybacks = useMemo(() => {
    return buybacks.filter(b => {
      const d = new Date(b.createdAt);
      const isMonthMatch = d >= parsedMonth.start && d <= parsedMonth.end;
      const isCashierMatch = selectedCashier === "ALL" || (b.user?.name || "Unknown") === selectedCashier;
      return isMonthMatch && isCashierMatch;
    });
  }, [buybacks, parsedMonth, selectedCashier]);

  const filteredTransactions = useMemo(() => {
    if (!searchTerm) return monthFilteredTxs;
    const lower = searchTerm.toLowerCase();
    return monthFilteredTxs.filter(t => 
      t.invoice.toLowerCase().includes(lower) ||
      t.customer.name.toLowerCase().includes(lower) ||
      t.customer.phone.toLowerCase().includes(lower) ||
      t.inventory.code.toLowerCase().includes(lower) ||
      t.user.name.toLowerCase().includes(lower)
    );
  }, [monthFilteredTxs, searchTerm]);

  const filteredBuybacks = useMemo(() => {
    if (!searchTerm) return monthFilteredBuybacks;
    const lower = searchTerm.toLowerCase();
    return monthFilteredBuybacks.filter(b => 
      b.transaction.invoice.toLowerCase().includes(lower) ||
      b.customer.name.toLowerCase().includes(lower) ||
      b.customer.phone.toLowerCase().includes(lower) ||
      b.inventory.code.toLowerCase().includes(lower) ||
      b.user.name.toLowerCase().includes(lower)
    );
  }, [monthFilteredBuybacks, searchTerm]);

  const totalPenjualanRP = monthFilteredTxs.reduce((acc, t) => acc + t.totalPrice, 0);
  const totalPenjualanGram = monthFilteredTxs.reduce((acc, t) => acc + t.weight, 0);
  const totalBuybackRP = monthFilteredBuybacks.reduce((acc, b) => acc + b.totalBuyback, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      {/* HEADER CONTROLS (LAYAR) */}
      <div className="print:hidden">
        <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold">Monitoring Arus Transaksi Kasir</h2>
            <p className="text-muted-foreground mt-1 text-sm">Pilih bulan dan gunakan kolom pencarian untuk memfilter data.</p>
          </div>
          
          <div className="flex flex-wrap gap-4 items-center">
            <select
              value={selectedCashier}
              onChange={(e) => setSelectedCashier(e.target.value)}
              className="bg-white text-black font-bold border-2 border-primary rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-primary h-11 min-w-[150px] cursor-pointer shadow-[0_0_15px_rgba(251,191,36,0.2)]"
            >
              <option value="ALL">Semua Kasir</option>
              {cashiers.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <div className="flex gap-2">
              <select 
                value={selectedMonth.split("-")[1]} 
                onChange={(e) => {
                  const y = selectedMonth.split("-")[0];
                  setSelectedMonth(`${y}-${e.target.value}`);
                }}
                className="bg-white text-black font-bold border-2 border-primary rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-primary h-11 cursor-pointer shadow-[0_0_15px_rgba(251,191,36,0.2)]"
              >
                {monthsIndo.map((m, i) => (
                  <option key={m} value={String(i + 1).padStart(2, "0")}>{m}</option>
                ))}
              </select>
              <select 
                value={selectedMonth.split("-")[0]} 
                onChange={(e) => {
                  const m = selectedMonth.split("-")[1];
                  setSelectedMonth(`${e.target.value}-${m}`);
                }}
                className="bg-white text-black font-bold border-2 border-primary rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-primary h-11 cursor-pointer shadow-[0_0_15px_rgba(251,191,36,0.2)]"
              >
                {Array.from({length: 10}, (_, i) => currentYear - i).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <div className="relative w-64 h-11">
              <input 
                type="text" 
                placeholder="Cari Invoice..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-full bg-black/40 border border-white/10 rounded-xl px-3 pl-10 text-white focus:outline-none focus:ring-1 focus:ring-primary text-sm shadow-[0_0_15px_rgba(251,191,36,0.1)]"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            </div>
            <button 
              onClick={handlePrint}
              className="bg-primary text-black font-semibold h-11 px-4 rounded-xl flex items-center gap-2 hover:bg-primary/90 transition-colors whitespace-nowrap"
            >
              <Printer size={18} /> Cetak Rekap Bulanan
            </button>
          </div>
        </div>

        {/* SUMMARY CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="glass p-4 rounded-xl border-t-2 border-primary">
            <p className="text-sm text-muted-foreground">Total Pemasukan Penjualan</p>
            <p className="text-2xl font-bold text-primary">Rp {totalPenjualanRP.toLocaleString("id-ID")}</p>
            <p className="text-xs text-muted-foreground mt-1">{monthFilteredTxs.length} Transaksi Keluar ({totalPenjualanGram.toFixed(2)}g)</p>
          </div>
          <div className="glass p-4 rounded-xl border-t-2 border-purple-500">
            <p className="text-sm text-muted-foreground">Total Pengeluaran Buyback</p>
            <p className="text-2xl font-bold text-purple-400">Rp {totalBuybackRP.toLocaleString("id-ID")}</p>
            <p className="text-xs text-muted-foreground mt-1">{monthFilteredBuybacks.length} Barang Diterima Kembali</p>
          </div>
          <div className="glass p-4 rounded-xl border-t-2 border-emerald-500">
            <p className="text-sm text-muted-foreground">Arus Kas Kotor (Income - Out)</p>
            <p className="text-2xl font-bold text-emerald-400">Rp {(totalPenjualanRP - totalBuybackRP).toLocaleString("id-ID")}</p>
            <p className="text-xs text-muted-foreground mt-1">Saldo positif/negatif periode ini</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* TABEL PENJUALAN */}
          <div>
            <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
              <span className="text-primary tracking-widest uppercase text-sm font-black border border-primary/20 bg-primary/10 px-3 py-1 rounded-full">Penjualan Keluaran ({filteredTransactions.length})</span>
            </h3>
            <div className="glass rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-white/5">
              <div className="max-h-[400px] overflow-y-auto overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-black/60 sticky top-0 z-10 border-b border-white/10">
                    <tr>
                      <th className="p-4 font-medium text-white/50 w-1/5">Invoice & Waktu</th>
                      <th className="p-4 font-medium text-white/50 w-1/5">Pelanggan</th>
                      <th className="p-4 font-medium text-white/50 w-2/5">Detail Barang</th>
                      <th className="p-4 font-medium text-white/50 text-right w-1/5">Total Bayar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.length === 0 ? (
                      <tr><td colSpan={4} className="p-8 text-center text-muted-foreground bg-black/20">Tidak ada riwayat penjualan.</td></tr>
                    ) : (
                      filteredTransactions.map((t) => (
                        <tr 
                          key={t.id} 
                          onClick={() => setSelectedTx(t)}
                          className="border-b border-white/5 hover:bg-primary/20 transition-colors bg-black/20 cursor-pointer"
                        >
                          <td className="p-4">
                            <div className="font-mono font-bold text-primary">{t.invoice}</div>
                            <div className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleString("id-ID")}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-semibold">{t.customer.name}</div>
                            <div className="text-xs text-muted-foreground">{t.customer.phone}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-semibold">[{t.inventory.code}] {t.inventory.type} {t.inventory.karat} ({t.weight}g)</div>
                            <div className="text-xs text-muted-foreground">Dilayani: {t.user.name}</div>
                          </td>
                          <td className="p-4 text-right font-bold text-primary">
                            Rp {t.totalPrice.toLocaleString("id-ID")}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* TABEL BUYBACK */}
          <div>
            <h3 className="text-xl font-bold mt-8 mb-4 flex items-center gap-3">
              <span className="text-purple-400 tracking-widest uppercase text-sm font-black border border-purple-500/20 bg-purple-500/10 px-3 py-1 rounded-full">Buyback Masuk ({filteredBuybacks.length})</span>
            </h3>
            <div className="glass rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)] border border-purple-500/20">
              <div className="max-h-[400px] overflow-y-auto overflow-x-auto custom-scrollbar">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead className="bg-black/60 sticky top-0 z-10 border-b border-purple-500/20">
                    <tr>
                      <th className="p-4 font-medium text-purple-200">Waktu & Ref</th>
                      <th className="p-4 font-medium text-purple-200">Pelanggan</th>
                      <th className="p-4 font-medium text-purple-200">Detail Barang Return</th>
                      <th className="p-4 font-medium text-purple-200 text-right">Dibayar Toko</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredBuybacks.length === 0 ? (
                      <tr><td colSpan={4} className="p-8 text-center text-purple-500/50 bg-black/20">Tidak ada riwayat buyback.</td></tr>
                    ) : (
                      filteredBuybacks.map((b) => (
                        <tr 
                          key={b.id} 
                          onClick={() => setSelectedBuyback(b)}
                          className="border-b border-purple-500/10 hover:bg-purple-500/20 transition-colors bg-purple-950/10 cursor-pointer"
                        >
                          <td className="p-4">
                            <div className="font-mono text-purple-300 font-bold">{b.transaction.invoice}</div>
                            <div className="text-xs text-muted-foreground">{new Date(b.createdAt).toLocaleString("id-ID")}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-semibold">{b.customer.name}</div>
                            <div className="text-xs text-muted-foreground">{b.customer.phone}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-semibold">[{b.inventory.code}] {b.inventory.type}</div>
                            <div className="text-xs text-muted-foreground">Kasir: {b.user.name} | Pot. Rp{b.deduction.toLocaleString("id-ID")}</div>
                          </td>
                          <td className="p-4 text-right font-bold text-purple-400">
                            Rp {b.totalBuyback.toLocaleString("id-ID")}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TAMPILAN KHUSUS CETAK LAPORAN BULANAN DOKUMEN (PRINT) */}
      {!selectedTx && !selectedBuyback && (
      <div className="hidden print:block print:bg-white print:text-black print:w-full print:m-0" id="printable-monthly-report">
        <div className="text-center mb-8 border-b-2 border-black pb-4">
          <h1 className="text-3xl font-black font-sans uppercase">TOKO EMAS WIJAYA</h1>
          <h2 className="text-xl font-bold mt-1">LAPORAN REKAPITULASI PENJUALAN & BUYBACK</h2>
          <p className="text-gray-600 mt-2">
            Periode: {monthsIndo[parsedMonth.month]} {parsedMonth.year}
          </p>
          <p className="text-gray-800 font-bold mt-1">Kasir: {selectedCashier === "ALL" ? "Keseluruhan (Semua Kasir)" : selectedCashier}</p>
        </div>

        <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
           <div className="border border-black p-4">
              <h3 className="font-bold border-b border-black pb-2 mb-2">RINGKASAN PENJUALAN</h3>
              <div className="flex justify-between"><span>Jumlah Transaksi:</span> <span>{monthFilteredTxs.length} Nota</span></div>
              <div className="flex justify-between"><span>Total Gramasi Keluar:</span> <span>{totalPenjualanGram.toFixed(2)} g</span></div>
              <div className="flex justify-between font-bold mt-2 pt-2 border-t border-black border-dashed">
                 <span>Total Pemasukan:</span> <span>Rp {totalPenjualanRP.toLocaleString("id-ID")}</span>
              </div>
           </div>
           <div className="border border-black p-4">
              <h3 className="font-bold border-b border-black pb-2 mb-2">RINGKASAN BUYBACK</h3>
              <div className="flex justify-between"><span>Jumlah Barang Return:</span> <span>{monthFilteredBuybacks.length} Barang</span></div>
              <div className="flex justify-between text-white select-none"><span>-</span><span>-</span></div>
              <div className="flex justify-between font-bold mt-2 pt-2 border-t border-black border-dashed">
                 <span>Total Pengeluaran:</span> <span>Rp {totalBuybackRP.toLocaleString("id-ID")}</span>
              </div>
           </div>
        </div>

        <h3 className="font-bold text-lg mb-2">DAFTAR TRANSAKSI PENJUALAN</h3>
        <table className="w-full text-left text-xs whitespace-nowrap border-collapse border border-black mb-8">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-2 border border-black font-bold">Waktu</th>
              <th className="p-2 border border-black font-bold">No. Invoice</th>
              <th className="p-2 border border-black font-bold">Barang</th>
              <th className="p-2 border border-black font-bold text-right">Berat (g)</th>
              <th className="p-2 border border-black font-bold text-right">Nominal Bayar</th>
            </tr>
          </thead>
          <tbody>
            {monthFilteredTxs.map(t => (
              <tr key={t.id}>
                <td className="p-2 border border-black">{new Date(t.createdAt).toLocaleString("id-ID")}</td>
                <td className="p-2 border border-black font-mono">{t.invoice}</td>
                <td className="p-2 border border-black">[{t.inventory.code}] {t.inventory.type}</td>
                <td className="p-2 border border-black text-right">{t.weight}</td>
                <td className="p-2 border border-black text-right">Rp {t.totalPrice.toLocaleString("id-ID")}</td>
              </tr>
            ))}
            {monthFilteredTxs.length === 0 && (
              <tr><td colSpan={5} className="p-2 border border-black text-center">Tidak ada transaksi</td></tr>
            )}
          </tbody>
        </table>

        <div className="flex justify-end mt-16 print:mb-8">
           <div className="text-center">
             <p className="mb-16">Pimpinan Toko,</p>
             <p className="font-bold border-b border-black pb-1 px-4 inline-block">Bpk. Wijaya</p>
           </div>
        </div>
      </div>
      )}

      {/* MODALS DETAIL TRANSAKSI KHUSUS (TETAP DIPERTAHANKAN) */}
      <AnimatePresence>
        {selectedTx && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 print-override">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-black/80 backdrop-blur-sm print:hidden" onClick={() => setSelectedTx(null)} />
            <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="relative bg-white text-black p-8 rounded-xl shadow-2xl font-mono text-sm w-full max-w-sm" id="printable-receipt">
               <button onClick={() => setSelectedTx(null)} className="absolute top-4 right-4 text-gray-400 hover:text-black print:hidden">
                 <X size={20} />
               </button>
               
               <div className="text-center mb-6">
                 <h2 className="text-2xl font-bold font-sans">TOKO EMAS WIJAYA</h2>
                 <p className="text-gray-600">Salinan Arsip Histori</p>
                 <div className="border-b-2 border-dashed border-gray-400 mt-4"></div>
               </div>

               <div className="mb-4">
                 <div className="flex justify-between">
                   <span>No. Nota:</span> <span className="font-bold">{selectedTx.invoice}</span>
                 </div>
                 <div className="flex justify-between">
                   <span>Tanggal:</span> <span>{new Date(selectedTx.createdAt).toLocaleString("id-ID")}</span>
                 </div>
                 <div className="flex justify-between">
                   <span>Pelanggan:</span> <span className="font-bold">{selectedTx.customer.name}</span>
                 </div>
                 <div className="flex justify-between">
                   <span>Kasir:</span> <span>{selectedTx.user.name}</span>
                 </div>
               </div>

               <div className="border-b border-gray-300 mb-4"></div>

               <div className="mb-4">
                 <p className="font-bold mb-1 border-b border-gray-200 pb-1">Detail Emas:</p>
                 <div className="flex justify-between font-semibold">
                    <span>[{selectedTx.inventory.code}] {selectedTx.inventory.type} {selectedTx.inventory.karat}</span>
                    <span>{selectedTx.inventory.weight}g</span>
                 </div>
                 <div className="flex justify-between text-gray-600 mt-2">
                    <span>Harga per Gram:</span>
                    <span>Rp {selectedTx.pricePerGram.toLocaleString("id-ID")}</span>
                 </div>
                 <div className="flex justify-between text-gray-600">
                    <span>Ongkos Pembuatan:</span>
                    <span>Rp {selectedTx.ongkos.toLocaleString("id-ID")}</span>
                 </div>
               </div>

               <div className="border-b-2 border-dashed border-gray-400 mb-4"></div>

               <div className="flex justify-between text-lg font-bold">
                 <span>TOTAL BAYAR:</span>
                 <span>Rp {selectedTx.totalPrice.toLocaleString("id-ID")}</span>
               </div>
               
               <button onClick={handlePrint} className="w-full mt-6 py-2 bg-gray-100 hover:bg-gray-200 text-black font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors print:hidden">
                 <Printer size={16} /> Cetak Ulang Salinan
               </button>
            </motion.div>
          </div>
        )}

        {selectedBuyback && (
          <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 print-override">
            <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="absolute inset-0 bg-black/80 backdrop-blur-sm print:hidden" onClick={() => setSelectedBuyback(null)} />
            <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} exit={{opacity:0, scale:0.95}} className="relative bg-white text-black p-8 rounded-xl shadow-2xl font-mono text-sm w-full max-w-sm" id="printable-receipt">
               <button onClick={() => setSelectedBuyback(null)} className="absolute top-4 right-4 text-gray-400 hover:text-black print:hidden">
                 <X size={20} />
               </button>
               
               <div className="text-center mb-6">
                 <h2 className="text-2xl font-bold font-sans">BUKTI BUYBACK</h2>
                 <h2 className="text-lg font-bold font-sans text-gray-600">TOKO EMAS WIJAYA</h2>
                 <div className="border-b-2 border-dashed border-gray-400 mt-4"></div>
               </div>

               <div className="mb-4">
                 <div className="flex justify-between">
                   <span>Waktu:</span> <span>{new Date(selectedBuyback.createdAt).toLocaleString("id-ID")}</span>
                 </div>
                 <div className="flex justify-between overflow-hidden">
                   <span>Referensi:</span> <span className="font-bold truncate max-w-[150px]">{selectedBuyback.transaction.invoice}</span>
                 </div>
                 <div className="flex justify-between">
                   <span>Pelanggan:</span> <span className="font-bold">{selectedBuyback.customer.name}</span>
                 </div>
                 <div className="flex justify-between">
                   <span>Kasir:</span> <span>{selectedBuyback.user.name}</span>
                 </div>
               </div>

               <div className="border-b border-gray-300 mb-4"></div>

               <div className="mb-4">
                 <p className="font-bold mb-1 border-b border-gray-200 pb-1">Detail Barang Diterima:</p>
                 <div className="flex justify-between font-semibold">
                    <span>[{selectedBuyback.inventory.code}] {selectedBuyback.inventory.type} {selectedBuyback.inventory.karat}</span>
                    <span>{selectedBuyback.inventory.weight}g</span>
                 </div>
               </div>

               <div className="border-b-2 border-dashed border-gray-400 mb-4"></div>

               <div className="flex justify-between text-lg font-bold">
                 <span>TOTAL DIBAYAR:</span>
                 <span className="text-green-700">Rp {selectedBuyback.totalBuyback.toLocaleString("id-ID")}</span>
               </div>
               
               <button onClick={handlePrint} className="w-full mt-6 py-2 bg-gray-100 hover:bg-gray-200 text-black font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors print:hidden">
                 <Printer size={16} /> Cetak Bukti Buyback
               </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
