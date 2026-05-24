"use client";
import { useState, useMemo, useRef, useEffect } from "react";
import { processTransaction } from "./actions";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, Check, X } from "lucide-react";

import { getSellKaratMultiplier } from "@/lib/karat";

export function PosForm({ inventory, dailyPrice }: { inventory: any[], dailyPrice: any }) {
  const [customer, setCustomer] = useState({ name: "", phone: "", address: "" });
  const [selectedItemId, setSelectedItemId] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [successData, setSuccessData] = useState<any>(null);

  // Combobox State
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedItem = useMemo(() => inventory.find((i) => i.id === selectedItemId), [selectedItemId, inventory]);
  
  // Set search term when item is selected
  useEffect(() => {
    if (selectedItem) {
      setSearchTerm(`[${selectedItem.code}] ${selectedItem.type} ${selectedItem.karat} - ${selectedItem.weight}g`);
    } else if (!dropdownOpen) {
      setSearchTerm("");
    }
  }, [selectedItem, dropdownOpen]);

  const pricePerGram = useMemo(() => {
    if (!selectedItem) return 0;
    return Math.round(dailyPrice.sellPerGram * getSellKaratMultiplier(selectedItem.karat));
  }, [selectedItem, dailyPrice]);

  const totalPrice = useMemo(() => {
    if (!selectedItem) return 0;
    return (selectedItem.weight * pricePerGram) + selectedItem.ongkos;
  }, [selectedItem, pricePerGram]);

  const handleReset = () => {
    setCustomer({ name: "", phone: "", address: "" });
    setSelectedItemId("");
    setSearchTerm("");
    setStatus("idle");
    setErrorMessage("");
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedItemId) {
      setErrorMessage("Barang belum dipilih dari inventaris.");
      setStatus("error");
      return;
    }
    
    setStatus("loading");
    setErrorMessage("");

    try {
      const result = await processTransaction({
        customerName: customer.name,
        customerPhone: customer.phone,
        customerAddress: customer.address,
        inventoryId: selectedItemId
      });

      if (result.success) {
        setSuccessData({ transaction: result.transaction, customer, item: selectedItem });
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMessage(result.error);
      }
    } catch(err: any) {
      setStatus("error");
      setErrorMessage(err.message);
    }
  }

  // Grup data inventaris berdasarkan "type" untuk memudahkan pencarian
  const filteredAndGroupedInventory = useMemo(() => {
    const term = searchTerm.toLowerCase();
    
    // Jika ada item terpilih dan searchTerm persis sama dengan nama item tersebut (efek klik), 
    // tampilin semua (atau biarkan list tetap muncul semua agar user bisa pilih yg lain).
    // Tapi jika user mulai mengetik sesuatu yg berbeda dari nama item terpilih, filter ulang.
    const isTypingSearch = !selectedItem || searchTerm !== `[${selectedItem.code}] ${selectedItem.type} ${selectedItem.karat} - ${selectedItem.weight}g`;

    const filtered = inventory.filter((item) => {
      if (!isTypingSearch) return true;
      return item.code.toLowerCase().includes(term) || item.type.toLowerCase().includes(term);
    });

    const grouped: Record<string, any[]> = {};
    filtered.forEach(item => {
      if (!grouped[item.type]) grouped[item.type] = [];
      grouped[item.type].push(item);
    });
    return grouped;
  }, [searchTerm, inventory, selectedItem]);

  if (status === "success" && successData) {
    const { transaction, customer: cust, item } = successData;
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass print-override p-8 rounded-2xl border border-primary/20 max-w-lg mx-auto">
        <div className="bg-white text-black p-8 rounded-xl shadow-lg font-mono text-sm relative overflow-hidden" id="printable-receipt">
          {/* Efek Kertas Nota */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200"></div>
          
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold font-sans">TOKO EMAS WIJAYA</h2>
            <p className="text-gray-600">Jl. Merdeka No 1, Pusat Kota</p>
            <p className="text-gray-600">Telp: 0812-XXXX-XXXX</p>
            <div className="border-b-2 border-dashed border-gray-400 mt-4"></div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between">
              <span>No. Nota:</span> <span className="font-bold">{transaction.invoice}</span>
            </div>
            <div className="flex justify-between">
              <span>Tanggal:</span> <span>{new Date(transaction.createdAt).toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between">
              <span>Pelanggan:</span> <span className="font-bold">{cust.name}</span>
            </div>
            <div className="flex justify-between">
              <span>No. HP:</span> <span>{cust.phone}</span>
            </div>
          </div>

          <div className="border-b border-gray-300 mb-4"></div>

          <div className="mb-4">
            <p className="font-bold mb-1 border-b border-gray-200 pb-1">Detail Emas:</p>
            <div className="flex justify-between font-semibold">
               <span>[{item.code}] {item.type} {item.karat}</span>
               <span>{item.weight}g</span>
            </div>
            <div className="flex justify-between text-gray-600 mt-2">
               <span>Harga per Gram:</span>
               <span>Rp {transaction.pricePerGram.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between text-gray-600">
               <span>Ongkos Pembuatan:</span>
               <span>Rp {transaction.ongkos.toLocaleString("id-ID")}</span>
            </div>
          </div>

          <div className="border-b-2 border-dashed border-gray-400 mb-4"></div>

          <div className="flex justify-between text-lg font-bold">
            <span>TOTAL BAYAR:</span>
            <span>Rp {transaction.totalPrice.toLocaleString("id-ID")}</span>
          </div>

          <div className="mt-8 text-center text-xs text-gray-500">
            <p>Terima kasih atas kunjungan Anda!</p>
            <p>Barang yang sudah dibeli dapat dijual kembali / ditukar dengan menyertakan nota ini.</p>
          </div>
        </div>

        <div className="mt-6 flex gap-4 print:hidden">
          <button 
            onClick={() => window.print()}
            className="flex-1 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all"
          >
            Cetak Nota (Print)
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="flex-1 py-3 bg-primary text-black font-bold rounded-xl shadow-[0_0_20px_rgba(251,191,36,0.3)] transition-all hover:bg-yellow-400"
          >
            Transaksi Baru
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Kolom Kiri: Data Pelanggan */}
      <div className="glass p-6 rounded-2xl space-y-4">
        <h3 className="text-lg font-semibold border-b border-white/10 pb-2 mb-4">1. Data Pelanggan</h3>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Nama Lengkap</label>
          <input required type="text" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-1 focus:ring-primary"
            value={customer.name} onChange={(e) => setCustomer({...customer, name: e.target.value})}
            placeholder="John Doe" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">No. HP (WhatsApp)</label>
          <input required type="text" className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-1 focus:ring-primary"
            value={customer.phone} onChange={(e) => setCustomer({...customer, phone: e.target.value})}
            placeholder="08123456789" />
        </div>
        <div>
          <label className="text-sm text-muted-foreground mb-1 block">Alamat</label>
          <textarea required className="w-full bg-black/40 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:ring-1 focus:ring-primary"
            value={customer.address} onChange={(e) => setCustomer({...customer, address: e.target.value})}
            placeholder="Jl. Merdeka No 1" rows={3}></textarea>
        </div>
      </div>

      {/* Kolom Kanan: Barang & Perhitungan */}
      <div className="glass p-6 rounded-2xl space-y-6 flex flex-col h-full relative" style={{ overflow: "visible" }}>
        <h3 className="text-lg font-semibold border-b border-white/10 pb-2">2. Data Emas</h3>
        
        {/* Custom ComboBox / Searchable Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <label className="text-sm text-muted-foreground mb-1 block">Piliha atau Ketik Kode/Jenis Barang</label>
          <div className="relative">
             <input
                type="text"
                placeholder="Misal: Kalung atau C-001..."
                value={searchTerm}
                onChange={(e) => {
                   setSearchTerm(e.target.value);
                   setDropdownOpen(true);
                   if (selectedItemId) setSelectedItemId(""); // Reset id selection if user starts typing manually
                }}
                onFocus={() => setDropdownOpen(true)}
                className="w-full bg-black/40 border border-white/10 rounded-lg p-3 pl-10 pr-10 text-white focus:outline-none focus:ring-1 focus:ring-primary"
             />
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
             {searchTerm && (
               <button type="button" onClick={() => { setSearchTerm(""); setSelectedItemId(""); setDropdownOpen(true); }} className="absolute right-10 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white">
                 <X size={16} />
               </button>
             )}
             <button type="button" onClick={() => setDropdownOpen(!dropdownOpen)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white">
                 <ChevronDown size={18} />
             </button>
          </div>

          <AnimatePresence>
            {dropdownOpen && (
               <motion.div 
                 initial={{ opacity: 0, y: -10 }} 
                 animate={{ opacity: 1, y: 0 }} 
                 exit={{ opacity: 0, scale: 0.95 }}
                 className="absolute z-50 w-full mt-2 bg-gray-900 border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden max-h-60 overflow-y-auto"
               >
                 {Object.keys(filteredAndGroupedInventory).length === 0 ? (
                   <div className="p-4 text-center text-sm text-muted-foreground">Tidak ada barang yang cocok.</div>
                 ) : (
                   Object.keys(filteredAndGroupedInventory).map((groupType) => (
                     <div key={groupType}>
                       <div className="bg-black/60 px-3 py-1.5 text-xs font-bold text-primary sticky top-0 uppercase tracking-widest backdrop-blur-md">
                         Kategori {groupType}
                       </div>
                       <ul>
                         {filteredAndGroupedInventory[groupType].map((item) => {
                           const isSelected = selectedItemId === item.id;
                           return (
                             <li 
                               key={item.id}
                               onClick={() => {
                                 setSelectedItemId(item.id);
                                 setDropdownOpen(false);
                               }}
                               className={`px-4 py-3 cursor-pointer flex items-center justify-between text-sm transition-colors border-b border-white/5 last:border-0 ${isSelected ? "bg-primary/20 text-white" : "hover:bg-white/10 text-gray-300"}`}
                             >
                               <div>
                                 <span className="font-mono text-primary mr-2">[{item.code}]</span>
                                 <span className="font-semibold">{item.type} {item.karat}</span> 
                                 <span className="text-muted-foreground ml-2">({item.weight}g)</span>
                               </div>
                               {isSelected && <Check size={16} className="text-primary" />}
                             </li>
                           );
                         })}
                       </ul>
                     </div>
                   ))
                 )}
               </motion.div>
            )}
          </AnimatePresence>
        </div>

        {selectedItem && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4 flex-1">
            {/* Info Tambahan (Foto & Deskripsi) */}
            {(selectedItem.imageUrl || selectedItem.description) && (
              <div className="bg-black/20 border border-white/10 rounded-xl p-4 flex gap-4 items-start">
                {selectedItem.imageUrl && (
                  <div className="w-20 h-20 rounded-lg overflow-hidden bg-black/40 flex-shrink-0 border border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selectedItem.imageUrl} alt="Foto Emas" className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-bold text-primary mb-1 text-sm">Info Barang</h4>
                  <p className="text-xs text-gray-300 leading-relaxed">{selectedItem.description || "Tidak ada deskripsi tambahan."}</p>
                </div>
              </div>
            )}

            {/* Rincian Perhitungan */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <h4 className="font-semibold text-primary mb-3">Rincian Perhitungan</h4>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Harga Dasar (24K)</span>
                <span>Rp {dailyPrice.sellPerGram.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Harga per Gram ({selectedItem.karat})</span>
                <span className="font-bold">Rp {pricePerGram.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted-foreground">Berat Barang</span>
                <span>{selectedItem.weight} g</span>
              </div>
              <div className="flex justify-between text-sm border-b border-primary/20 pb-2 mb-2">
                <span className="text-muted-foreground">Ongkos Pembuatan</span>
                <span>Rp {selectedItem.ongkos.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between text-lg font-bold mt-4">
                <span>Total Bayar</span>
                <span className="text-primary">Rp {totalPrice.toLocaleString("id-ID")}</span>
              </div>
            </div>
          </motion.div>
        )}

        {status === "error" && (
          <div className="bg-red-500/20 text-red-200 p-3 rounded-lg text-sm text-center">
            {errorMessage}
          </div>
        )}

        <div className="flex gap-4 mt-auto pt-4">
          <button type="button" onClick={handleReset} className="w-1/3 py-4 rounded-xl bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-white font-bold text-lg transition-all border border-white/10 hover:border-red-500/30">
            Batal
          </button>
          <button disabled={!selectedItem || status === "loading"} type="submit" className="flex-1 py-4 rounded-xl bg-primary text-black font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:shadow-[0_0_20px_rgba(251,191,36,0.3)]">
            {status === "loading" ? "Menyimpan Transaksi..." : "Simpan & Cetak Nota"}
          </button>
        </div>
      </div>
    </form>
  )
}
