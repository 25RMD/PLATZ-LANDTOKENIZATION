// lib/types.ts

export interface CollectionDetail {
  collectionId: bigint;
  startTokenId: bigint;
  totalSupply: bigint;
  mainTokenId: bigint;
  baseURI: string;
  collectionURI: string; // This was effectively collectionMetaURI in the original function
  creator: string; // EVM Address of the creator
  creatorUsername?: string | null; // Username of the creator, if available
  isListed: boolean;
  price?: bigint;
  seller?: string;
  name: string;
  image: string;
  description: string;
}

// Other shared types can be added here in the future.
