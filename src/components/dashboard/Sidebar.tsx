"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, Package, DollarSign, ListOrdered, Calendar, History, LogOut, ArrowLeftRight, Image as ImageIcon } from "lucide-react";
import { signOut } from "next-auth/react";

const adminLinks = [
  { name: "Dashboard", href: "/admin/dashboard", icon: <DollarSign size={20} /> },
  { name: "Manajemen Karyawan", href: "/admin/dashboard/employees", icon: <User size={20} /> },
  { name: "Manajemen Inventaris", href: "/admin/dashboard/inventory", icon: <Package size={20} /> },
  { name: "Harga Emas", href: "/admin/dashboard/price", icon: <DollarSign size={20} /> },
  { name: "Katalog Koleksi", href: "/admin/dashboard/collection", icon: <ImageIcon size={20} /> },
  { name: "Monitoring Transaksi", href: "/admin/dashboard/transactions", icon: <ListOrdered size={20} /> },
  { name: "Absensi", href: "/admin/dashboard/attendance", icon: <Calendar size={20} /> },
];

const employeeLinks = [
  { name: "Dashboard", href: "/employee/dashboard", icon: <ListOrdered size={20} /> },
  { name: "Transaksi Baru", href: "/employee/dashboard/pos", icon: <DollarSign size={20} /> },
  { name: "Buyback", href: "/employee/dashboard/buyback", icon: <ArrowLeftRight size={20} /> },
  { name: "Riwayat Transaksi", href: "/employee/dashboard/history", icon: <History size={20} /> },
  { name: "Absensi", href: "/employee/dashboard/attendance", icon: <Calendar size={20} /> },
];

export function Sidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const links = role === "ADMIN" ? adminLinks : employeeLinks;

  return (
    <div className="w-64 h-screen bg-black/60 glass border-r border-white/10 flex flex-col p-4 fixed left-0 top-0 z-40">
      <div className="mb-8 mt-2 flex items-center justify-center gap-2">
         <div className="w-10 h-10 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Logo Toko Emas Wijaya" className="w-full h-full object-contain" />
         </div>
         <span className="text-xl font-bold bg-gradient-to-r from-primary to-yellow-200 bg-clip-text text-transparent">
            Wijaya
         </span>
      </div>

      <nav className="flex-1 space-y-1">
        {links.map((link) => {
          const isActive = pathname === link.href || (pathname.startsWith(link.href) && link.href !== `/admin/dashboard` && link.href !== `/employee/dashboard`);
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl transition-all ${
                isActive 
                  ? "bg-primary text-primary-foreground font-bold shadow-[0_0_10px_rgba(251,191,36,0.2)]" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-white"
              }`}
            >
              {link.icon}
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-8 pt-4 border-t border-white/10">
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          className="flex items-center gap-3 px-3 py-3 text-sm font-medium rounded-xl w-full text-left text-red-400 hover:bg-red-400/10 transition-colors"
        >
          <LogOut size={20} />
          Keluar Sistem
        </button>
      </div>
    </div>
  );
}
