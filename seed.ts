import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('admin123', 10);
  const employeePassword = await bcrypt.hash('pegawai123', 10);

  await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      name: 'Super Admin',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { username: 'pegawai1' },
    update: {},
    create: {
      username: 'pegawai1',
      name: 'Pegawai Kasir 1',
      password: employeePassword,
      role: 'EMPLOYEE',
    },
  });

  console.log('Seed berhasil: Akun dibuat ✓');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
