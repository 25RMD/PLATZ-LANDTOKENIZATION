import Link from 'next/link';

// Simple collection interface for API data
interface SimpleCollection {
  id: string;
  collectionId: string;
  mainTokenId: string;
  nftTitle: string | null;
  nftDescription: string | null;
  nftImageFileRef: string | null;
  nftCollectionSize: number;
  listingPrice: number;
  priceCurrency: string;
  user?: {
    evmAddress?: string;
  };
}

async function getCollections(): Promise<SimpleCollection[]> {
  try {
    const response = await fetch('http://localhost:3000/api/collections', {
      cache: 'no-store'
    });
    
    if (response.ok) {
      const data = await response.json();
      return data.collections || [];
    }
    return [];
  } catch (error) {
    console.error('Error fetching collections:', error);
    return [];
  }
}

export default async function ExploreSimplePage() {
  const collections = await getCollections();

  return (
    <div className="container mx-auto py-6 sm:py-8 px-3 sm:px-4 md:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row justify-between items-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-text-light dark:text-text-dark mb-4 md:mb-0 font-mono">
          EXPLORE LAND COLLECTIONS (SIMPLE)
        </h1>
      </div>

      {collections.length === 0 ? (
        <div className="text-center">
          <p className="text-2xl font-bold text-text-light dark:text-text-dark mb-3 font-mono">NO COLLECTIONS FOUND</p>
          <p className="text-text-light/60 dark:text-text-dark/60 mb-8 font-mono">It looks like there are no NFT collections available at the moment.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
          {collections.map((collection: SimpleCollection) => (
            <div key={collection.collectionId} className="w-full">
              <Link 
                href={`/explore/${collection.collectionId}`}
                className="group block relative bg-secondary-light dark:bg-secondary-dark rounded-cyber-lg overflow-hidden transition-all duration-500 border border-black/10 dark:border-white/10 hover:border-white dark:hover:border-white hover:shadow-2xl transform hover:-translate-y-2 hover:scale-[1.02]"
              >
                {/* Image Container */}
                <div className="relative h-64 w-full overflow-hidden bg-black/5 dark:bg-white/5">
                  <img
                    src={collection.nftImageFileRef || '/placeholder-nft-image.png'}
                    alt={collection.nftTitle || 'Collection Image'}
                    className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-110 group-hover:brightness-110"
                  />
                  
                  {/* Collection ID Badge */}
                  <div className="absolute top-4 left-4 z-20">
                    <div className="px-2 py-1 bg-black/60 dark:bg-white/60 backdrop-blur-sm text-white dark:text-black text-xs font-mono rounded border border-white/20 dark:border-black/20">
                      #{collection.collectionId}
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="relative p-6 space-y-4">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-text-light dark:text-text-dark font-mono tracking-tight truncate group-hover:text-white transition-colors duration-300">
                        {collection.nftTitle || `Collection #${collection.collectionId}`}
                      </h3>
                      <p className="text-sm text-text-light/60 dark:text-text-dark/60 font-mono truncate mt-1">
                        {collection.user?.evmAddress ? 
                          `${collection.user.evmAddress.substring(0, 6)}...${collection.user.evmAddress.substring(collection.user.evmAddress.length - 4)}` : 
                          'Unknown Creator'
                        }
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  {collection.nftDescription && (
                    <p className="text-sm text-text-light/70 dark:text-text-dark/70 line-clamp-2 leading-relaxed">
                      {collection.nftDescription}
                    </p>
                  )}

                  {/* Stats Section */}
                  <div className="flex justify-between items-center pt-4 border-t border-black/10 dark:border-white/10">
                    <div className="flex space-x-6">
                      <div>
                        <div className="text-xs text-text-light/60 dark:text-text-dark/60 font-mono uppercase tracking-wider">Items</div>
                        <div className="text-sm font-bold text-text-light dark:text-text-dark font-mono">
                          {collection.nftCollectionSize || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-text-light/60 dark:text-text-dark/60 font-mono uppercase tracking-wider">Price</div>
                        <div className="text-sm font-bold text-text-light dark:text-text-dark font-mono">
                          {collection.listingPrice ? `${collection.listingPrice} ${collection.priceCurrency}` : 'N/A'}
                        </div>
                      </div>
                    </div>
                    
                    {/* Hover Effect Indicator */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8 text-center">
        <p className="text-sm text-text-light/60 dark:text-text-dark/60 font-mono">
          Found {collections.length} collections
        </p>
      </div>
    </div>
  );
} 