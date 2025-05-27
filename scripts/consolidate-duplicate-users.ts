import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface UserDuplicate {
  normalizedAddress: string;
  users: Array<{
    id: string;
    evmAddress: string;
    createdAt: Date;
    username: string | null;
    email: string | null;
    kycVerified: boolean;
    isAdmin: boolean;
    landListingsCount: number;
    nftBidsCount: number;
    watchlistCount: number;
  }>;
}

interface ConsolidationResult {
  duplicateGroups: number;
  usersConsolidated: number;
  recordsUpdated: {
    landListings: number;
    nftBids: number;
    watchlist: number;
    offers: number;
    trades: number;
    properties: number;
    kycUpdateRequests: number;
  };
  usersDeleted: number;
}

async function findDuplicateUsers(): Promise<UserDuplicate[]> {
  console.log('🔍 Finding duplicate users by EVM address...');
  
  // Get all users with EVM addresses
  const users = await prisma.user.findMany({
    where: {
      evmAddress: { not: null }
    },
    select: {
      id: true,
      evmAddress: true,
      createdAt: true,
      username: true,
      email: true,
      kycVerified: true,
      isAdmin: true,
      _count: {
        select: {
          landListings: true,
          nftBids: true,
          watchlist: true,
        }
      }
    },
    orderBy: {
      createdAt: 'asc' // Oldest first for primary selection
    }
  });

  // Group by normalized (lowercase) EVM address
  const addressGroups = new Map<string, typeof users>();
  
  users.forEach(user => {
    if (!user.evmAddress) return;
    
    const normalizedAddress = user.evmAddress.toLowerCase();
    if (!addressGroups.has(normalizedAddress)) {
      addressGroups.set(normalizedAddress, []);
    }
    addressGroups.get(normalizedAddress)!.push(user);
  });

  // Filter to only groups with duplicates
  const duplicates: UserDuplicate[] = [];
  addressGroups.forEach((userGroup, normalizedAddress) => {
    if (userGroup.length > 1) {
      duplicates.push({
        normalizedAddress,
        users: userGroup.map(user => ({
          id: user.id,
          evmAddress: user.evmAddress!,
          createdAt: user.createdAt,
          username: user.username,
          email: user.email,
          kycVerified: user.kycVerified,
          isAdmin: user.isAdmin,
          landListingsCount: user._count.landListings,
          nftBidsCount: user._count.nftBids,
          watchlistCount: user._count.watchlist,
        }))
      });
    }
  });

  return duplicates;
}

function selectPrimaryUser(users: UserDuplicate['users']) {
  // Selection criteria (in order of priority):
  // 1. Admin users first
  // 2. KYC verified users
  // 3. Users with email/username
  // 4. Users with most data (land listings, bids, etc.)
  // 5. Oldest user (earliest createdAt)
  
  return users.sort((a, b) => {
    // 1. Admin status
    if (a.isAdmin !== b.isAdmin) return a.isAdmin ? -1 : 1;
    
    // 2. KYC verification
    if (a.kycVerified !== b.kycVerified) return a.kycVerified ? -1 : 1;
    
    // 3. Has profile data (email or username)
    const aHasProfile = !!(a.email || a.username);
    const bHasProfile = !!(b.email || b.username);
    if (aHasProfile !== bHasProfile) return aHasProfile ? -1 : 1;
    
    // 4. Most data/activity
    const aDataScore = a.landListingsCount + a.nftBidsCount + a.watchlistCount;
    const bDataScore = b.landListingsCount + b.nftBidsCount + b.watchlistCount;
    if (aDataScore !== bDataScore) return bDataScore - aDataScore; // Higher score first
    
    // 5. Oldest user
    return a.createdAt.getTime() - b.createdAt.getTime();
  })[0];
}

async function consolidateUserGroup(duplicate: UserDuplicate): Promise<ConsolidationResult['recordsUpdated']> {
  const { users } = duplicate;
  const primaryUser = selectPrimaryUser(users);
  const duplicateUsers = users.filter(u => u.id !== primaryUser.id);
  
  console.log(`\n📋 Consolidating ${users.length} users for address ${duplicate.normalizedAddress}`);
  console.log(`   Primary: ${primaryUser.id} (${primaryUser.evmAddress}) - Created: ${primaryUser.createdAt.toISOString()}`);
  console.log(`   Duplicates: ${duplicateUsers.map(u => `${u.id} (${u.evmAddress})`).join(', ')}`);

  const duplicateUserIds = duplicateUsers.map(u => u.id);
  const result = {
    landListings: 0,
    nftBids: 0,
    watchlist: 0,
    offers: 0,
    trades: 0,
    properties: 0,
    kycUpdateRequests: 0,
  };

  // Update all related records to point to the primary user
  
  // 1. Land Listings
  const landListingsUpdate = await prisma.landListing.updateMany({
    where: { userId: { in: duplicateUserIds } },
    data: { userId: primaryUser.id }
  });
  result.landListings = landListingsUpdate.count;
  console.log(`   ✅ Updated ${result.landListings} land listings`);

  // 2. NFT Bids
  const nftBidsUpdate = await prisma.nftBid.updateMany({
    where: { bidderUserId: { in: duplicateUserIds } },
    data: { bidderUserId: primaryUser.id }
  });
  result.nftBids = nftBidsUpdate.count;
  console.log(`   ✅ Updated ${result.nftBids} NFT bids`);

  // 3. Watchlist (need to handle potential duplicates after merge)
  const existingWatchlist = await prisma.watchlist.findMany({
    where: { userId: primaryUser.id },
    select: { collectionId: true }
  });
  const existingCollectionIds = new Set(existingWatchlist.map(w => w.collectionId));

  const duplicateWatchlist = await prisma.watchlist.findMany({
    where: { userId: { in: duplicateUserIds } }
  });

  // Update non-conflicting watchlist items
  const nonConflictingWatchlist = duplicateWatchlist.filter(
    w => !existingCollectionIds.has(w.collectionId)
  );
  
  if (nonConflictingWatchlist.length > 0) {
    const watchlistUpdate = await prisma.watchlist.updateMany({
      where: { 
        id: { in: nonConflictingWatchlist.map(w => w.id) }
      },
      data: { userId: primaryUser.id }
    });
    result.watchlist += watchlistUpdate.count;
  }

  // Delete conflicting watchlist items
  const conflictingWatchlist = duplicateWatchlist.filter(
    w => existingCollectionIds.has(w.collectionId)
  );
  if (conflictingWatchlist.length > 0) {
    await prisma.watchlist.deleteMany({
      where: { id: { in: conflictingWatchlist.map(w => w.id) } }
    });
    console.log(`   🗑️  Removed ${conflictingWatchlist.length} duplicate watchlist items`);
  }

  console.log(`   ✅ Updated ${result.watchlist} watchlist items`);

  // 4. Offers (both made and received)
  const offersMadeUpdate = await prisma.offer.updateMany({
    where: { offererId: { in: duplicateUserIds } },
    data: { offererId: primaryUser.id }
  });

  const offersReceivedUpdate = await prisma.offer.updateMany({
    where: { userId: { in: duplicateUserIds } },
    data: { userId: primaryUser.id }
  });

  result.offers = offersMadeUpdate.count + offersReceivedUpdate.count;
  console.log(`   ✅ Updated ${result.offers} offers`);

  // 5. Trades (bought, sold, created)
  const tradesBoughtUpdate = await prisma.trade.updateMany({
    where: { buyerId: { in: duplicateUserIds } },
    data: { buyerId: primaryUser.id }
  });

  const tradesSoldUpdate = await prisma.trade.updateMany({
    where: { sellerId: { in: duplicateUserIds } },
    data: { sellerId: primaryUser.id }
  });

  const tradesCreatedUpdate = await prisma.trade.updateMany({
    where: { creatorId: { in: duplicateUserIds } },
    data: { creatorId: primaryUser.id }
  });

  result.trades = tradesBoughtUpdate.count + tradesSoldUpdate.count + tradesCreatedUpdate.count;
  console.log(`   ✅ Updated ${result.trades} trades`);

  // 6. Properties
  const propertiesUpdate = await prisma.property.updateMany({
    where: { userId: { in: duplicateUserIds } },
    data: { userId: primaryUser.id }
  });
  result.properties = propertiesUpdate.count;
  console.log(`   ✅ Updated ${result.properties} properties`);

  // 7. KYC Update Requests
  const kycUpdate = await prisma.kycUpdateRequest.updateMany({
    where: { userId: { in: duplicateUserIds } },
    data: { userId: primaryUser.id }
  });
  result.kycUpdateRequests = kycUpdate.count;
  console.log(`   ✅ Updated ${result.kycUpdateRequests} KYC requests`);

  return result;
}

async function mergeDuplicateUserData(duplicate: UserDuplicate): Promise<void> {
  const { users } = duplicate;
  const primaryUser = selectPrimaryUser(users);
  const duplicateUsers = users.filter(u => u.id !== primaryUser.id);

  // Merge user profile data (keep the best available data)
  const mergedData: any = {};
  let hasUpdates = false;

  // Get current primary user data
  const currentPrimary = await prisma.user.findUnique({
    where: { id: primaryUser.id }
  });

  if (!currentPrimary) return;

  // Merge data from duplicates if primary is missing information
  for (const duplicate of duplicateUsers) {
    const duplicateData = await prisma.user.findUnique({
      where: { id: duplicate.id }
    });

    if (!duplicateData) continue;

    // Only merge fields that are missing in primary
    if (!currentPrimary.username && duplicateData.username) {
      mergedData.username = duplicateData.username;
      hasUpdates = true;
    }
    if (!currentPrimary.email && duplicateData.email) {
      mergedData.email = duplicateData.email;
      hasUpdates = true;
    }
    if (!currentPrimary.fullName && duplicateData.fullName) {
      mergedData.fullName = duplicateData.fullName;
      hasUpdates = true;
    }
    if (!currentPrimary.phone && duplicateData.phone) {
      mergedData.phone = duplicateData.phone;
      hasUpdates = true;
    }
    // Add other fields as needed...
  }

  // Update primary user with merged data
  if (hasUpdates) {
    await prisma.user.update({
      where: { id: primaryUser.id },
      data: mergedData
    });
    console.log(`   ✅ Merged profile data into primary user`);
  }
}

async function deleteConsolidatedUsers(duplicate: UserDuplicate): Promise<number> {
  const { users } = duplicate;
  const primaryUser = selectPrimaryUser(users);
  const duplicateUsers = users.filter(u => u.id !== primaryUser.id);

  if (duplicateUsers.length === 0) return 0;

  // Delete duplicate user records
  const deletedUsers = await prisma.user.deleteMany({
    where: { id: { in: duplicateUsers.map(u => u.id) } }
  });

  console.log(`   🗑️  Deleted ${deletedUsers.count} duplicate user records`);
  return deletedUsers.count;
}

async function createBackup(): Promise<void> {
  console.log('💾 Creating backup of user data...');
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFile = `backup-users-${timestamp}.json`;
  
  const allUsers = await prisma.user.findMany({
    include: {
      _count: {
        select: {
          landListings: true,
          nftBids: true,
          watchlist: true,
          offersMade: true,
          offersReceived: true,
          tradesBought: true,
          tradesSold: true,
          tradesCreated: true,
          properties: true,
          kycUpdateRequests: true,
        }
      }
    }
  });

  const fs = require('fs');
  const path = require('path');
  
  const backupDir = path.join(process.cwd(), 'backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const backupPath = path.join(backupDir, backupFile);
  fs.writeFileSync(backupPath, JSON.stringify(allUsers, null, 2));
  
  console.log(`✅ Backup created: ${backupPath}`);
}

async function consolidateDuplicateUsers(options: { 
  dryRun?: boolean; 
  createBackup?: boolean 
} = {}): Promise<ConsolidationResult> {
  const { dryRun = false, createBackup: shouldBackup = true } = options;

  console.log('🚀 Starting user consolidation process...');
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE'}`);

  if (!dryRun && shouldBackup) {
    await createBackup();
  }

  const duplicates = await findDuplicateUsers();
  
  if (duplicates.length === 0) {
    console.log('✅ No duplicate users found!');
    return {
      duplicateGroups: 0,
      usersConsolidated: 0,
      recordsUpdated: {
        landListings: 0,
        nftBids: 0,
        watchlist: 0,
        offers: 0,
        trades: 0,
        properties: 0,
        kycUpdateRequests: 0,
      },
      usersDeleted: 0,
    };
  }

  console.log(`\n📊 Found ${duplicates.length} groups of duplicate users:`);
  duplicates.forEach((duplicate, index) => {
    console.log(`\n${index + 1}. Address: ${duplicate.normalizedAddress}`);
    duplicate.users.forEach((user, userIndex) => {
      console.log(`   ${userIndex + 1}. ${user.id} (${user.evmAddress}) - Created: ${user.createdAt.toISOString()}`);
      console.log(`      Admin: ${user.isAdmin}, KYC: ${user.kycVerified}, Username: ${user.username || 'none'}`);
      console.log(`      Data: ${user.landListingsCount} listings, ${user.nftBidsCount} bids, ${user.watchlistCount} watchlist`);
    });
  });

  if (dryRun) {
    console.log('\n🏃‍♂️ DRY RUN - No changes will be made');
    return {
      duplicateGroups: duplicates.length,
      usersConsolidated: duplicates.reduce((sum, d) => sum + d.users.length, 0),
      recordsUpdated: {
        landListings: 0,
        nftBids: 0,
        watchlist: 0,
        offers: 0,
        trades: 0,
        properties: 0,
        kycUpdateRequests: 0,
      },
      usersDeleted: 0,
    };
  }

  const result: ConsolidationResult = {
    duplicateGroups: duplicates.length,
    usersConsolidated: 0,
    recordsUpdated: {
      landListings: 0,
      nftBids: 0,
      watchlist: 0,
      offers: 0,
      trades: 0,
      properties: 0,
      kycUpdateRequests: 0,
    },
    usersDeleted: 0,
  };

  console.log('\n🔄 Starting consolidation...');

  for (const duplicate of duplicates) {
    try {
      // Consolidate all related records
      const recordsUpdated = await consolidateUserGroup(duplicate);
      
      // Merge user profile data
      await mergeDuplicateUserData(duplicate);
      
      // Delete duplicate users
      const deletedCount = await deleteConsolidatedUsers(duplicate);

      // Update totals
      result.usersConsolidated += duplicate.users.length;
      result.usersDeleted += deletedCount;
      
      Object.keys(recordsUpdated).forEach(key => {
        result.recordsUpdated[key as keyof typeof recordsUpdated] += recordsUpdated[key as keyof typeof recordsUpdated];
      });

    } catch (error) {
      console.error(`❌ Error consolidating group ${duplicate.normalizedAddress}:`, error);
      throw error;
    }
  }

  return result;
}

// Main execution
async function main() {
  try {
    // Parse command line arguments
    const args = process.argv.slice(2);
    const dryRun = args.includes('--dry-run');
    const skipBackup = args.includes('--skip-backup');

    const result = await consolidateDuplicateUsers({ 
      dryRun, 
      createBackup: !skipBackup 
    });

    console.log('\n📈 Consolidation Summary:');
    console.log(`   Duplicate Groups: ${result.duplicateGroups}`);
    console.log(`   Users Consolidated: ${result.usersConsolidated}`);
    console.log(`   Users Deleted: ${result.usersDeleted}`);
    console.log(`   Records Updated:`);
    console.log(`     - Land Listings: ${result.recordsUpdated.landListings}`);
    console.log(`     - NFT Bids: ${result.recordsUpdated.nftBids}`);
    console.log(`     - Watchlist: ${result.recordsUpdated.watchlist}`);
    console.log(`     - Offers: ${result.recordsUpdated.offers}`);
    console.log(`     - Trades: ${result.recordsUpdated.trades}`);
    console.log(`     - Properties: ${result.recordsUpdated.properties}`);
    console.log(`     - KYC Requests: ${result.recordsUpdated.kycUpdateRequests}`);

    if (dryRun) {
      console.log('\n💡 This was a dry run. Run without --dry-run to execute changes.');
    } else {
      console.log('\n✅ User consolidation completed successfully!');
    }

  } catch (error) {
    console.error('❌ Fatal error during consolidation:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

export { consolidateDuplicateUsers, findDuplicateUsers }; 