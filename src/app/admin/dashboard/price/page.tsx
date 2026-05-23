import { prisma } from "@/lib/prisma";
import { PriceClient } from "./PriceClient";

export default async function PricePage() {
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const dailyPrice = await prisma.dailyPrice.findUnique({ where: { date: today } });

  const history = await prisma.dailyPrice.findMany({
    orderBy: { date: "desc" },
    take: 5
  });

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Penaturan Harga Emas Harian</h2>
      <PriceClient current={dailyPrice} history={history} />
    </div>
  );
}
