// scripts/create-admin.js
// Script to create an admin user

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

async function createAdminUser() {
  try {
    const username = 'admin';
    const password = 'admin';
    
    console.log('Hashing password...');
    const hashedPassword = await hashPassword(password);
    
    console.log('Creating admin user...');
    const user = await prisma.user.upsert({
      where: { username },
      update: {
        passwordHash: hashedPassword,
        isAdmin: true,
      },
      create: {
        username,
        passwordHash: hashedPassword,
        isAdmin: true,
        email: 'admin@example.com',
        authType: 'email',
      },
    });
    
    console.log(`Admin user created successfully: ${user.username} (ID: ${user.id})`);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the function
createAdminUser(); 