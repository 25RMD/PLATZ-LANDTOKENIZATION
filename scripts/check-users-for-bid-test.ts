import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 Checking users in database...\n');

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        evmAddress: true,
        email: true
      }
    });

    console.log(`Found ${users.length} users:\n`);

    users.forEach((user, index) => {
      console.log(`${index + 1}. User ID: ${user.id}`);
      console.log(`   Username: ${user.username || 'No username'}`);
      console.log(`   Email: ${user.email || 'No email'}`);
      console.log(`   EVM Address: ${user.evmAddress || 'No EVM address'}`);
      console.log('');
    });

    // If no user has EVM address, create a test user
    const userWithEvm = users.find(u => u.evmAddress);
    
    if (!userWithEvm) {
      console.log('❌ No users with EVM addresses found. Creating test user...\n');
      
      const testUser = await prisma.user.create({
        data: {
          username: 'testbidder',
          email: 'testbidder@example.com',
          evmAddress: '0x742d35Cc6634C0532925a3b8d27ba6A74B8E2e5C',
          password: 'testpassword123'
        }
      });
      
      console.log('✅ Created test user:');
      console.log(`   ID: ${testUser.id}`);
      console.log(`   Username: ${testUser.username}`);
      console.log(`   EVM Address: ${testUser.evmAddress}\n`);
    } else {
      console.log('✅ Found user with EVM address for testing:');
      console.log(`   Username: ${userWithEvm.username}`);
      console.log(`   EVM Address: ${userWithEvm.evmAddress}\n`);
    }

  } catch (error) {
    console.error('❌ Error checking users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers().catch(console.error); 