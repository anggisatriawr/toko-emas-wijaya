import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10)
  const employeePassword = await bcrypt.hash('pegawai123', 10)

  // Seed Admin
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: adminPassword,
      name: 'Pemilik Toko',
      role: 'ADMIN',
    },
  })

  // Seed Employee
  const employee = await prisma.user.upsert({
    where: { username: 'pegawai1' },
    update: {},
    create: {
      username: 'pegawai1',
      password: employeePassword,
      name: 'Kasir Wijaya',
      role: 'EMPLOYEE',
    },
  })

  // Seed Initial Daily Price
  const today = new Date();
  today.setHours(0,0,0,0);
  
  await prisma.dailyPrice.upsert({
    where: { date: today },
    update: {},
    create: {
      date: today,
      sellPerGram: 1350000,
      buyPerGram: 1300000,
    }
  })

  // Seed Inventory
  await prisma.inventory.upsert({
    where: { code: 'GLG-001' },
    update: {},
    create: {
      code: 'GLG-001',
      type: 'Gelang',
      karat: '22K',
      weight: 10,
      ongkos: 100000,
      status: 'AVAILABLE'
    }
  })

  console.log({ admin, employee })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
