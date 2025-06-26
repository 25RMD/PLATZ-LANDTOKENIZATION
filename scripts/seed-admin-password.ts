// scripts/seed-admin-password.ts

import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/authUtils';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting admin password seeding script...');

  const adminUsername = 'admin';
  const newPassword = 'admin'; // Use the password requested by the user

  const user = await prisma.users.findUnique({
    where: { username: adminUsername },
  });

  if (!user) {
    console.error(`Error: User '${adminUsername}' not found.`);
    return;
  }

  console.log(`Found user: ${user.username}.`);

  const hashedPassword = await hashPassword(newPassword);
  console.log('Generated new hashed password.');

  await prisma.users.update({
    where: { username: adminUsername },
    data: { password_hash: hashedPassword },
  });

  console.log(`\n✅ Successfully updated password for user '${adminUsername}'.`);
  console.log(`\n🔑 Password has been set to the temporary password defined in the script.`);
  console.log("\n🔒 IMPORTANT: Please save this password in a secure location and delete this script after use.\n");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
