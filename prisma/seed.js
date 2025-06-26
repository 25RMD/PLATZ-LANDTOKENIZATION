// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
// Import bcryptjs directly for password hashing
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

// Define hashPassword function locally within the seed script
const hashPassword = async (password) => {
  const saltRounds = 10; // Match the salt rounds used in your authUtils
  return await bcrypt.hash(password, saltRounds);
};

async function main() {
  console.log(`Start seeding ...`);

  const adminUsername = 'admin';
  // Using the password set by the user previously
  const adminPassword = 'admin'; // Make sure this matches the password you intended

  if (adminPassword === 'admin') { // Simplified check
    console.warn("\n⚠️ WARNING: Default or simple admin password ('" + adminPassword + "') is set.");
    console.warn("Please consider changing the 'adminPassword' variable in prisma/seed.js before seeding a production database.\n");
    // Optionally, throw an error to prevent seeding with default password in production:
    // if (process.env.NODE_ENV === 'production') {
    //   throw new Error("Cannot seed production database with default/simple admin password.");
    // }
  }

  // Use the locally defined hashPassword function
  const hashedPassword = await hashPassword(adminPassword);

  const adminUser = await prisma.users.upsert({
    where: { username: adminUsername }, // Unique identifier to find the user
    update: {                     // Fields to update if user exists (optional, but good practice)
        password_hash: hashedPassword,
        is_admin: true,
        updated_at: new Date(),
    },
    create: {                     // Fields to set if user is created
        username: adminUsername,
        password_hash: hashedPassword,
        is_admin: true,
        email: `${adminUsername}@example.com`, // Add a placeholder email or leave null if optional
        id: 'cl-admin-seed-user-000000000001',
        updated_at: new Date(),
    },
  });

  console.log(`Created/Updated admin user: ${adminUser.username} (ID: ${adminUser.id})`);

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error("Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
