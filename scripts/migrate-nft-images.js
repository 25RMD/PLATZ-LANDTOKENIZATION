"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var client_1 = require("@prisma/client");
var fs_1 = require("fs");
var path_1 = require("path");
var uuid_1 = require("uuid");
// Initialize Prisma client
var prisma = new client_1.PrismaClient();
/**
 * Migrates existing NFT image references to the new format
 *
 * This script:
 * 1. Finds all land listings with nftImageFileRef
 * 2. For each listing, checks if the file exists in the public directory
 * 3. If it exists, copies it to the uploads directory with a unique name
 * 4. Updates the database record with the new file reference
 */
function migrateNftImages() {
    return __awaiter(this, void 0, void 0, function () {
        var landListings, uploadsDir, _i, landListings_1, listing, possiblePaths, sourceFilePath, _a, possiblePaths_1, testPath, uniqueFilename, targetFilePath, error_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 6, 7, 9]);
                    console.log('Starting NFT image migration...');
                    return [4 /*yield*/, prisma.landListing.findMany({
                            where: {
                                nftImageFileRef: {
                                    not: null
                                }
                            },
                            select: {
                                id: true,
                                nftImageFileRef: true
                            }
                        })];
                case 1:
                    landListings = _b.sent();
                    console.log("Found ".concat(landListings.length, " land listings with NFT images to migrate"));
                    uploadsDir = path_1.default.join(process.cwd(), 'uploads');
                    if (!fs_1.default.existsSync(uploadsDir)) {
                        fs_1.default.mkdirSync(uploadsDir, { recursive: true });
                    }
                    _i = 0, landListings_1 = landListings;
                    _b.label = 2;
                case 2:
                    if (!(_i < landListings_1.length)) return [3 /*break*/, 5];
                    listing = landListings_1[_i];
                    if (!listing.nftImageFileRef)
                        return [3 /*break*/, 4];
                    console.log("Processing listing ".concat(listing.id, " with image: ").concat(listing.nftImageFileRef));
                    // Check if the image is already in the new format (starts with a UUID)
                    if (listing.nftImageFileRef.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-/i)) {
                        console.log("Image ".concat(listing.nftImageFileRef, " is already in the new format, skipping"));
                        return [3 /*break*/, 4];
                    }
                    possiblePaths = [
                        // Check in public directory
                        path_1.default.join(process.cwd(), 'public', listing.nftImageFileRef),
                        // Check in public/images directory
                        path_1.default.join(process.cwd(), 'public', 'images', listing.nftImageFileRef),
                        // Check if it's already in uploads
                        path_1.default.join(process.cwd(), 'uploads', listing.nftImageFileRef),
                        // Check if it's a relative path
                        path_1.default.join(process.cwd(), listing.nftImageFileRef),
                    ];
                    sourceFilePath = null;
                    // Find the first path that exists
                    for (_a = 0, possiblePaths_1 = possiblePaths; _a < possiblePaths_1.length; _a++) {
                        testPath = possiblePaths_1[_a];
                        if (fs_1.default.existsSync(testPath)) {
                            sourceFilePath = testPath;
                            console.log("Found image at: ".concat(sourceFilePath));
                            break;
                        }
                    }
                    if (!sourceFilePath) {
                        console.log("Could not find image file for ".concat(listing.nftImageFileRef, ", skipping"));
                        return [3 /*break*/, 4];
                    }
                    uniqueFilename = "".concat((0, uuid_1.v4)(), "-").concat(path_1.default.basename(listing.nftImageFileRef));
                    targetFilePath = path_1.default.join(uploadsDir, uniqueFilename);
                    // Copy the file
                    fs_1.default.copyFileSync(sourceFilePath, targetFilePath);
                    console.log("Copied to: ".concat(targetFilePath));
                    // Update the database record
                    return [4 /*yield*/, prisma.landListing.update({
                            where: { id: listing.id },
                            data: { nftImageFileRef: uniqueFilename }
                        })];
                case 3:
                    // Update the database record
                    _b.sent();
                    console.log("Updated database record for listing ".concat(listing.id));
                    _b.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    console.log('NFT image migration completed successfully');
                    return [3 /*break*/, 9];
                case 6:
                    error_1 = _b.sent();
                    console.error('Error during NFT image migration:', error_1);
                    return [3 /*break*/, 9];
                case 7: return [4 /*yield*/, prisma.$disconnect()];
                case 8:
                    _b.sent();
                    return [7 /*endfinally*/];
                case 9: return [2 /*return*/];
            }
        });
    });
}
// Run the migration
migrateNftImages()
    .then(function () { return console.log('Migration script completed'); })
    .catch(function (error) { return console.error('Migration script failed:', error); });
