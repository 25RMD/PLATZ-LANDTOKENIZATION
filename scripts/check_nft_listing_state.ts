import { ethers } from 'ethers';
import PlatzLandNFTAbi from '../artifacts/contracts/PlatzLandNFTWithCollections.sol/PlatzLandNFTWithCollections.json';
import LandMarketplaceAbi from '../artifacts/contracts/LandMarketplace.sol/LandMarketplace.json';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const NFT_CONTRACT_ADDRESS = process.env.NFT_CONTRACT_ADDRESS || '';
const MARKETPLACE_CONTRACT_ADDRESS = process.env.MARKETPLACE_CONTRACT_ADDRESS || '';
const RPC_URL = process.env.SEPOLIA_RPC_URL || process.env.RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/-9NA8V25gEEn6DZokD_cuOxFRFVzf5qo';

if (!NFT_CONTRACT_ADDRESS || !MARKETPLACE_CONTRACT_ADDRESS) {
  console.error('Missing contract addresses in env');
  process.exit(1);
}

const tokenId = process.argv[2];
if (!tokenId) {
  console.error('Usage: ts-node scripts/check_nft_listing_state.ts <tokenId>');
  process.exit(1);
}

async function main() {
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const nft = new ethers.Contract(NFT_CONTRACT_ADDRESS, PlatzLandNFTAbi.abi, provider);
  const marketplace = new ethers.Contract(MARKETPLACE_CONTRACT_ADDRESS, LandMarketplaceAbi.abi, provider);

  console.log('--- NFT Contract State ---');
  try {
    const owner = await nft.ownerOf(tokenId);
    console.log('ownerOf:', owner);
  } catch (e) {
    console.error('ownerOf error:', e);
  }
  try {
    const approved = await nft.getApproved(tokenId);
    console.log('getApproved:', approved);
  } catch (e) {
    console.error('getApproved error:', e);
  }

  console.log('\n--- Marketplace Contract State ---');
  try {
    const listing = await marketplace.listings(NFT_CONTRACT_ADDRESS, tokenId);
    console.log('listings:', listing);
  } catch (e) {
    console.error('listings error:', e);
  }
  try {
    const getListing = await marketplace.getListing(NFT_CONTRACT_ADDRESS, tokenId);
    console.log('getListing:', getListing);
  } catch (e) {
    console.error('getListing error:', e);
  }
}

main().catch(console.error); 