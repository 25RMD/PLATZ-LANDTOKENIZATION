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
const uuid_1 = require("uuid");
// Initialize Prisma client
const prisma = new client_1.PrismaClient();
/**
 * Migrates existing NFT image references to the new format
 *
 * This script:
 * 1. Finds all land listings with nftImageFileRef
 * 2. For each listing, checks if the file exists in the public directory
 * 3. If it exists, copies it to the uploads directory with a unique name
 * 4. Updates the database record with the new file reference
 */
async function migrateNftImages() {
    try {
        console.log('Starting NFT image migration...');
        // Get all land listings with nftImageFileRef
        const landListings = await prisma.landListing.findMany({
            where: {
                nftImageFileRef: {
                    not: null
                }
            },
            select: {
                id: true,
                nftImageFileRef: true
            }
        });
        console.log(`Found ${landListings.length} land listings with NFT images to migrate`);
        // Create uploads directory if it doesn't exist
        const uploadsDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        // Process each land listing
        for (const listing of landListings) {
            if (!listing.nftImageFileRef)
                continue;
            console.log(`Processing listing ${listing.id} with image: ${listing.nftImageFileRef}`);
            // Check if the image is already in the new format (starts with a UUID)
            if (listing.nftImageFileRef.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/i)) {
                console.log(`Image ${listing.nftImageFileRef} is already in the new format, skipping`);
                continue;
            }
            // Check possible locations for the image
            const possiblePaths = [
                // Check in public directory
                path.join(process.cwd(), 'public', listing.nftImageFileRef),
                // Check in public/images directory
                path.join(process.cwd(), 'public', 'images', listing.nftImageFileRef),
                // Check if it's already in uploads
                path.join(process.cwd(), 'uploads', listing.nftImageFileRef),
                // Check if it's a relative path
                path.join(process.cwd(), listing.nftImageFileRef),
            ];
            let sourceFilePath = null;
            // Find the first path that exists
            for (const testPath of possiblePaths) {
                if (fs.existsSync(testPath)) {
                    sourceFilePath = testPath;
                    console.log(`Found image at: ${sourceFilePath}`);
                    break;
                }
            }
            if (!sourceFilePath) {
                console.log(`Could not find image file for ${listing.nftImageFileRef}, skipping`);
                continue;
            }
            // Generate a unique filename
            const uniqueFilename = `${(0, uuid_1.v4)()}-${path.basename(listing.nftImageFileRef)}`;
            const targetFilePath = path.join(uploadsDir, uniqueFilename);
            // Copy the file
            fs.copyFileSync(sourceFilePath, targetFilePath);
            console.log(`Copied to: ${targetFilePath}`);
            // Update the database record
            await prisma.landListing.update({
                where: { id: listing.id },
                data: { nftImageFileRef: uniqueFilename }
            });
            console.log(`Updated database record for listing ${listing.id}`);
        }
        console.log('NFT image migration completed successfully');
    }
    catch (error) {
        console.error('Error during NFT image migration:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
// Run the migration
migrateNftImages()
    .then(() => console.log('Migration script completed'))
    .catch((error) => console.error('Migration script failed:', error));
