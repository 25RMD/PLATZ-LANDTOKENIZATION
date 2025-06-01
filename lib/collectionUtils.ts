// lib/collectionUtils.ts
import { PublicClient, Abi } from 'viem';

const PLACEHOLDER_IMAGE_URL = '/placeholder-nft-image.png'; // Corrected path
import { CollectionDetail } from './types'; // Import from our new types file

// It's good practice to pass ABI/addresses if they might change or for testing
// For now, I'll define them here, but ideally, they'd be passed or imported from a constants file
// For simplicity in this step, I'll re-declare minimal versions or placeholders
// You should replace these with your actual contract ABIs and addresses.

const PLATZ_LAND_NFT_ADDRESS_PLACEHOLDER = '0x...NFT_ADDRESS'; // Replace with actual address
const LAND_MARKETPLACE_ADDRESS_PLACEHOLDER = '0x...MARKETPLACE_ADDRESS'; // Replace with actual address
const PLACEHOLDER_IMAGE_URL_CONST = '/placeholder-image.png'; // Default placeholder

// You'll need to ensure your actual ABIs (PlatzLandNFTABI, LandMarketplaceABI) are accessible here.
// For this example, I'll assume they are imported or defined in this scope.
// e.g., import { PlatzLandNFTABI } from '../abis/PlatzLandNFTABI';
// import { LandMarketplaceABI } from '../abis/LandMarketplaceABI';
// For now, using 'any' to avoid breaking the example if ABIs aren't immediately available.
const PlatzLandNFTABI_Placeholder: any = []; 
const LandMarketplaceABI_Placeholder: any = [];


export async function fetchAndProcessCollectionDetails(
  collectionId: bigint,
  client: PublicClient,
  currentBaseUrl: string, // Pass this from the component context (window.location.origin or env var)
  platzLandNftAddress: `0x${string}`,
  landMarketplaceAddress: `0x${string}`,
  nftContractAbi: Abi,
  marketplaceAbi: Abi,
  placeholderImageUrl: string = PLACEHOLDER_IMAGE_URL // Corrected const name
): Promise<CollectionDetail | null> {
  let name, image = placeholderImageUrl, description;

  try {
    const collectionData = await client.readContract({
      address: platzLandNftAddress,
      abi: nftContractAbi,
      functionName: 'getCollection',
      args: [collectionId],
    });

    if (!collectionData) {
      console.warn(`⚠️ No data found for collection ${collectionId}`);
      return null;
    }
    
    const [startTokenId, totalSupply, mainTokenId, baseURI, collectionMetaURI, creator] = collectionData as [bigint, bigint, bigint, string, string, string];
    
    let isListed = false;
    let price: bigint | undefined = undefined;
    let seller: string | undefined = undefined;

    try {
      const marketplaceData = await client.readContract({
        address: landMarketplaceAddress,
        abi: marketplaceAbi,
        functionName: 'collectionListings', 
        args: [collectionId],
      });
      
      const [_mpSeller, /*_mpMainTokenId*/, mpPrice, /*_mpPaymentToken*/, mpIsActive] = marketplaceData as [string, bigint, bigint, string, boolean];
      isListed = mpIsActive;
      if (isListed) {
        price = mpPrice;
        seller = _mpSeller;
      }
    } catch (marketplaceError: any) {
      // Silently handle marketplace errors - most collections won't be listed
    }

    if (collectionMetaURI) {
        if (collectionMetaURI.startsWith('ipfs://')) {
            console.warn(`[UTIL C_ID:${collectionId}] Collection metadata URI is an IPFS link (${collectionMetaURI}), which is unsupported. Using placeholder data.`);
            name = 'Unsupported IPFS Metadata URI';
            description = `The metadata URI for this collection points to IPFS (${collectionMetaURI}), which is not fetched.`;
            image = placeholderImageUrl;
        } else {
            // Proceed with fetching and processing for non-IPFS metadata URIs
            try {
                let validCollectionMetaURI = collectionMetaURI;
                if (collectionMetaURI.startsWith('/uploads/')) { 
                    validCollectionMetaURI = `${currentBaseUrl}${collectionMetaURI}`;
                } else if (collectionMetaURI.includes('ngrok-free.app') || collectionMetaURI.includes('ngrok.io')) {
                    // Handle ngrok URLs - check if we need to update the domain
                    try {
                        const metaUrl = new URL(collectionMetaURI);
                        const baseUrl = new URL(currentBaseUrl);
                        
                        // If the domains are different, update the metadata URL to use current domain
                        if (metaUrl.host !== baseUrl.host) {
                            metaUrl.protocol = baseUrl.protocol;
                            metaUrl.host = baseUrl.host;
                            validCollectionMetaURI = metaUrl.toString();
                            console.log(`[UTIL C_ID:${collectionId}] Updated ngrok URL from ${collectionMetaURI} to ${validCollectionMetaURI}`);
                        }
                    } catch (e: any) {
                        console.error(`[UTIL C_ID:${collectionId}] Error trying to rewrite ngrok URL ${collectionMetaURI}:`, e.message);
                        // Keep original collectionMetaURI if rewrite fails
                    }
                }
                
                console.log(`[UTIL C_ID:${collectionId}] Fetching metadata from: ${validCollectionMetaURI}`);
                const metaResponse = await fetch(validCollectionMetaURI);

                if (metaResponse.ok) {
                    let meta;
                    let responseTextForLogging = '';
                    try {
                        const clonedResponse = metaResponse.clone(); 
                        responseTextForLogging = await clonedResponse.text();
                        meta = JSON.parse(responseTextForLogging);

                        name = meta.name || 'N/A';
                        description = meta.description || 'N/A';
                        let imageUrl = meta.image || placeholderImageUrl;
                        const originalImageUrlFromMetadata = meta.image;

                        if (!imageUrl || typeof imageUrl !== 'string') {
                          console.warn(`[UTIL C_ID:${collectionId}] Invalid or missing image URL in metadata, using placeholder: ${placeholderImageUrl}`);
                          imageUrl = placeholderImageUrl;
                        } else {
                          const isCurrentBaseNgrok = currentBaseUrl.includes('ngrok-free.app') || currentBaseUrl.includes('ngrok.io');
                          const isImageAbsoluteNgrok = imageUrl.startsWith('https://') && (imageUrl.includes('.ngrok-free.app') || imageUrl.includes('.ngrok.io'));

                          if (isImageAbsoluteNgrok) {
                            // Handle ngrok image URLs
                            try {
                              const imageUrlObject = new URL(imageUrl);
                              const baseUrlObject = new URL(currentBaseUrl);
                              
                              // If domains are different, update the image URL
                              if (imageUrlObject.host !== baseUrlObject.host) {
                                imageUrlObject.protocol = baseUrlObject.protocol;
                                imageUrlObject.host = baseUrlObject.host;
                                imageUrl = imageUrlObject.toString();
                                console.log(`[UTIL C_ID:${collectionId}] Updated image ngrok URL to: ${imageUrl}`);
                              }
                            } catch (e: any) {
                              console.error(`[UTIL C_ID:${collectionId}] Error parsing ngrok image URL: ${imageUrl}. Error: ${e.message}. Using placeholder.`);
                              imageUrl = placeholderImageUrl;
                            }
                          } else if (imageUrl.startsWith('/uploads/')) {
                            imageUrl = `${currentBaseUrl}${imageUrl}`;
                          } else if (imageUrl.startsWith('ipfs://')) {
                            console.warn(`[UTIL C_ID:${collectionId}] Image URL in metadata (${imageUrl}) is an IPFS link, which is unsupported. Using placeholder.`);
                            imageUrl = placeholderImageUrl;
                          }
                        }
                        image = imageUrl;

                    } catch (e: any) { // Catch for JSON.parse error
                        console.error(`[UTIL C_ID:${collectionId}] Error parsing JSON metadata from ${validCollectionMetaURI}:`, e.message, `Raw: ${responseTextForLogging.substring(0,200)}`);
                        name = 'Invalid Metadata';
                        description = `Failed to parse: ${e.message}`;
                        image = placeholderImageUrl;
                    }
                } else { // if !metaResponse.ok (fetch failed)
                    const responseText = await metaResponse.text();
                    console.warn(`[UTIL C_ID:${collectionId}] metaResponse NOT OK for ${validCollectionMetaURI}. Status: ${metaResponse.status}. Resp: ${responseText.substring(0,200)}`);
                    name = 'Metadata Fetch Failed';
                    description = `Failed to fetch metadata. Status: ${metaResponse.status}`;
                    image = placeholderImageUrl;
                }
            } catch (metaError: any) { // Catch for fetch or other errors in this 'else' block (processing non-IPFS collectionMetaURI)
                console.warn(`[UTIL C_ID:${collectionId}] Error processing non-IPFS metadata from ${collectionMetaURI}:`, metaError.message);
                name = 'Metadata Processing Error';
                description = `Failed to process metadata: ${metaError.message}`;
                image = placeholderImageUrl;
            }
        }
    } else { // if collectionMetaURI itself is null/empty from contract
        console.warn(`[UTIL C_ID:${collectionId}] No metadata URI provided from contract. Using placeholder data.`);
        name = 'Missing Metadata URI';
        description = 'The smart contract did not provide a metadata URI for this collection.';
        image = placeholderImageUrl;
    }
    return {
      collectionId, startTokenId, totalSupply, mainTokenId, baseURI,
      collectionURI: collectionMetaURI, creator, isListed, price, seller,
      // If name from metadata is 'N/A' or falsy, use a specific placeholder. Otherwise, use the name from metadata.
      name: (name && name !== 'N/A') ? name : `Unnamed Collection #${collectionId.toString()}`,
      image: image || placeholderImageUrl,
      // If description from metadata is 'N/A' or falsy, use a specific placeholder. Otherwise, use the description.
      description: (description && description !== 'N/A') ? description : 'No description provided in metadata.'
    };
  } catch (error: any) {
    console.error(`❌ [UTIL] Error fetching details for collection ${collectionId}:`, error.message);
    if (error?.message?.includes("Collection does not exist")) { 
        console.warn(`[UTIL] Collection ${collectionId} does not exist on chain.`);
    }
    return null;
  }
}
