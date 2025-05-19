import { ethers } from 'ethers';
import { PLATZ_LAND_NFT_ADDRESS } from '@/config/contracts';

// ABI snippets for the functions we need
const collectionsContractAbi = [
  'function getCollectionCount() view returns (uint256)',
  'function getAllCollectionIds() view returns (uint256[])',
  'function getCollectionsPaginated(uint256 offset, uint256 limit) view returns (uint256[])',
  'function getCollection(uint256 collectionId) view returns (uint256 startTokenId, uint256 totalSupply, uint256 mainTokenId, string baseURI, string collectionURI, address creator)'
];

const oldContractAbi = [
  'event CollectionCreated(uint256 indexed collectionId, uint256 indexed mainTokenId, address indexed creator)',
  'function getPropertyDetails(uint256 tokenId) view returns (tuple(string propertyReference, address creator, uint256 mintTimestamp))'
];

// Type for collection data
export interface Collection {
  id: string;
  startTokenId: string;
  totalSupply: number;
  mainTokenId: string;
  baseURI: string;
  collectionURI: string;
  creator: string;
}

/**
 * Fetch collections using the new direct collection query methods if available
 * Falls back to event scanning for older contracts
 */
export async function fetchCollections(
  provider: ethers.JsonRpcProvider,
  options?: {
    page?: number;
    limit?: number;
    fromBlock?: number;
  }
): Promise<{
  collections: Collection[];
  totalCount: number;
  hasMore: boolean;
}> {
  const page = options?.page || 1;
  const limit = options?.limit || 10;
  const offset = (page - 1) * limit;
  
  try {
    // Try with collections contract first (with direct collection methods)
    const contract = new ethers.Contract(PLATZ_LAND_NFT_ADDRESS, collectionsContractAbi, provider);
    
    // Try to call the new methods
    try {
      // Get total collection count
      const totalCount = await contract.getCollectionCount();
      
      // Get paginated collection IDs
      const collectionIds = await contract.getCollectionsPaginated(offset, limit);
      
      if (collectionIds && collectionIds.length > 0) {
        // Fetch all collections in parallel
        const collectionPromises = collectionIds.map(id => 
          contract.getCollection(id).then(result => ({
            id: id.toString(),
            startTokenId: result[0].toString(),
            totalSupply: Number(result[1]),
            mainTokenId: result[2].toString(),
            baseURI: result[3],
            collectionURI: result[4],
            creator: result[5]
          }))
        );
        
        const collections = await Promise.all(collectionPromises);
        
        return {
          collections,
          totalCount: Number(totalCount),
          hasMore: offset + collections.length < Number(totalCount)
        };
      }
    } catch (err) {
      console.log('Collection methods not found, falling back to events', err);
      // Continue to fallback if methods don't exist
    }
    
    // Fallback to event scanning for older contracts
    const oldContract = new ethers.Contract(PLATZ_LAND_NFT_ADDRESS, oldContractAbi, provider);
    
    // Calculate block range
    const fromBlock = options?.fromBlock || 0;
    const toBlock = 'latest';
    
    // Get collection created events
    const events = await oldContract.queryFilter(
      oldContract.filters.CollectionCreated(),
      fromBlock,
      toBlock
    );
    
    // Sort by block number (newest first)
    events.sort((a, b) => b.blockNumber - a.blockNumber);
    
    // Paginate the events
    const paginatedEvents = events.slice(offset, offset + limit);
    
    // Convert events to collections
    const collections: Collection[] = paginatedEvents.map(event => {
      const { args } = event;
      return {
        id: args.collectionId.toString(),
        startTokenId: '0', // Not available from event
        totalSupply: 0, // Not available from event
        mainTokenId: args.mainTokenId.toString(),
        baseURI: '', // Not available from event
        collectionURI: '', // Not available from event
        creator: args.creator
      };
    });
    
    return {
      collections,
      totalCount: events.length,
      hasMore: offset + collections.length < events.length
    };
  } catch (error) {
    console.error('Error fetching collections:', error);
    throw error;
  }
} 