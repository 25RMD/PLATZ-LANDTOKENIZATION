const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Get the admin user
    const adminUser = await prisma.user.findFirst({
      where: {
        isAdmin: true
      }
    });

    if (!adminUser) {
      console.error('Admin user not found! Please run reset-admin.js first.');
      return;
    }

    console.log(`Found admin user: ${adminUser.username} (${adminUser.id})`);

    // Create a test KYC update request
    const kycRequest = await prisma.kycUpdateRequest.create({
      data: {
        userId: adminUser.id,
        status: 'PENDING',
        changes: {
          fullName: 'Test Admin Full Name',
          dateOfBirth: '1980-01-01',
          addressLine1: '123 Test Street',
          city: 'Test City',
          stateProvince: 'Test State',
          postalCode: '12345',
          country: 'Test Country',
          phone: '555-123-4567'
        },
        adminNotes: 'This is a test KYC request created for debugging purposes'
      }
    });

    console.log('Created test KYC update request:');
    console.log(JSON.stringify(kycRequest, null, 2));

    console.log('\nTest KYC request created successfully!');
  } catch (error) {
    console.error('Error creating test KYC request:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 