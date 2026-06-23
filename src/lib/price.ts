import { prisma } from "./prisma";

const API_KEY = "goldapi-17be723eeecd6739334c40e302c9f23c-io";
const TROY_OUNCE_TO_GRAM = 31.1034768;

export async function getOrSyncDailyPrice() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let price = await prisma.dailyPrice.findUnique({ where: { date: today } });

  if (!price) {
    try {
      // Sync from GoldAPI
      const res = await fetch(
        `https://www.goldapi.io/api/XAU/IDR`,
        { 
          headers: {
            "x-access-token": API_KEY,
            "Content-Type": "application/json"
          },
          cache: "no-store" 
        }
      );
      const data = await res.json();

      if (data.price) {
        const pricePerOunce = data.price;
        const basePricePerGram = (pricePerOunce / TROY_OUNCE_TO_GRAM) + 50000; // Tambah paten 50rb

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
