"use client";

import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await signIn("credentials", {
      redirect: false,
      username,
      password,
    });

    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <div className="min-h-screen bg-background relative flex items-center justify-center overflow-hidden">
      {/* Background glowing effects
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" /> */}

      <Link href="/" className="absolute top-6 left-6 text-muted-foreground hover:text-white transition-colors">
        &larr; Kembali
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass p-10 rounded-3xl w-full max-w-md border border-white/10 shadow-2xl relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 flex items-center justify-center mx-auto mb-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Logo Toko Emas Wijaya" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent">Login Pegawai</h1>
          <p className="text-muted-foreground text-sm mt-2">Sistem Informasi Toko Emas Wijaya</p>
        </div>

        {error && (
          <div className="bg-destructive/20 border border-destructive/50 text-destructive-foreground p-3 rounded-lg mb-6 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Username</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <User size={18} />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                placeholder="Masukkan username"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Password</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <Lock size={18} />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                placeholder="Masukkan password"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-primary-foreground font-bold rounded-xl py-3 shadow-[0_0_15px_rgba(251,191,36,0.2)] hover:shadow-[0_0_25px_rgba(251,191,36,0.4)] transition-all flex items-center justify-center"
          >
            {loading ? "Memproses..." : "Masuk ke Sistem"}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
