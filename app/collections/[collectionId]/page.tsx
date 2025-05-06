"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiAlertCircle, FiArrowLeft, FiStar, FiInfo, FiCopy, FiX, FiMoreHorizontal, FiCheckCircle } from 'react-icons/fi';
import Link from 'next/link';

import { NFT, User as PrismaUser } from '@prisma/client'; 
import NFTCardSimple from '@/components/NFTCardSimple';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import NFTCardSimpleSkeleton from '@/components/skeletons/NFTCardSimpleSkeleton';

interface LandListingWithDetails {
  id: string;
  createdAt: string; 
  updatedAt: string;
  titleDeedId: string;
  propertyAddress: string;
  propertyType: string;
  ownerId: string;
  кадастральныйНомер: string | null;
  разрешенноеИспользование: string | null;
  площадьУчастка: number | null; 
  описаниеМестоположения: string | null;
  документыОснования: string[];
  координаты: string | null;
  статусЗаписиЕГРН: string | null;
  формаСобственности: string | null;
  ограниченияОбременения: string | null;
  дополнительнаяИнформация: string | null;
  chainOfTitleId: string | null;
  propertyPhotosFileRef: string[] | null;
  valuationReportFileRef: string | null;
  otherDocumentsFileRef: string[] | null;
  nftTitle: string | null;
  nftDescription: string | null;
  listingPrice: number | null; 
  priceCurrency: string | null;
  nftImageFileRef: string | null;
  nftCollectionSize: number | null;
  blockchainRef: string | null;
  
  individualNfts: NFT[];
  user: PrismaUser | null; 
  ownerCount: number;
  listedCount: number;
  topOffer: number | null;
  volume24h: number;
  sales24h: number;
  name: string; 
  description: string | null; 
  image: string | null; 
  creator: string; 
  floorPrice: number | null;
  items: number; 
  verified: boolean; 
  chain?: string | null; 
}

const SingleCollectionPage = () => {
    const params = useParams();
    const collectionId = params?.collectionId as string;

    const [collectionData, setCollectionData] = useState<LandListingWithDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showFullDescription, setShowFullDescription] = useState(false); // For 'About' section

    useEffect(() => {
        if (!collectionId) {
            setError("Collection ID not found in URL.");
            setIsLoading(false);
            return;
        }

        const fetchCollection = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/collections/${collectionId}`);
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: 'Failed to parse error response' }));
                    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
                }
                const data: LandListingWithDetails = await response.json();
                setCollectionData(data);
            } catch (err: any) {
                console.error("Failed to fetch collection:", err);
                setError(err.message || "Failed to load collection data.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchCollection();
    }, [collectionId]);

    // Helper to format numbers (e.g., item count, owner count)
    const formatStat = (value: number | null | undefined, precision = 0): string => {
        if (value === null || value === undefined) return 'N/A';
        return value.toLocaleString(undefined, { minimumFractionDigits: precision, maximumFractionDigits: precision });
    };

    // Helper for currency
    const formatCurrency = (value: number | null | undefined, currencySymbol?: string | null): string => {
        if (value === null || value === undefined) return 'N/A';
        const symbol = currencySymbol || ''; // Use provided currency symbol or empty string
        return `${symbol}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    // Helper for date formatting (e.g., Created Sep 2023)
    const formatDate = (dateString: string | undefined): string => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        } catch (e) {
            // Handle cases where dateString might not be a valid date
            console.warn('Invalid date string for formatDate:', dateString);
            return 'N/A';
        }
    };
    
    // Helper to construct image URLs safely
    const getImageUrl = (imageRef: string | null | undefined): string => {
        if (!imageRef) return '/placeholder-banner.png'; // Default placeholder
        // Basic check if it's already a full URL
        if (imageRef.startsWith('http://') || imageRef.startsWith('https://') || imageRef.startsWith('/')) {
            return imageRef;
        }
        // If it's just a filename, assume it's in public folder (adjust if needed for S3/other storage)
        return `/${imageRef}`;
    };

    if (isLoading) {
        return (
            <div className="animate-pulse">
                {/* Skeleton Header */}
                 <div className="bg-gray-300 dark:bg-zinc-700 relative w-full">
                    {/* Banner Skeleton */}
                    <div className="pointer-events-none relative aspect-4/3 md:aspect-16/9 lg:aspect-[7/2] xl:h-[min(550px,_100vh_-_270px)] xl:min-w-full bg-gray-400 dark:bg-zinc-600"></div>
                    {/* Content Skeleton */}
                    <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-[1] mx-auto min-h-0 min-w-0 max-w-7xl px-4 pb-4 lg:px-6 xl:pb-5">
                        <div className="flex w-full min-w-0 flex-col lg:grid lg:grid-cols-[1fr_auto] lg:items-end lg:justify-between xl:gap-4">
                            {/* Left Side Skeleton */}
                            <div className="flex w-full items-end gap-3 p-0 min-w-0 select-text">
                                {/* Logo Skeleton */}
                                <div className="relative mb-0 mr-0 mt-[-10%] w-[clamp(64px,12vw,128px)] shrink-0 grow-0 select-none overflow-hidden rounded-xl border-4 border-white dark:border-black aspect-square bg-gray-500 dark:bg-zinc-600"></div>
                                {/* Info Column Skeleton */}
                                <div className="flex flex-col w-full min-w-0">
                                    {/* Row 1: Title & Verified Badge */}
                                    <div className="flex items-center min-w-0 mb-2">
                                        <div className="h-8 bg-gray-400 dark:bg-zinc-500 rounded w-3/4"></div>
                                        <div className="w-6 h-6 bg-gray-400 dark:bg-zinc-500 rounded-full ml-2"></div>
                                    </div>
                                    {/* Row 2: Meta Tags Skeleton - Reduced one item as 'category' is removed */}
                                    <div className="flex w-full gap-2 flex-wrap md:flex-nowrap">
                                        <div className="h-5 bg-gray-300 dark:bg-zinc-600 rounded w-24"></div>
                                        <div className="h-5 bg-gray-300 dark:bg-zinc-600 rounded w-16"></div>
                                        <div className="h-5 bg-gray-300 dark:bg-zinc-600 rounded w-20"></div>
                                        {/* <div className="h-5 bg-gray-300 dark:bg-zinc-600 rounded w-20"></div> Category removed */}
                                    </div>
                                </div>
                            </div>
                            {/* Right Side Skeleton: Stats & Actions */}
                            <div className="flex min-w-0 flex-col items-end gap-4 pt-4 lg:pt-0">
                                {/* Action Buttons Skeleton */}
                                <div className="flex h-8 items-center justify-end gap-3">
                                    <div className="w-8 h-8 bg-gray-300 dark:bg-zinc-600 rounded-lg"></div>
                                    <div className="w-8 h-8 bg-gray-300 dark:bg-zinc-600 rounded-lg"></div>
                                    <div className="w-8 h-8 bg-gray-300 dark:bg-zinc-600 rounded-lg"></div>
                                </div>
                                {/* Stats Bar Skeleton */}
                                <div className="flex items-center overflow-hidden md:gap-8 w-full justify-between flex-wrap">
                                    {[...Array(5)].map((_, i) => (
                                        <div key={i} className="flex flex-col items-start gap-1 whitespace-nowrap select-text py-2">
                                            <div className="h-4 bg-gray-300 dark:bg-zinc-600 rounded w-16 mb-1"></div>
                                            <div className="h-5 bg-gray-400 dark:bg-zinc-500 rounded w-20"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Skeleton Body */}
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                    <div className="mb-8">
                        <div className="h-6 bg-gray-300 dark:bg-zinc-600 rounded w-1/4 mb-2"></div>
                        <div className="h-4 bg-gray-300 dark:bg-zinc-700 rounded w-full mb-1"></div>
                        <div className="h-4 bg-gray-300 dark:bg-zinc-700 rounded w-3/4"></div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                        {[...Array(10)].map((_, i) => (
                           <NFTCardSimpleSkeleton key={i} />
                        ))}
                    </div>
                </main>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
                <FiAlertCircle className="w-16 h-16 text-red-500 mb-4" />
                <h1 className="text-2xl font-semibold mb-2">Error loading collection</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
                <Link href="/collections" legacyBehavior>
                    <a className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <FiArrowLeft className="mr-2 -ml-1 h-5 w-5" />
                        Back to Collections
                    </a>
                </Link>
            </div>
        );
    }

    if (!collectionData) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
                <FiAlertCircle className="w-16 h-16 text-yellow-500 mb-4" />
                <h1 className="text-2xl font-semibold">Collection not found</h1>
                <p className="text-gray-600 dark:text-gray-400 mb-4">The requested collection could not be found or loaded.</p>
                <Link href="/collections" legacyBehavior>
                    <a className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
                        <FiArrowLeft className="mr-2 -ml-1 h-5 w-5" />
                        Back to Collections
                    </a>
                </Link>
            </div>
        );
    }

    const { individualNfts: nfts } = collectionData; // Alias for convenience in NFT grid
    const listedPercentage = collectionData.items > 0 ? (collectionData.listedCount / collectionData.items) * 100 : 0;

    return (
        <div className="overflow-x-hidden">
            {/* Header Section */}
            <header className="bg-gray-50 dark:bg-zinc-900/80 relative w-full">
                {/* Banner Image Container with Gradient */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-900/80 dark:to-black/90 z-[2]"></div>
                    {collectionData.image && (
                        <img
                            src={getImageUrl(collectionData.image)} // Mapped from nftImageFileRef
                            alt={`${collectionData.name || 'Collection'} banner`}
                            decoding="async"
                            className="h-full w-full object-cover object-center"
                            style={{ position: 'absolute', height: '100%', width: '100%', inset: '0px', color: 'transparent' }}
                        />
                    )}
                    {!collectionData.image && (
                        <div className="absolute inset-0 bg-gray-300 dark:bg-zinc-700 z-[1]"></div> // Fallback placeholder
                    )}
                </div>

                <div className="pointer-events-none relative aspect-4/3 md:aspect-16/9 lg:aspect-[7/2] xl:h-[min(550px,_100vh_-_270px)] xl:min-w-full"></div>

                <div className="pointer-events-auto absolute inset-x-0 bottom-0 z-[1] mx-auto min-h-0 min-w-0 max-w-7xl px-4 pb-4 lg:px-6 xl:pb-5">
                    <div className="flex w-full min-w-0 flex-col lg:grid lg:grid-cols-[1fr_auto] lg:items-end lg:justify-between xl:gap-4">
                        {/* Left Side: Logo, Title, Creator, Meta Tags */}
                        <div className="flex w-full items-end gap-3 p-0 min-w-0 select-text">
                            <div className="relative mb-0 mr-0 mt-[-10%] w-[clamp(64px,12vw,128px)] shrink-0 grow-0 select-none overflow-hidden rounded-xl border-4 border-white dark:border-black aspect-square bg-gray-200 dark:bg-zinc-700 flex items-center justify-center">
                                {collectionData.image ? (
                                    <img
                                        src={getImageUrl(collectionData.image)} // Also use collection image for logo
                                        alt={`${collectionData.name || 'Collection'} logo`}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <span className="text-gray-500 dark:text-gray-400 text-xs">No Logo</span>
                                )}
                            </div>
                            <div className="flex flex-col w-full min-w-0">
                                <div className="flex items-center min-w-0">
                                    <h1 className="text-2xl lg:text-3xl font-bold text-white truncate select-all" title={collectionData.name || 'Untitled Collection'}>
                                        {collectionData.name || 'Untitled Collection'} 
                                    </h1>
                                    {collectionData.verified && (
                                        <FiCheckCircle className="ml-2 h-5 w-5 shrink-0 text-blue-400" title="Verified Creator" />
                                    )}
                                </div>
                                <div className="mt-1 flex w-full flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-300 lg:text-sm">
                                    <span>By <a href="#" className="font-medium text-blue-400 hover:text-blue-300">{collectionData.creator || 'Unknown Creator'}</a></span>
                                    <span className="text-gray-500">•</span>
                                    <span>{formatStat(collectionData.items)} items</span>
                                    <span className="text-gray-500">•</span>
                                    <span>Created {formatDate(collectionData.createdAt)}</span>
                                    {/* Display chain if available (from blockchainRef) */}
                                    {collectionData.chain && <span className="text-gray-500">•</span>}
                                    {collectionData.chain && <span>{collectionData.chain}</span>}
                                    {/* Display propertyType if available and chain is not, as a fallback for 'category' */}
                                    {!collectionData.chain && collectionData.propertyType && <span className="text-gray-500">•</span>}
                                    {!collectionData.chain && collectionData.propertyType && <span>{collectionData.propertyType}</span>}
                                </div>
                            </div>
                        </div>
                        {/* Right Side: Action Buttons & Stats Bar */}
                        <div className="flex min-w-0 flex-col items-end gap-4 pt-4 lg:pt-0">
                            <div className="flex h-8 items-center justify-end gap-3">
                                <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/20 text-white backdrop-blur-md transition hover:bg-black/30">
                                    <FiStar className="h-4 w-4" />
                                </button>
                                <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/20 text-white backdrop-blur-md transition hover:bg-black/30">
                                    <FiCopy className="h-4 w-4" />
                                </button>
                                <button className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/20 text-white backdrop-blur-md transition hover:bg-black/30">
                                    <FiMoreHorizontal className="h-4 w-4" />
                                </button>
                            </div>
                            {/* Stats Bar using LandListingWithDetails fields */}
                            <div className="grid grid-cols-3 sm:grid-cols-5 items-center overflow-hidden rounded-lg border border-white/10 bg-black/20 backdrop-blur-md text-white md:gap-0 w-full">
                                <StatItem title="Volume (24h)" value={formatCurrency(collectionData.volume24h, collectionData.priceCurrency)} />
                                <StatItem title="Floor Price" value={formatCurrency(collectionData.floorPrice, collectionData.priceCurrency)} />
                                <StatItem title="Listed" value={`${formatStat(listedPercentage, 0)}%`} />
                                <StatItem title="Owners" value={formatStat(collectionData.ownerCount)} />
                                <StatItem title="Top Offer" value={formatCurrency(collectionData.topOffer, collectionData.priceCurrency)} isLast={true} />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Section */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
                {/* About Section */}
                {collectionData.description && (
                    <section className="mb-10 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm">
                        <div className="p-6">
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">About "{collectionData.name || 'this collection'}"</h2>
                            <motion.div 
                                initial={false}
                                animate={{ height: showFullDescription ? 'auto' : '60px' }} // Approx 3 lines
                                transition={{ duration: 0.3 }}
                                className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed overflow-hidden relative whitespace-pre-line"
                            >
                                {collectionData.description}
                            </motion.div>
                            {/* Show 'Show more/less' button if description is long or has many newlines */}
                            {(collectionData.description.length > 150 || (collectionData.description.split('\n').length > 3)) && (
                                <button 
                                    onClick={() => setShowFullDescription(!showFullDescription)}
                                    className="text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium mt-2 inline-block"
                                >
                                    {showFullDescription ? 'Show less' : 'Show more'}
                                </button>
                            )}
                        </div>
                    </section>
                )}

                {/* NFTs Grid Section */}
                <section>
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                        Items ({formatStat(nfts?.length || 0)})
                    </h2>
                    {(nfts && nfts.length > 0) ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
                            {nfts.map((nft) => (
                                // Pass collection's priceCurrency to NFTCardSimple if it needs it
                                <NFTCardSimple key={nft.id} nft={nft} collectionCurrency={collectionData.priceCurrency} collectionTotalItems={collectionData.items} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-10">
                            <FiInfo className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No NFTs found</h3>
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">This collection currently has no NFTs listed or available.</p>
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
};

// Helper component for stats bar items
const StatItem: React.FC<{ title: string; value: string; isLast?: boolean }> = ({ title, value, isLast }) => (
    <div className={`flex flex-col items-start gap-0 whitespace-nowrap select-text p-3 ${isLast ? '' : 'sm:border-r sm:border-white/10'}`}>
        <span className="text-xs text-gray-400 dark:text-gray-300">{title}</span>
        <span className="text-sm lg:text-base font-semibold text-white">{value}</span>
    </div>
);

export default SingleCollectionPage;