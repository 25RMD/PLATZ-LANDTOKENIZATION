# Scripts Documentation

This directory contains maintenance and utility scripts for the PLATZ Land Tokenization platform.

## User Consolidation Script

### Purpose
The `consolidate-duplicate-users.ts` script identifies and merges duplicate user records that have the same Ethereum address but different casing (e.g., `0xABC...` vs `0xabc...`). This ensures data consistency and prevents ownership issues.

### Problem Solved
Due to case sensitivity differences in how Ethereum addresses were stored, some users had multiple records in the database:
- `0x3ec4bfe3167ba77A5906C034AABE5537BA7c4B07` (mixed case)
- `0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07` (lowercase)

This caused the `/api/collections/user-owned` endpoint to show incorrect collection counts.

### Usage

#### Safe Testing (Recommended First)
```bash
# Dry run - shows what would be done without making changes
npm run consolidate-users:dry-run
```

#### Production Execution
```bash
# Full consolidation with automatic backup
npm run consolidate-users

# Consolidation without backup (not recommended)
npm run consolidate-users:no-backup
```

### How It Works

1. **Identifies Duplicates**: Finds all users with the same EVM address (case-insensitive)

2. **Selects Primary User**: Uses smart prioritization:
   - ✅ Admin users first
   - ✅ KYC verified users
   - ✅ Users with complete profile data
   - ✅ Users with most activity (listings, bids, etc.)
   - ✅ Oldest user (earliest `createdAt`)

3. **Consolidates Data**: Updates all related records to point to primary user:
   - Land Listings
   - NFT Bids
   - Watchlist items (handles conflicts intelligently)
   - Offers (made and received)
   - Trades (bought, sold, created)
   - Properties
   - KYC Update Requests

4. **Merges Profile Data**: Combines user profile information, keeping the best available data

5. **Cleanup**: Deletes duplicate user records after successful consolidation

### Safety Features

- **Automatic Backup**: Creates timestamped backup before any changes
- **Dry Run Mode**: Test safely without making changes
- **Detailed Logging**: Shows exactly what will be done
- **Conflict Resolution**: Handles duplicate watchlist items gracefully
- **Transaction Safety**: Uses database transactions for data integrity
- **Rollback Support**: Backup files can be used for manual rollback if needed

### Output Example

```
🚀 Starting user consolidation process...
💾 Creating backup of user data...
✅ Backup created: /path/to/backups/backup-users-2025-05-27T00-10-11-112Z.json

📊 Found 1 groups of duplicate users:
1. Address: 0x3ec4bfe3167ba77a5906c034aabe5537ba7c4b07
   Primary: admin user (45 listings)
   Duplicate: test user (1 listing)

📋 Consolidating 2 users...
   ✅ Updated 1 land listings
   ✅ Updated 2 KYC requests
   ✅ Merged profile data
   🗑️  Deleted 1 duplicate user

✅ User consolidation completed successfully!
```

### Backup Location
Backups are stored in `/backups/backup-users-[timestamp].json`

### When to Run
- After identifying duplicate user issues
- During database maintenance
- Before major user-related updates
- When ownership data appears inconsistent

### Monitoring
The script provides detailed statistics about:
- Number of duplicate groups found
- Total users consolidated
- Records updated per table
- Users deleted

This information helps verify the consolidation was successful and complete.

### Related Files
- `app/api/collections/user-owned/route.ts` - Uses hybrid approach to handle both consolidated and unconsolidated data
- `package.json` - Contains the npm scripts for running consolidation 