// Script to check KYC table structure and contents directly using Prisma
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkKycTable() {
  try {
    console.log('Checking KYC update requests table...');
    
    // Count KYC requests
    const count = await prisma.kycUpdateRequest.count();
    console.log(`Total KYC requests: ${count}`);
    
    // Get all KYC requests with user info
    const requests = await prisma.kycUpdateRequest.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            isAdmin: true
          }
        }
      }
    });
    
    console.log('KYC requests found:');
    requests.forEach(req => {
      console.log(`- ID: ${req.id}`);
      console.log(`  Status: ${req.status}`);
      console.log(`  User: ${req.user?.username} (${req.user?.email})`);
      console.log(`  Submitted: ${req.createdAt}`);
      console.log(`  Changes: ${JSON.stringify(req.changes)}`);
      console.log('---');
    });
    
    // Check database structure
    const tableInfo = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'kyc_update_requests'`;
      
    console.log('\nTable structure:');
    console.log(tableInfo);
    
  } catch (error) {
    console.error('Error checking KYC table:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkKycTable(); 