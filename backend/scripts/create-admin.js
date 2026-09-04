const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const existing = await prisma.user.findUnique({
      where: { username: 'admin' }
    });

    if (existing) {
      console.log('❌ Admin user already exists');
      return;
    }

    const user = await prisma.user.create({
      data: {
        username: 'admin',
        email: 'admin@rmaxmahjong.com',
        password: hashedPassword,
        role: 'ADMIN',
        wallet: { create: { balance: 0 } }
      }
    });

    console.log('✅ Admin user created successfully!');
    console.log('Username:', user.username);
    console.log('Password: admin123');
    console.log('Email:', user.email);
    
  } catch (error) {
    console.error('❌ Failed to create admin:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();
