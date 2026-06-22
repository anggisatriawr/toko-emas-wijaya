import { prisma } from "./prisma";

const API_KEY = "740a2b04-e8c4-40e8-b176-3491523ec5b2";

export async function getOrSyncDailyPrice() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let price = await prisma.dailyPrice.findUnique({ where: { date: today } });

  if (!price) {
    try {
      // Sync from Emas API ID
      const res = await fetch(
        `https://emas.maulanar.my.id/api/prices?brand[eq]=antam&weight[eq]=1&limit=1&sort_by=updated_at&order=desc`,
        {
          headers: {
            "X-API-Key": API_KEY,
          },
          cache: "no-store",
        }
      );
      const data = await res.json();

      if (data.status === "success" && data.data && data.data.length > 0) {
        const goldData = data.data[0];
        
        // Harga Jual dan Beli/Buyback langsung dari API
        const sell = goldData.sell_price;
        const buy = goldData.buyback_price;

        price = await prisma.dailyPrice.create({
          data: {
            date: today,
            sellPerGram: sell,
            buyPerGram: buy,
          },
        });
      } else {
        console.error("Failed to sync gold price from API: Invalid data format", data);
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
