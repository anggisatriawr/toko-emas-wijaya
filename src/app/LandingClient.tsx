"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, MapPin, Star, TrendingUp, ShieldCheck } from "lucide-react";

export function LandingClient({ featuredItems, currentPrice }: { featuredItems: any[], currentPrice: any }) {
  const goldPriceSell = currentPrice?.sellPerGram || 0;
  const goldPriceBuy = currentPrice?.buyPerGram || 0;

  const dummyProducts = [
    { id: 1, name: "Cincin Emas Murni 24K", weight: "5g", price: 6850000, image: "💍" },
    { id: 2, name: "Kalung Emas Putih 18K", weight: "10g", price: 10500000, image: "📿" },
    { id: 3, name: "Gelang Emas Berlian", weight: "15g", price: 21000000, image: "💫" },
  ];

  const itemsToDisplay = featuredItems.length > 0 ? featuredItems : dummyProducts;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Background glowing effects */}
      {/* <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full pointer-events-none" /> */}

      {/* Navbar */}
      <nav className="glass sticky top-0 z-50 px-6 py-4 flex justify-between items-center border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-12 h-12 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Logo Toko Emas Wijaya" className="w-full h-full object-contain" />
          </div>
          <span className="text-xl font-bold bg-gradient-to-r from-primary to-yellow-200 bg-clip-text text-transparent">
            Toko Emas Wijaya
          </span>
        </div>
        <div>
          <Link href="/auth/login">
            <button className="px-5 py-2.5 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 rounded-full font-medium transition-all flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              Sistem Internal
            </button>
          </Link>
        </div>
      </nav>

      <main className="container mx-auto px-6 pt-20 pb-24 relative z-10">
        {/* Hero Section */}
        <section className="text-center max-w-3xl mx-auto mb-24">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight"
          >
            Kemilau Emas <br />
            <span className="text-primary italic">Investasi Masa Depan</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground text-lg mb-10"
          >
            Koleksi perhiasan emas berkualitas tinggi dengan harga transparan dan terpercaya sejak tahun 1990.
          </motion.p>

          {/* Info Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left"
          >
            <div className="glass p-6 rounded-2xl hover:scale-105 transition-transform">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4 text-primary">
                <TrendingUp />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Harga Beli Toko (Buyback)</p>
              <h3 className="text-2xl font-bold">Rp {goldPriceBuy.toLocaleString("id-ID")}<span className="text-sm font-normal text-muted-foreground">/g</span></h3>
            </div>

            <div className="glass p-6 rounded-2xl border-primary/30 shadow-[0_0_15px_rgba(251,191,36,0.1)] hover:scale-105 transition-transform">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4 text-primary">
                <TrendingUp />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Harga Jual Toko (Hari Ini)</p>
              <h3 className="text-2xl font-bold text-primary">Rp {goldPriceSell.toLocaleString("id-ID")}<span className="text-sm font-normal text-primary/70">/g</span></h3>
            </div>

            <div className="glass p-6 rounded-2xl hover:scale-105 transition-transform">
              <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center mb-4 text-primary">
                <MapPin />
              </div>
              <p className="text-sm text-muted-foreground mb-1">Lokasi Toko</p>
              <h3 className="text-md font-semibold font-sans mt-2">Jl. Raya Mojo<br />Kediri, Jawa Timur</h3>
            </div>
          </motion.div>
        </section>

        {/* Featured Products */}
        <section>
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-3xl font-bold mb-2">Koleksi Terkini</h2>
              <p className="text-muted-foreground">Perhiasan pilihan dengan desain eksklusif langsung dari etalase kami</p>
            </div>
            <div className="flex items-center gap-1 text-primary text-sm font-semibold">
              <Star className="w-4 h-4 fill-primary" />
              <Star className="w-4 h-4 fill-primary" />
              <Star className="w-4 h-4 fill-primary" />
              <Star className="w-4 h-4 fill-primary" />
              <span className="ml-2 text-foreground">4.9/5 (2.5k Ulasan)</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {itemsToDisplay.map((product, i) => {
              const isUpload = product.imageUrl !== undefined;

              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass rounded-3xl overflow-hidden group border border-white/5 hover:border-primary/30 transition-colors"
                >
                  {isUpload ? (
                    <div className="h-64 overflow-hidden bg-black/50">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  ) : (
                    <div className="h-64 bg-gradient-to-br from-white/5 to-white/0 flex items-center justify-center text-7xl group-hover:scale-110 transition-transform duration-500">
                      {product.image}
                    </div>
                  )}

                  <div className="p-6 bg-black/20">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg">{product.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">Estimasi Berat: <span className="font-mono text-primary/80">{product.weight}</span></p>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-6 pt-4 border-t border-white/10">
                      <span className="font-bold text-primary">Rp {typeof product.price === "number" ? product.price.toLocaleString("id-ID") : product.price}</span>
                      <button className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <ArrowRight className="w-5 h-5 -rotate-45 group-hover:rotate-0 transition-transform" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
