"use strict";
// scripts/create-admin.ts
// Script to create an admin user
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const authUtils_1 = require("../lib/authUtils");
const prisma = new client_1.PrismaClient();
async function createAdminUser() {
    console.log('Starting admin user creation...');
    try {
        // Check if an admin user already exists
        const existingAdmin = await prisma.user.findFirst({
            where: {
                username: 'admin',
            },
        });
        if (existingAdmin) {
            console.log('Admin user already exists. Setting isAdmin flag to true...');
            // Ensure the existing admin user has the isAdmin flag set to true
            await prisma.user.update({
                where: { id: existingAdmin.id },
                data: { isAdmin: true },
            });
            console.log('Admin user updated successfully!');
            return;
        }
        // Create a new admin user
        const hashedPassword = await (0, authUtils_1.hashPassword)('admin123'); // Default password
        const newAdmin = await prisma.user.create({
            data: {
                username: 'admin',
                email: 'admin@example.com',
                passwordHash: hashedPassword,
                isAdmin: true,
                authType: 'email',
            },
        });
        console.log('Admin user created successfully!');
        console.log('Username: admin');
        console.log('Password: admin123');
        console.log('User ID:', newAdmin.id);
    }
    catch (error) {
        console.error('Error creating admin user:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
// Run the function
createAdminUser();
