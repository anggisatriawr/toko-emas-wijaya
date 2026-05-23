import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/dashboard/Sidebar";

export default async function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  if ((session.user as any).role !== "EMPLOYEE") {
    redirect("/dashboard");
  }

  return (
    <div className="flex h-screen bg-background print:bg-white print:text-black overflow-hidden relative print:overflow-visible">
      <div className="print:hidden">
        <Sidebar role="EMPLOYEE" />
      </div>
      <div className="flex-1 ml-64 print:ml-0 overflow-y-auto print:overflow-visible w-full p-8 print:p-0 text-white print:text-black relative">
        <div className="absolute inset-0 bg-primary/5 blur-[150px] -z-10 rounded-full print:hidden" />
        <header className="flex justify-between items-center mb-8 border-b border-white/10 pb-4 print:hidden">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-yellow-200 bg-clip-text text-transparent">Pegawai Toko</h1>
            <p className="text-muted-foreground">Kasir dan Transaksi Emas</p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm">Hi, <b className="text-primary">{session.user?.name}</b></span>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
