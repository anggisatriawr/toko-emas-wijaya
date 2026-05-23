"use client";

import { useState } from "react";
import { UserPlus, Save, Trash2, KeyRound, EyeOff, Eye, X } from "lucide-react";
import { createEmployee, deleteEmployee, updateEmployee } from "./actions";

export function EmployeeClient({ employees }: { employees: any[] }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const formData = new FormData(e.currentTarget);
    try {
      await createEmployee(formData);
      setIsAdding(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>, id: string) => {
    e.preventDefault();
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    try {
      await updateEmployee(id, formData);
      setEditingId(null);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Yakin ingin menghapus akun karyawan ${name}?`)) {
      setLoading(true);
      await deleteEmployee(id);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end mb-4">
        {!isAdding && (
          <button onClick={() => setIsAdding(true)} className="px-4 py-2 bg-primary text-black font-bold rounded-xl flex items-center gap-2">
            <UserPlus size={18} /> Tambah Pegawai
          </button>
        )}
      </div>

      {isAdding && (
        <form onSubmit={handleCreate} className="glass p-6 rounded-2xl border border-primary/20 bg-primary/5 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-bold text-lg text-primary">Form Tambah Pegawai Baru</h3>
            <button type="button" onClick={() => setIsAdding(false)} className="text-muted-foreground hover:text-white"><X size={20} /></button>
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div>
               <label className="text-xs text-muted-foreground mb-1 block">Nama Lengkap</label>
               <input name="name" required type="text" className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white" placeholder="Sutejo" />
             </div>
             <div>
               <label className="text-xs text-muted-foreground mb-1 block">Username</label>
               <input name="username" required type="text" className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white" placeholder="sutejo123" />
             </div>
             <div>
               <label className="text-xs text-muted-foreground mb-1 block">Password</label>
               <input name="password" required type="password" className="w-full bg-black/40 border border-white/10 rounded-lg p-2.5 text-white" placeholder="******" pattern="[a-zA-Z0-9]+" title="Password hanya boleh berisi huruf dan angka" />
             </div>
          </div>
          <button disabled={loading} type="submit" className="w-full py-2.5 bg-primary text-black font-bold rounded-lg disabled:opacity-50">
            {loading ? "Menyimpan..." : "Simpan Pegawai"}
          </button>
        </form>
      )}

      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="p-4 font-medium text-muted-foreground">Profil Pegawai</th>
                <th className="p-4 font-medium text-muted-foreground">Username Limitasi</th>
                <th className="p-4 font-medium text-muted-foreground">Status Aktif</th>
                <th className="p-4 font-medium text-muted-foreground text-right">Aksi Manajemen</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 && (
                <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Belum ada akun pegawai terdaftar.</td></tr>
              )}
              {employees.map((emp) => (
                <tr key={emp.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  {editingId === emp.id ? (
                    <td colSpan={4} className="p-4">
                       <form onSubmit={(e) => handleUpdate(e, emp.id)} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                          <div>
                            <label className="text-xs">Ubah Nama</label>
                            <input name="name" defaultValue={emp.name} className="w-full bg-black/40 border border-white/10 rounded-md p-2 text-white" />
                          </div>
                          <div>
                            <label className="text-xs text-primary">Reset Password (opsional)</label>
                            <input name="password" type="text" placeholder="Kosongkan jika tidak diubah" className="w-full bg-black/40 border border-primary/30 rounded-md p-2 text-white placeholder:text-muted-foreground" pattern="[a-zA-Z0-9]+" title="Password hanya boleh berisi huruf dan angka" />
                          </div>
                          <div>
                            <label className="text-xs">Status Akun</label>
                            <select name="isActive" defaultValue={emp.isActive ? "true" : "false"} className="w-full bg-black/40 border border-white/10 rounded-md p-2 text-white">
                              <option value="true">AKTIP</option>
                              <option value="false">NONAKTIF/BLOKIR</option>
                            </select>
                          </div>
                          <div className="flex gap-2 justify-end">
                            <button disabled={loading} type="submit" className="px-3 py-2 bg-primary text-black rounded-md flex items-center gap-1 font-semibold flex-1 justify-center"><Save size={16}/> Save</button>
                            <button type="button" onClick={() => setEditingId(null)} className="px-3 py-2 bg-white/10 rounded-md flex items-center gap-1 font-semibold"><X size={16}/> Batal</button>
                          </div>
                       </form>
                    </td>
                  ) : (
                    <>
                      <td className="p-4">
                        <div className="font-medium text-white">{emp.name}</div>
                        <div className="text-xs text-muted-foreground">Terdaftar: {new Date(emp.createdAt).toLocaleDateString("id-ID")}</div>
                      </td>
                      <td className="p-4 font-mono text-muted-foreground">{emp.username}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${emp.isActive ? "bg-green-500/20 text-green-400 border border-green-500/30" : "bg-red-500/20 text-red-400 border border-red-500/30"}`}>
                          {emp.isActive ? "Aktif" : "Non-Aktif (Dihentikan)"}
                        </span>
                      </td>
                      <td className="p-4 flex gap-2 justify-end">
                        <button onClick={() => setEditingId(emp.id)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-primary transition-colors" title="Edit atau Reset Password">
                          <KeyRound size={16} />
                        </button>
                        <button onClick={() => handleDelete(emp.id, emp.name)} className="p-2 bg-white/5 hover:bg-destructive/20 rounded-lg text-destructive transition-colors" title="Hapus Akun">
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
