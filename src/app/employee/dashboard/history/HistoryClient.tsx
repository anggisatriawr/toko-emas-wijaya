"use client";

import { useState, useMemo } from "react";
import { Search, X, Printer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HistoryClientProps {
  transactions: any[];
  buybacks: any[];
}

export function HistoryClient({ transactions, buybacks }: HistoryClientProps) {
  const [searchTerm, setSearchTerm] = useState("");
  
  // States untuk Modal Detail
  const [selectedTx, setSelectedTx] = useState<any>(null);
  const [selectedBuyback, setSelectedBuyback] = useState<any>(null);

  const filteredTransactions = useMemo(() => {
    if (!searchTerm) return transactions;
    const lower = searchTerm.toLowerCase();
    return transactions.filter(t => 
      t.invoice.toLowerCase().includes(lower) ||
      t.customer.name.toLowerCase().includes(lower) ||
      t.customer.phone.toLowerCase().includes(lower) ||
      t.inventory.code.toLowerCase().includes(lower)
    );
  }, [transactions, searchTerm]);

  const filteredBuybacks = useMemo(() => {
    if (!searchTerm) return buybacks;
    const lower = searchTerm.toLowerCase();
    return buybacks.filter(b => 
      b.transaction.invoice.toLowerCase().includes(lower) ||
      b.customer.name.toLowerCase().includes(lower) ||
      b.customer.phone.toLowerCase().includes(lower) ||
      b.inventory.code.toLowerCase().includes(lower)
    );
  }, [buybacks, searchTerm]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8">
      <div className="print:hidden space-y-8">
        {/* Global Search Bar */}
        <div className="flex flex-col md:flex-row justify-between items-end gap-4">
        <div>
          <h2 className="text-2xl font-bold">Riwayat Transaksi Pribadi Anda</h2>
          <p className="text-muted-foreground mt-1">Klik pada baris riwayat manapun untuk melihat detail struk/nota.</p>
        </div>
        
        <div className="relative w-full md:w-96">
          <input 
            type="text" 
            placeholder="Cari No. Invoice, Pelanggan, Kode Emas..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:ring-1 focus:ring-primary shadow-[0_0_15px_rgba(251,191,36,0.1)]"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        </div>
      </div>

      <div className="space-y-6">
        {/* TABEL PENJUALAN */}
        <div>
          <h3 className="text-xl font-bold mb-4 flex items-center gap-3">
            <span className="text-primary tracking-widest uppercase text-sm font-black border border-primary/20 bg-primary/10 px-3 py-1 rounded-full">Penjualan Keluaran ({filteredTransactions.length})</span>
          </h3>
          <div className="glass rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <div className="max-h-[500px] overflow-y-auto overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-black/60 sticky top-0 z-10 backdrop-blur-md border-b border-white/10">
                  <tr>
                    <th className="p-4 font-medium text-white/50">Invoice & Waktu</th>
                    <th className="p-4 font-medium text-white/50">Pelanggan</th>
                    <th className="p-4 font-medium text-white/50">Detail Barang</th>
                    <th className="p-4 font-medium text-white/50 text-right border-x border-white/5">Penjualan Total</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-muted-foreground bg-black/20">Anda belum mencatat penjualan yang cocok.</td></tr>
                  ) : (
                    filteredTransactions.map((t) => (
                      <tr 
                        key={t.id} 
                        onClick={() => setSelectedTx(t)}
                        className="border-b border-white/5 hover:bg-primary/20 transition-colors bg-black/20 cursor-pointer"
                        title="Klik untuk melihat detail struk penjualan"
                      >
                        <td className="p-4">
                          <div className="font-mono font-bold text-primary">{t.invoice}</div>
                          <div className="text-xs text-muted-foreground">{new Date(t.createdAt).toLocaleString("id-ID")}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-white">{t.customer.name}</div>
                          <div className="text-xs text-muted-foreground">{t.customer.phone}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold">{t.inventory.type} {t.inventory.karat} ({t.inventory.code})</div>
                          <div className="text-xs text-muted-foreground">{t.weight}g @ Rp{t.pricePerGram.toLocaleString("id-ID")}/g + Ongkos Rp{t.ongkos.toLocaleString("id-ID")}</div>
                        </td>
                        <td className="p-4 text-right border-x border-white/5 font-bold text-xl text-primary">
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
          <h3 className="text-xl font-bold mt-12 mb-4 flex items-center gap-3">
            <span className="text-purple-400 tracking-widest uppercase text-sm font-black border border-purple-500/20 bg-purple-500/10 px-3 py-1 rounded-full">Buyback Masuk ({filteredBuybacks.length})</span>
          </h3>
          <div className="glass rounded-2xl overflow-hidden border border-purple-500/20 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
            <div className="max-h-[500px] overflow-y-auto overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-black/60 sticky top-0 z-10 backdrop-blur-md border-b border-purple-500/20">
                  <tr>
                    <th className="p-4 font-medium text-purple-200">Waktu Buyback</th>
                    <th className="p-4 font-medium text-purple-200">Pelanggan</th>
                    <th className="p-4 font-medium text-purple-200">Dari Transaksi (Nota Awal)</th>
                    <th className="p-4 font-medium text-purple-200 text-right border-x border-purple-500/10">Modal Keluar dari Toko</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBuybacks.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-purple-500/50 bg-black/20">Anda belum melayani buyback yang cocok.</td></tr>
                  ) : (
                    filteredBuybacks.map((b) => (
                      <tr 
                        key={b.id} 
                        onClick={() => setSelectedBuyback(b)}
                        className="border-b border-purple-500/10 hover:bg-purple-500/20 transition-colors bg-purple-950/10 cursor-pointer"
                        title="Klik untuk melihat detail resi buyback"
                      >
                        <td className="p-4">
                          <div className="text-xs text-purple-300 font-semibold">{new Date(b.createdAt).toLocaleString("id-ID")}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-white">{b.customer.name}</div>
                          <div className="text-xs text-muted-foreground">{b.customer.phone}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-mono font-bold">{b.transaction.invoice}</div>
                          <div className="text-xs text-muted-foreground">Barang: {b.inventory.code}</div>
                        </td>
                        <td className="p-4 text-right border-x border-purple-500/10 font-bold text-lg text-purple-400">
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

      {/* MODALS DETAIL TRANSAKSI */}
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
                 <p className="text-gray-600">Salinan Arsip Kasir Pribadi</p>
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
                 <Printer size={16} /> Cetak Ulang Nota
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
