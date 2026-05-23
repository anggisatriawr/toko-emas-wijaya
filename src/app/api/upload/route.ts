import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    
    // Check if this is an API call just to delete
    const action = formData.get("action");
    if (action === "DELETE") {
       const id = formData.get("id") as string;
       await prisma.catalogItem.delete({ where: { id } });
       return NextResponse.json({ success: true, message: "Item deleted" });
    }

    const file = formData.get("file") as File;
    const name = formData.get("name") as string;
    const weight = formData.get("weight") as string;
    const priceStr = formData.get("price") as string;

    if (!file || !name || !weight || !priceStr) {
      return NextResponse.json({ error: "Kolom tidak lengkap" }, { status: 400 });
    }

    const price = parseFloat(priceStr);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Membuat nama unik menggunakan timestamp agar tidak bentrok
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const filename = `${Date.now()}-${originalName}`;
    const uploadDir = join(process.cwd(), "public/uploads");
    
    try {
      await mkdir(uploadDir, { recursive: true });
    } catch(e) {
      // ignore if exists
    }

    const path = join(uploadDir, filename);
    await writeFile(path, buffer);

    const imageUrl = `/uploads/${filename}`;

    const item = await prisma.catalogItem.create({
      data: {
        name,
        weight,
        price,
        imageUrl,
      }
    });

    return NextResponse.json({ success: true, item });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Gagal menyimpan foto koleksi" }, { status: 500 });
  }
}
