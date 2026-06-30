import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

async function main() {
  const prisma = new PrismaClient();
  
  // Eliminar admin corrupto (email vacío)
  await prisma.user.deleteMany({ where: { email: '' } });
  await prisma.user.deleteMany({ where: { email: 'admin@habidex.com' } });
  
  const password = await bcrypt.hash('admin123', 10);
  await prisma.user.create({
    data: { name: 'Admin', email: 'admin@habidex.com', password, role: 'ADMIN', hotelId: '00000000-0000-0000-0000-000000000000' }
  });
  
  console.log('Admin created: admin@habidex.com / admin123');
  await prisma.\();
}
main();