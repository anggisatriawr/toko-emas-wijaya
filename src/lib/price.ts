import { prisma } from "./prisma";

const API_KEY = "58ce25a6a0b15caabdd8928418bed91e";
const TROY_OUNCE_TO_GRAM = 31.1034768;

export async function getOrSyncDailyPrice() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let price = await prisma.dailyPrice.findUnique({ where: { date: today } });

  if (!price) {
    try {
      // Sync from MetalpriceAPI
      const res = await fetch(
        `https://api.metalpriceapi.com/v1/latest?api_key=${API_KEY}&base=XAU&currencies=IDR`,
        { cache: "no-store" }
      );
      const data = await res.json();

      if (data.success && data.rates && data.rates.IDR) {
        const pricePerOunce = data.rates.IDR;
        const basePricePerGram = (pricePerOunce / TROY_OUNCE_TO_GRAM) + 95000; // Tambah paten 95rb

        // Spread/Margin
        // Harga Jual (Pelanggan beli): Base price + 3%
        // Harga Beli/Buyback (Toko beli dari pelanggan): Base price - 3%
        const sell = Math.round(basePricePerGram * 1.03);
        const buy = Math.round(basePricePerGram * 0.97);

        price = await prisma.dailyPrice.create({
          data: {
            date: today,
            sellPerGram: sell,
            buyPerGram: buy,
          },
        });
      }
    } catch (error) {
      console.error("Failed to sync gold price from API:", error);
    }
  }

  // If still no price (API failed or couldn't fetch), get latest available price
  if (!price) {
    price = await prisma.dailyPrice.findFirst({
      orderBy: { date: "desc" },
    });
  }

  return price;
}
