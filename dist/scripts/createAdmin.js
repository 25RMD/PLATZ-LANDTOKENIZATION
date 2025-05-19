"use strict";
// scripts/createAdmin.ts
// Using CommonJS syntax
// Explicitly require needed modules
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
// Ensure prisma is declared only once
let prismaInstance; // Use 'any' type for prisma instance
try {
    prismaInstance = new PrismaClient();
}
catch (e) {
    console.error("Failed to initialize Prisma Client:", e);
    process.exit(1);
}
async function main(prisma) {
    const adminUsername = 'admin'; // Choose an admin username
    const adminPassword = 'admin'; // Choose a strong password
    // Check if admin already exists
    const existingAdmin = await prisma.user.findUnique({
        where: { username: adminUsername },
    });
    if (existingAdmin) {
        console.log(`Admin user '${adminUsername}' already exists.`);
        return;
    }
    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(adminPassword, saltRounds);
    // Create the admin user
    const adminUser = await prisma.user.create({
        data: {
            username: adminUsername,
            passwordHash: hashedPassword,
            isAdmin: true, // Set the admin flag
            kycVerified: true, // Admins are typically pre-verified
            // Add email or other fields if required
            // email: 'admin@example.com',
        },
    });
    console.log(`Admin user '${adminUser.username}' created successfully with ID: ${adminUser.id}`);
}
// Pass the instance to main
main(prismaInstance)
    .catch((e) => {
    console.error('Error creating admin user:', e);
    process.exit(1);
})
    .finally(async () => {
    if (prismaInstance) {
        await prismaInstance.$disconnect();
    }
});
