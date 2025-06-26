// lib/types.ts

export interface CollectionDetail {
  id: string; // The unique UUID from the database
  collectionId: bigint;
  startTokenId: bigint;
  totalSupply: bigint;
  mainTokenId: bigint;
  baseURI: string;
  collectionURI: string; // This was effectively collectionMetaURI in the original function
  creator: string;
  isListed: boolean;
  price?: bigint;
  listingPrice?: number;
  seller?: string;
  name: string;
  image: string;
  description: string;
}

// Other shared types can be added here in the future.
