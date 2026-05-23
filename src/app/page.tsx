import { prisma } from "@/lib/prisma";
import { LandingClient } from "./LandingClient";

export default async function LandingPage() {
  let featuredItems = [];
  try {
    featuredItems = await (prisma as any).catalogItem.findMany({
      take: 6,
      orderBy: { createdAt: "desc" }
    });
  } catch(e) {
    console.error("Warning: Could not fetch catalog items.", e);
  }

  let dailyPrice = null;
  try {
    const { getOrSyncDailyPrice } = await import('@/lib/price');
    dailyPrice = await getOrSyncDailyPrice();
  } catch (e) {
    console.error("Warning: Could not fetch daily price.", e);
  }

  return <LandingClient featuredItems={featuredItems} currentPrice={dailyPrice} />;
}
