"use client";

import { useState, useMemo } from "react";
import { PackagePlus, Save, Trash2, X, Search, ChevronDown, ChevronUp, Eye } from "lucide-react";
import { createInventoryItem, updateInventoryItem, deleteInventoryItem } from "./actions";

export function InventoryClient({ items }: { items: any[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<any | null>(null);
  
  // State untuk mengontrol Accordion mana yang terbuka
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    try {
      await createInventoryItem(formData);
      setIsAdding(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItem = async (id: string) => {
    if (confirm(`Simpan perubahan untuk barang ini?`)) {
      setLoading(true);
      try {
        const formData = new FormData();
        formData.append("id", id);
        if (editData.type) formData.append("type", editData.type);
        if (editData.karat) formData.append("karat", editData.karat);
        if (editData.weight !== undefined) formData.append("weight", editData.weight.toString());
        if (editData.ongkos !== undefined) formData.append("ongkos", editData.ongkos.toString());
        if (editData.status) formData.append("status", editData.status);
        if (editData.description !== undefined) formData.append("description", editData.description);
        if (editData.image) formData.append("image", editData.image);

        await updateInventoryItem(formData);
        setEditingId(null);
        setEditData(null);
      } catch (err: any) {
        alert(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleDelete = async (id: string, code: string) => {
    if (confirm(`Yakin hapus Emas dengan kode ${code}? Perhatian: Jika sudah terjual, data tidak bisa dihapus.`)) {
      setLoading(true);
      try {
        await deleteInventoryItem(id);
      } catch (err: any) {
        alert(err.message);
      }
      setLoading(false);
    }
  };

  const toggleGroup = (type: string) => {
    setOpenGroups(prev => ({ ...prev, [type]: !prev[type] }));
  };

  const filteredAndGroupedItems = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    const lowerSearch = searchTerm.toLowerCase();

    items.forEach(item => {
      // Filter by search term
      if (lowerSearch && !item.code.toLowerCase().includes(lowerSearch) && !item.type.toLowerCase().includes(lowerSearch)) {
        return;
      }
      if (!grouped[item.type]) grouped[item.type] = [];
      grouped[item.type].push(item);
    });

    return grouped;
  }, [items, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <input 
            type="text" 
            placeholder="Cari kode emas (CIN-001) atau jenis..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl p-3 pl-10 text-white focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        </div>

        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className="px-4 py-3 bg-primary text-black font-bold rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(251,191,36,0.3)] transition-transform hover:scale-105">
            <PackagePlus size={18} /> Daftarkan Emas Baru
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="glass p-6 rounded-2xl border border-primary/20 bg-primary/5 space-y-4 shadow-[0_0_30px_rgba(251,191,36,0.1)]">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg text-primary">Form Tambah Inventaris</h3>
            <button type="button" onClick={() => setIsAdding(false)} className="text-muted-foreground hover:text-white bg-white/5 p-2 rounded-lg transition-colors"><X size={20} /></button>
          </div>
          {error && <p className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">{error}</p>}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
             <div>
               <label className="text-xs text-muted-foreground mb-1 block">Kode Unik (ex: CIN-001)</label>
               <input name="code" required type="text" className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:border-primary focus:outline-none" />
             </div>
             <div>
               <label className="text-xs text-muted-foreground mb-1 block">Jenis Barang</label>
               <select name="type" required className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:border-primary focus:outline-none">
                 <option value="Cincin">Cincin</option>
                 <option value="Kalung">Kalung</option>
                 <option value="Gelang">Gelang</option>
                 <option value="Anting">Anting</option>
                 <option value="Liontin">Liontin</option>
               </select>
             </div>
             <div>
               <label className="text-xs text-muted-foreground mb-1 block">Kadar Karat</label>
               <select name="karat" required className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:border-primary focus:outline-none">
                 <option value="24K">24 Karat (99.9%)</option>
                 <option value="23K">23 Karat (95.8%)</option>
                 <option value="22K">22 Karat (91.6%)</option>
                 <option value="18K">18 Karat (75.0%)</option>
                 <option value="16K">16 Karat (66.6%)</option>
                 <option value="9K">9 Karat (42.0%)</option>
                 <option value="8K">8 Karat (37.5%)</option>
               </select>
             </div>
             <div>
               <label className="text-xs text-muted-foreground mb-1 block">Berat (gram)</label>
               <input name="weight" required type="number" step="0.01" className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:border-primary focus:outline-none" />
             </div>
             <div>
               <label className="text-xs text-muted-foreground mb-1 block">Ongkos Pembuatan (Rp)</label>
               <input name="ongkos" required type="number" step="1000" className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:border-primary focus:outline-none" />
             </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Foto Emas (Opsional)</label>
              <input name="image" type="file" accept="image/*" className="w-full bg-black/40 border border-white/10 rounded-lg p-2 text-white focus:border-primary focus:outline-none" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Deskripsi Singkat (Opsional)</label>
              <textarea name="description" placeholder="Contoh: Gelang oval dengan ukiran..." rows={2} className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white focus:border-primary focus:outline-none"></textarea>
            </div>
          </div>
          <button disabled={loading} type="submit" className="w-full py-3 bg-primary text-black font-bold rounded-lg disabled:opacity-50 mt-4 hover:bg-yellow-400 transition-colors">
            {loading ? "Menyimpan ke Database..." : "Simpan Inventaris"}
          </button>
        </form>
      )}

      {/* Menampilkan Data Terkelompok */}
      <div className="space-y-4">
        {Object.keys(filteredAndGroupedItems).length === 0 ? (
           <div className="glass p-8 text-center text-muted-foreground rounded-2xl">
             Belum ada data inventaris yang cocok.
           </div>
        ) : (
          Object.keys(filteredAndGroupedItems).map((groupType) => {
            const groupItems = filteredAndGroupedItems[groupType];
            // Open by default if searching, otherwise keep default (closed or previous toggle state)
            const isOpen = searchTerm ? true : openGroups[groupType] !== false; // default true first time
            
            return (
              <div key={groupType} className="border border-white/10 rounded-2xl overflow-hidden glass">
                <button 
                  onClick={() => toggleGroup(groupType)}
                  className="w-full p-4 flex justify-between items-center bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-lg tracking-wide uppercase text-primary">{groupType}</h3>
                    <span className="bg-black/40 px-3 py-1 rounded-full text-xs font-semibold text-white/70">
                      {groupItems.length} Item
                    </span>
                  </div>
                  {isOpen ? <ChevronUp className="text-muted-foreground" /> : <ChevronDown className="text-muted-foreground" />}
                </button>

                {isOpen && (
                  <div className="p-4 space-y-6 bg-black/20 border-t border-white/10">
                    {['AVAILABLE', 'SOLD', 'BUYBACK'].map((statusFilter) => {
                      const itemsInStatus = groupItems.filter(item => item.status === statusFilter);
                      if (itemsInStatus.length === 0) return null;
                      
                      let statusBadge = "";
                      let statusTitle = "";
                      if (statusFilter === 'AVAILABLE') { statusBadge = "text-blue-400"; statusTitle = "🟢 TERSEDIA"; }
                      if (statusFilter === 'SOLD') { statusBadge = "text-red-400"; statusTitle = "🔴 TERJUAL"; }
                      if (statusFilter === 'BUYBACK') { statusBadge = "text-purple-400"; statusTitle = "🟣 BUYBACK DALAM GUDANG"; }

                      return (
                        <div key={statusFilter} className="space-y-2">
                          <h4 className={`text-sm font-bold tracking-widest ${statusBadge}`}>
                            {statusTitle} ({itemsInStatus.length})
                          </h4>
                          
                          {/* Pembungkus Tabel dengan Batasan Tinggi (Scrollable) */}
                          <div className="max-h-[400px] overflow-y-auto overflow-x-auto border border-white/5 rounded-xl glass custom-scrollbar">
                            <table className="w-full text-left text-sm whitespace-nowrap">
                              <thead className="border-b border-white/5 bg-black/60 sticky top-0 z-10 backdrop-blur-md">
                                <tr>
                                  <th className="p-4 font-medium text-white/50 w-32">KODE</th>
                                  <th className="p-4 font-medium text-white/50">Detail Barang</th>
                                  <th className="p-4 font-medium text-white/50 text-right">Berat (g)</th>
                                  <th className="p-4 font-medium text-white/50 text-right">Ongkos</th>
                                  <th className="p-4 font-medium text-white/50 text-center">Status</th>
                                  <th className="p-4 font-medium text-white/50 text-right">Aksi</th>
                                </tr>
                              </thead>
                              <tbody>
                                {itemsInStatus.map((item) => (
                                  <tr key={item.id} className="border-b border-white/5 hover:bg-white/10 transition-colors">
                                    <td className="p-4 font-mono font-bold text-primary">{item.code}</td>
                                    <td className="p-4">
                                      {editingId === item.id ? (
                                        <div className="flex flex-col gap-2">
                                          <div className="flex gap-2">
                                            <select
                                              value={editData?.type || item.type}
                                              onChange={(e) => setEditData({ ...editData, type: e.target.value })}
                                              className="bg-black/80 border border-primary/50 text-primary rounded p-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                                            >
                                              <option value="Cincin">Cincin</option>
                                              <option value="Kalung">Kalung</option>
                                              <option value="Gelang">Gelang</option>
                                              <option value="Anting">Anting</option>
                                              <option value="Liontin">Liontin</option>
                                            </select>
                                            <select
                                              value={editData?.karat || item.karat}
                                              onChange={(e) => setEditData({ ...editData, karat: e.target.value })}
                                              className="bg-black/80 border border-primary/50 text-primary rounded p-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary w-20"
                                            >
                                              <option value="24K">24K</option>
                                              <option value="23K">23K</option>
                                              <option value="22K">22K</option>
                                              <option value="18K">18K</option>
                                              <option value="16K">16K</option>
                                              <option value="9K">9K</option>
                                              <option value="8K">8K</option>
                                            </select>
                                          </div>
                                          <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => setEditData({ ...editData, image: e.target.files?.[0] || null })}
                                            className="bg-black/80 border border-primary/50 text-primary rounded p-1 text-[10px] w-full"
                                            title="Ubah Foto Emas"
                                          />
                                          <textarea
                                            placeholder="Ubah deskripsi..."
                                            value={editData?.description !== undefined ? editData.description : (item.description || '')}
                                            onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                                            className="bg-black/80 border border-primary/50 text-primary rounded p-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary w-full resize-none"
                                            rows={2}
                                          ></textarea>
                                        </div>
                                      ) : (
                                        <>
                                          <div className="font-semibold">{item.type} {item.karat}</div>
                                          <div className="text-xs text-muted-foreground">Reg: {new Date(item.createdAt).toLocaleDateString("id-ID")}</div>
                                        </>
                                      )}
                                    </td>
                                    <td className="p-4 text-right font-mono text-gray-300">
                                      {editingId === item.id ? (
                                        <input
                                          type="number"
                                          step="0.01"
                                          value={editData?.weight !== undefined ? editData.weight : item.weight}
                                          onChange={(e) => setEditData({ ...editData, weight: e.target.value })}
                                          className="bg-black/80 border border-primary/50 text-primary rounded p-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary w-20 text-right"
                                        />
                                      ) : (
                                        `${item.weight} g`
                                      )}
                                    </td>
                                    <td className="p-4 text-right text-gray-300">
                                      {editingId === item.id ? (
                                        <input
                                          type="number"
                                          step="1000"
                                          value={editData?.ongkos !== undefined ? editData.ongkos : item.ongkos}
                                          onChange={(e) => setEditData({ ...editData, ongkos: e.target.value })}
                                          className="bg-black/80 border border-primary/50 text-primary rounded p-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary w-24 text-right"
                                        />
                                      ) : (
                                        `Rp ${item.ongkos.toLocaleString("id-ID")}`
                                      )}
                                    </td>
                                    <td className="p-4 text-center">
                                      {editingId === item.id ? (
                                        <select 
                                          value={editData?.status || item.status} 
                                          onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                                          className="bg-black/80 border border-primary/50 text-primary rounded p-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary w-32 relative z-20"
                                        >
                                          <option value="AVAILABLE">Tersedia</option>
                                          <option value="SOLD">Terjual</option>
                                          <option value="BUYBACK">Buyback</option>
                                        </select>
                                      ) : (
                                        <span className={`px-2.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider
                                          ${item.status === 'AVAILABLE' ? "bg-blue-500/20 text-blue-400 border border-blue-500/30" : 
                                            item.status === 'SOLD' ? "bg-red-500/20 text-red-400 border border-red-500/30 line-through decoration-red-500/50" : 
                                            "bg-purple-500/20 text-purple-400 border border-purple-500/30"}`}>
                                          {item.status}
                                        </span>
                                      )}
                                    </td>
                                    <td className="p-4 flex gap-2 justify-end">
                                      <button onClick={() => setSelectedItem(item)} className="p-2 bg-white/5 hover:bg-blue-500/20 border border-transparent hover:border-blue-500/30 rounded-lg text-blue-400 transition-colors" title="Lihat Detail">
                                        <Eye size={16} />
                                      </button>
                                      <button onClick={() => {
                                        if (editingId === item.id) {
                                          handleSaveItem(item.id);
                                        } else {
                                          setEditingId(item.id);
                                          setEditData({ type: item.type, karat: item.karat, weight: item.weight, ongkos: item.ongkos, status: item.status });
                                        }
                                      }} className={`p-2 rounded-lg transition-colors border ${editingId === item.id ? 'bg-primary/20 text-primary border-primary/50' : 'bg-white/5 text-white hover:bg-white/10 border-transparent'}`} title={editingId === item.id ? "Simpan Perubahan" : "Edit Barang"}>
                                        <Save size={16} />
                                      </button>
                                      <button onClick={() => handleDelete(item.id, item.code)} className="p-2 bg-white/5 hover:bg-destructive/20 border border-transparent hover:border-destructive/30 rounded-lg text-destructive transition-colors" title="Hapus Permanen">
                                        <Trash2 size={16} />
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Detail Emas */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl relative">
            <div className="flex justify-between items-center p-4 border-b border-white/10 bg-white/5">
              <h3 className="font-bold text-lg text-primary">Detail Inventaris Emas</h3>
              <button onClick={() => setSelectedItem(null)} className="text-muted-foreground hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Kolom Kiri: Foto & Deskripsi */}
              <div className="border-r border-white/10 flex flex-col p-6 bg-black/20">
                {selectedItem.imageUrl ? (
                  <div className="w-full h-64 bg-black/40 rounded-xl overflow-hidden border border-white/10 mb-4 flex-shrink-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={selectedItem.imageUrl} alt="Foto Emas" className="w-full h-full object-cover" />
                  </div>
                ) : (
                  <div className="w-full h-64 bg-white/5 rounded-xl border border-white/10 flex items-center justify-center text-muted-foreground mb-4 flex-shrink-0">
                    Tidak ada foto
                  </div>
                )}
                {selectedItem.description && (
                  <div className="flex-1">
                    <span className="text-muted-foreground text-xs uppercase tracking-wider font-bold block mb-2">Deskripsi</span>
                    <p className="text-white text-sm bg-white/5 p-4 rounded-xl border border-white/10 h-full">{selectedItem.description}</p>
                  </div>
                )}
              </div>

              {/* Kolom Kanan: Detail Spesifikasi */}
              <div className="p-6 space-y-5">
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-muted-foreground text-sm">Kode Unik</span>
                  <span className="font-mono font-bold text-primary text-lg">{selectedItem.code}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-muted-foreground text-sm">Jenis Barang</span>
                  <span className="font-semibold text-white">{selectedItem.type}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-muted-foreground text-sm">Kadar Karat</span>
                  <span className="font-semibold text-white">{selectedItem.karat}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-muted-foreground text-sm">Berat</span>
                  <span className="font-mono text-gray-300">{selectedItem.weight} Gram</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-muted-foreground text-sm">Ongkos Pembuatan</span>
                  <span className="font-mono text-gray-300">Rp {selectedItem.ongkos.toLocaleString("id-ID")}</span>
                </div>
                <div className="flex justify-between items-center border-b border-white/5 pb-3">
                  <span className="text-muted-foreground text-sm">Status Saat Ini</span>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide
                    ${selectedItem.status === 'AVAILABLE' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : 
                      selectedItem.status === 'SOLD' ? 'bg-red-500/20 text-red-400 border border-red-500/30 line-through decoration-red-500/50' : 
                      'bg-purple-500/20 text-purple-400 border border-purple-500/30'}`}>
                    {selectedItem.status}
                  </span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span className="text-muted-foreground text-sm">Tanggal Input</span>
                  <span className="text-gray-300 text-sm">{new Date(selectedItem.createdAt).toLocaleString("id-ID")}</span>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end">
              <button onClick={() => setSelectedItem(null)} className="px-6 py-2.5 bg-primary text-black font-bold rounded-xl hover:bg-yellow-400 transition-colors shadow-[0_0_15px_rgba(251,191,36,0.2)]">
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
