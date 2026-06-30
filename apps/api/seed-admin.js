const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();
async function main() {
  // Clean existing admin users
  await prisma.user.deleteMany({ where: { email: '' } });
  await prisma.user.deleteMany({ where: { email: 'admin@habidex.com' } });
  
  // Create dummy hotel for admin
  const hotel = await prisma.hotel.create({
    data: { id: '00000000-0000-0000-0000-000000000000', name: 'Admin Hotel', email: 'admin@habidex.com' }
  });
  
  // Create admin user
  const hash = bcrypt.hashSync('admin123', 10);
  await prisma.user.create({
    data: { name: 'Admin', email: 'admin@habidex.com', password: hash, role: 'ADMIN', hotelId: hotel.id }
  });
  
  console.log('Admin created: admin@habidex.com / admin123');
  await prisma.$disconnect();
}
main();
