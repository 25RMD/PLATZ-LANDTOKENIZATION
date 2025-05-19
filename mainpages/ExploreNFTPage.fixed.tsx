// Function to fetch collection details from the contract
const fetchCollectionDetails = async (collectionId: bigint) => {
  console.log(`🔄 [fetchCollectionDetails] Fetching details for collection ${collectionId}`);
  try {
    const client = await createReliableClient();
    
    console.log(`🔄 [fetchCollectionDetails] Reading collection data from NFT contract`);
    const collectionData = await client.readContract({
      address: PLATZ_LAND_NFT_ADDRESS as `0x${string}`,
      abi: PlatzLandNFTABI,
      functionName: 'getCollection',
      args: [collectionId]
    });

    if (!collectionData) {
      console.log(`⚠️ [fetchCollectionDetails] No data found for collection ${collectionId}`);
      return null;
    }
    
    console.log(`✅ [fetchCollectionDetails] Collection data:`, collectionData);
    
    const [startTokenId, totalSupply, mainTokenId, baseURI, collectionURI, creator] = collectionData as [bigint, bigint, bigint, string, string, string];
    
    // Initialize marketplace data with default values
    let isListed = false;
    let price = undefined;
    let seller = undefined;

    try {
      console.log(`🔄 [fetchCollectionDetails] Checking marketplace listing`);
      const marketplaceData = await client.readContract({
        address: LAND_MARKETPLACE_ADDRESS as `0x${string}`,
        abi: LandMarketplaceABI,
        functionName: 'getCollectionListing',
        args: [collectionId]
      });
      
      console.log(`✅ [fetchCollectionDetails] Marketplace data:`, marketplaceData);
      
      // Only update marketplace data if the call was successful
      const [marketplaceSeller, marketplacePrice, , marketplaceIsActive] = marketplaceData as [string, bigint, string, boolean];
      isListed = marketplaceIsActive;
      price = marketplaceIsActive ? marketplacePrice : undefined;
      seller = marketplaceIsActive ? marketplaceSeller : undefined;
    } catch (marketplaceError) {
      console.log(`ℹ️ [fetchCollectionDetails] Collection ${collectionId} is not listed on marketplace:`, marketplaceError);
      // Continue with default values for marketplace data
    }
    
    return {
      collectionId,
      startTokenId,
      totalSupply,
      mainTokenId,
      baseURI,
      collectionURI,
      creator,
      isListed,
      price,
      seller
    };
  } catch (error) {
    console.error(`❌ [fetchCollectionDetails] Error fetching details for collection ${collectionId}:`, error);
    return null;
  }
}; 