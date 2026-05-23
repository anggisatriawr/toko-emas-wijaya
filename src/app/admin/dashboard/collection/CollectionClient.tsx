"use client";

import { useState } from "react";
import { Upload, Trash2, Plus, Image as ImageIcon } from "lucide-react";
import { useRouter } from "next/navigation";

export function CollectionClient({ initialItems }: { initialItems: any[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [isUploading, setIsUploading] = useState(false);
  
  // Form States
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [price, setPrice] = useState("");

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !name || !weight || !price) return;
    
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name);
    formData.append("weight", weight);
    formData.append("price", price);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setItems([data.item, ...items]);
        // Reset form
        setFile(null);
        setName("");
        setWeight("");
        setPrice("");
        (document.getElementById("file-upload") as HTMLInputElement).value = "";
      } else {
        alert("Upload gagal: " + data.error);
      }
    } catch (err) {
      alert("Terjadi kesalahan saat upload.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus item ini dari katalog?")) return;
    
    const formData = new FormData();
    formData.append("action", "DELETE");
    formData.append("id", id);
    
    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        setItems(items.filter(i => i.id !== id));
      }
    } catch (err) {
      alert("Gagal menghapus item");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Upload Form */}
      <div className="lg:col-span-1">
        <div className="glass p-6 rounded-2xl border border-white/10 sticky top-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2 border-b border-white/10 pb-4">
            <Plus className="text-primary" /> Tambah Koleksi Baru
          </h3>
          <form onSubmit={handleUpload} className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground mb-1.5 block">Foto Perhiasan (Rekomendasi: 1:1 Square)</label>
              <div className="relative group overflow-hidden rounded-xl border border-dashed border-white/20 bg-black/40 hover:bg-black/60 transition-colors h-32 flex flex-col items-center justify-center text-center cursor-pointer">
                 <input 
                   type="file"
                   id="file-upload"
                   accept="image/*"
                   className="absolute inset-0 opacity-0 cursor-pointer z-10"
                   onChange={(e) => setFile(e.target.files?.[0] || null)}
                 />
                 {file ? (
                   <span className="text-primary font-semibold text-sm px-4 truncate w-full">{file.name}</span>
                 ) : (
                   <>
                     <Upload className="text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
                     <span className="text-xs text-muted-foreground px-4">Klik atau Tarik foto ke sini</span>
                   </>
                 )}
              </div>
            </div>

            <div>
              <label className="text-sm text-muted-foreground mb-1 block">Nama Perhiasan</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Contoh: Kalung Emas 24K" required className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-primary outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Berat</label>
                <input type="text" value={weight} onChange={e => setWeight(e.target.value)} placeholder="Contoh: 10g" required className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-primary outline-none" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-1 block">Harga (Rp)</label>
                <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="0" required className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:ring-1 focus:ring-primary outline-none" />
              </div>
            </div>

            <button disabled={isUploading || !file} type="submit" className="w-full bg-primary hover:bg-primary/90 text-black font-bold py-3.5 rounded-xl transition-all disabled:opacity-50 mt-4 flex justify-center items-center gap-2">
              {isUploading ? "Mengunggah..." : <><Upload size={18} /> Unggah ke Landing Page</>}
            </button>
          </form>
        </div>
      </div>

      {/* Roster / Live Preview */}
      <div className="lg:col-span-2">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold flex items-center gap-2">
            <ImageIcon className="text-primary" /> Daftar Etalase
          </h3>
          <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold">
             {items.length} Item Tersimpan (6 Terbaru Tampil di Depan)
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map((item, idx) => {
             const isFeatured = idx < 6;
             return (
              <div key={item.id} className={`glass p-4 rounded-xl flex gap-4 ${isFeatured ? 'border border-primary/30 shadow-[0_0_15px_rgba(251,191,36,0.1)]' : 'border border-white/5 opacity-70'}`}>
                <div className="w-24 h-24 bg-black/40 rounded-lg overflow-hidden flex-shrink-0 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                  {isFeatured && <div className="absolute top-0 right-0 bg-primary text-black text-[10px] font-bold px-1.5 py-0.5 rounded-bl-lg">LIVE</div>}
                </div>
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <h4 className="font-bold text-lg leading-tight truncate max-w-[150px]" title={item.name}>{item.name}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">{item.weight}</p>
                    <p className="text-sm font-bold text-primary mt-1">Rp {typeof item.price === "number" ? item.price.toLocaleString("id-ID") : item.price}</p>
                  </div>
                  <div className="flex justify-end">
                    <button onClick={() => handleDelete(item.id)} className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
          {items.length === 0 && (
            <div className="col-span-1 md:col-span-2 text-center p-12 glass border border-white/10 rounded-xl">
              <ImageIcon className="mx-auto text-muted-foreground mb-4 opacity-50" size={48} />
              <p className="text-muted-foreground">Etalase masih kosong. Mulai unggah perhiasan pertama Anda!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
