// scripts/reset-admin.js
// Script to reset the admin password in the database

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Define hashPassword function with the same salt rounds as in authUtils.ts
const hashPassword = async (password) => {
  const saltRounds = 10; // Match the salt rounds used in authUtils.ts
  return await bcrypt.hash(password, saltRounds);
};

async function resetAdminPassword() {
  try {
    console.log(`Starting admin password reset...`);

    const adminUsername = 'admin';
    const adminPassword = 'admin'; // You can change this to any password you want

    console.log(`Hashing password for admin user...`);
    const hashedPassword = await hashPassword(adminPassword);

    console.log(`Looking for admin user: ${adminUsername}`);
    const adminUser = await prisma.user.findUnique({
      where: { username: adminUsername },
    });

    if (!adminUser) {
      console.log(`Admin user not found. Creating new admin user...`);
      const newAdmin = await prisma.user.create({
        data: {
          username: adminUsername,
          passwordHash: hashedPassword,
          isAdmin: true,
          email: `${adminUsername}@example.com`,
        },
      });
      console.log(`Created new admin user: ${newAdmin.username} (ID: ${newAdmin.id})`);
    } else {
      console.log(`Admin user found. Updating password...`);
      const updatedAdmin = await prisma.user.update({
        where: { id: adminUser.id },
        data: {
          passwordHash: hashedPassword,
          isAdmin: true, // Ensure admin flag is set
        },
      });
      console.log(`Updated admin user: ${updatedAdmin.username} (ID: ${updatedAdmin.id})`);
    }

    console.log(`Admin password reset complete.`);
    console.log(`You can now log in with username: ${adminUsername} and password: ${adminPassword}`);
  } catch (error) {
    console.error("Error during admin password reset:", error);
  } finally {
    await prisma.$disconnect();
  }
}

resetAdminPassword()
  .catch((e) => {
    console.error("Error during admin password reset:", e);
    process.exit(1);
  });
