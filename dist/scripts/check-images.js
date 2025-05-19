"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
// Initialize Prisma client
const prisma = new client_1.PrismaClient();
async function checkNftImageRefs() {
    try {
        console.log('Checking nftImageFileRef values in LandListing records...');
        // Query all land listings that have collectionId (NFT collections)
        const collections = await prisma.landListing.findMany({
            where: {
                collectionId: {
                    not: null
                }
            },
            select: {
                id: true,
                nftTitle: true,
                nftImageFileRef: true,
                collectionId: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        console.log(`Found ${collections.length} collection records.`);
        if (collections.length === 0) {
            console.log('No collections found with collectionId. Checking all listings with nftImageFileRef:');
            // Try a broader query for any records with nftImageFileRef
            const listings = await prisma.landListing.findMany({
                where: {
                    nftImageFileRef: {
                        not: null
                    }
                },
                select: {
                    id: true,
                    nftTitle: true,
                    nftImageFileRef: true,
                    collectionId: true,
                    createdAt: true
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
            console.log(`Found ${listings.length} listings with nftImageFileRef.`);
            if (listings.length > 0) {
                console.log('\nListing details:');
                listings.forEach((listing, index) => {
                    console.log(`\n[${index + 1}] Listing ID: ${listing.id}`);
                    console.log(`  Title: ${listing.nftTitle || '(no title)'}`);
                    console.log(`  nftImageFileRef: ${listing.nftImageFileRef || '(null)'}`);
                    console.log(`  collectionId: ${listing.collectionId ? listing.collectionId.toString() : '(null)'}`);
                    console.log(`  Created: ${listing.createdAt.toISOString()}`);
                });
            }
        }
        else {
            console.log('\nCollection details:');
            collections.forEach((collection, index) => {
                console.log(`\n[${index + 1}] Collection ID: ${collection.id}`);
                console.log(`  Title: ${collection.nftTitle || '(no title)'}`);
                console.log(`  nftImageFileRef: ${collection.nftImageFileRef || '(null)'}`);
                console.log(`  collectionId: ${collection.collectionId ? collection.collectionId.toString() : '(null)'}`);
                console.log(`  Created: ${collection.createdAt.toISOString()}`);
            });
        }
        // Check for placeholder values
        const placeholderCount = collections.filter(c => c.nftImageFileRef === 'placeholder-image-url').length;
        if (placeholderCount > 0) {
            console.log(`\nFound ${placeholderCount} records with 'placeholder-image-url' as nftImageFileRef.`);
        }
        // Check for records with null nftImageFileRef
        const nullCount = collections.filter(c => c.nftImageFileRef === null).length;
        console.log(`Found ${nullCount} records with null nftImageFileRef.`);
        // Check the uploads directory
        const uploadsDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            console.log('\nUploads directory does not exist!');
            return;
        }
        const files = fs.readdirSync(uploadsDir);
        console.log(`\nFound ${files.length} files in uploads directory:`);
        if (files.length > 0) {
            // Check if any collection references match actual files
            const matchingFiles = collections.filter(c => c.nftImageFileRef && files.includes(c.nftImageFileRef)).length;
            console.log(`${matchingFiles} collections reference files that exist in the uploads directory.`);
            // List the first 10 files (or all if less than 10)
            console.log('\nSample files in uploads directory:');
            files.slice(0, 10).forEach((file) => {
                console.log(`  ${file}`);
            });
            if (files.length > 10) {
                console.log(`  ... and ${files.length - 10} more files.`);
            }
        }
    }
    catch (error) {
        console.error('Error checking nftImageFileRef values:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
// Run the function
checkNftImageRefs().catch(e => {
    console.error(e);
    process.exit(1);
});
