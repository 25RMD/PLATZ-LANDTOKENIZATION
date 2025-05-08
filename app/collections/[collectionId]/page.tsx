"use client";

import React, { useState, useEffect, useRef } from 'react';
import useWatchlist from '@/hooks/useWatchlist';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { getImageUrl, getPlaceholderImage } from '@/lib/utils/imageUtils';
import { FiAlertCircle, FiArrowLeft, FiStar, FiInfo, FiCopy, FiX, FiMoreHorizontal, FiCheckCircle, FiTwitter, FiMail, FiShare2, FiExternalLink, FiLoader } from 'react-icons/fi';
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
  country: string | null;
  state: string | null;
  localGovernmentArea: string | null;
  latitude: string | null;
  longitude: string | null;
  ограниченияОбременения: string | null;
  дополнительнаяИнформация: string | null;
  additionalNotes: string | null;
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
    const router = useRouter();
    const collectionId = params?.collectionId as string;

    const [collectionData, setCollectionData] = useState<LandListingWithDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showFullDescription, setShowFullDescription] = useState(false); // For 'About' section
    const [showMoreOptions, setShowMoreOptions] = useState(false); // For more options dropdown
    const [showToast, setShowToast] = useState(false); // For toast notifications
    const [toastMessage, setToastMessage] = useState(''); // Toast message content
    
    // Use the watchlist hook instead of local state
    const { isWatchlisted, isWatchlistLoading, toggleWatchlist, checkWatchlistStatus } = useWatchlist(); 
    const dropdownRef = useRef<HTMLDivElement>(null);
    
    // Handle click outside to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowMoreOptions(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (!collectionId) {
            setError("Collection ID not found in URL.");
            setIsLoading(false);
            return;
        }

        const fetchCollectionData = async () => {
            if (!collectionId) return;
            
            try {
                setIsLoading(true);
                setError(null);
                
                const response = await fetch(`/api/collections/${collectionId}`);
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data: LandListingWithDetails = await response.json();
                setCollectionData(data);
                
                // Check watchlist status using the hook function
                await checkWatchlistStatus(collectionId);
                
            } catch (err: any) {
                console.error('Error fetching collection:', err);
                setError(err.message || 'Failed to load collection');
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchCollectionData();
    }, [collectionId, checkWatchlistStatus]);
    
    // Helper to format numbers (e.g., item count, owner count)
    const formatStat = (value: number | null | undefined, precision = 0): string => {
        if (value === null || value === undefined) return 'N/A';
        return value.toLocaleString(undefined, { minimumFractionDigits: precision, maximumFractionDigits: precision });
    };

    // Helper for currency
    const formatCurrency = (value: number | null | undefined, currencySymbol?: string | null): string => {
        if (value === null || value === undefined) return 'N/A';
        const symbol = currencySymbol || ''; // Use provided currency symbol or empty string
        return symbol ? `${symbol} ${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : 
                       `${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
    
    // Using the centralized getImageUrl utility function from lib/utils/imageUtils.ts
    // Note: For banner images, we use a different default placeholder
    const getBannerImageUrl = (imageRef: string | null | undefined): string => {
        return getImageUrl(imageRef, getPlaceholderImage('banner'));
    };
    
    // Helper for collection logo images
    const getLogoImageUrl = (imageRef: string | null | undefined): string => {
        return getImageUrl(imageRef, getPlaceholderImage('collection'));
    };

    if (isLoading) {
        return (
            <div className="animate-pulse overflow-x-hidden">
                {/* Skeleton Header */}
                 <div className="bg-gray-300 dark:bg-zinc-700 relative w-full">
                    {/* Banner Skeleton */}
                    <div className="pointer-events-none relative aspect-4/3 md:aspect-16/9 lg:aspect-[7/2] xl:h-[min(550px,_100vh_-_270px)] w-full bg-gray-400 dark:bg-zinc-600"></div>
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
                <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 overflow-hidden">
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
    
    // Extract location data from additionalNotes if available
    let locationData = {
        country: collectionData.country,
        state: collectionData.state,
        localGovernmentArea: collectionData.localGovernmentArea
    };
    
    if (!locationData.country && collectionData.additionalNotes) {
        try {
            const parsedNotes = JSON.parse(collectionData.additionalNotes);
            if (parsedNotes.locationData) {
                locationData = {
                    ...locationData,
                    ...parsedNotes.locationData
                };
            }
        } catch (e) {
            console.error('Error parsing additionalNotes:', e);
        }
    }

    return (
        <div className="overflow-x-hidden min-h-screen pb-16 relative">
            {/* Toast Notification */}
            {showToast && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="fixed top-4 right-4 z-50 bg-green-600 text-white px-4 py-2 rounded-md shadow-lg flex items-center space-x-2"
                >
                    <FiCheckCircle className="h-5 w-5" />
                    <span>{toastMessage}</span>
                </motion.div>
            )}
            {/* Header Section */}
            <header className="bg-gray-50 dark:bg-zinc-900/80 relative w-full overflow-hidden">
                {/* Banner Image Container with Gradient */}
                <div className="absolute inset-0 z-0">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-900/80 dark:to-black/90 z-[2]"></div>
                    {collectionData.image && (
                        <img
                            src={getBannerImageUrl(collectionData.image)} // Mapped from nftImageFileRef
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
                                        src={getLogoImageUrl(collectionData.nftImageFileRef)}
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
                                <button 
                                    onClick={async () => {
                                        const result = await toggleWatchlist(collectionId);
                                        // Show toast message
                                        setToastMessage(result.message);
                                        setShowToast(true);
                                        setTimeout(() => setShowToast(false), 3000);
                                    }}
                                    className={`flex h-8 w-8 items-center justify-center rounded-lg ${isWatchlisted ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-black/20 hover:bg-black/30'} text-white backdrop-blur-md transition`}
                                    title={isWatchlisted ? 'Remove from watchlist' : 'Add to watchlist'}
                                    disabled={isWatchlistLoading}
                                >
                                    <FiStar className={`h-4 w-4 ${isWatchlisted ? 'fill-white' : ''}`} />
                                    {isWatchlistLoading && <span className="sr-only">Loading...</span>}
                                </button>
                                <button 
                                    onClick={() => {
                                        const url = window.location.href;
                                        navigator.clipboard.writeText(url)
                                            .then(() => {
                                                setToastMessage('Collection URL copied to clipboard!');
                                                setShowToast(true);
                                                setTimeout(() => setShowToast(false), 3000);
                                            })
                                            .catch(err => console.error('Failed to copy URL:', err));
                                    }}
                                    className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/20 text-white backdrop-blur-md transition hover:bg-black/30"
                                    title="Copy collection URL"
                                >
                                    <FiCopy className="h-4 w-4" />
                                </button>
                                <div className="relative" ref={dropdownRef}>
                                    <button 
                                        onClick={() => setShowMoreOptions(!showMoreOptions)}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg bg-black/20 text-white backdrop-blur-md transition hover:bg-black/30"
                                        title="More options"
                                    >
                                        <FiMoreHorizontal className="h-4 w-4" />
                                    </button>
                                    {showMoreOptions && (
                                        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-zinc-800 ring-1 ring-black ring-opacity-5 z-10">
                                            <div className="py-1" role="menu" aria-orientation="vertical">
                                                <button
                                                    onClick={() => {
                                                        window.open(`https://twitter.com/intent/tweet?text=Check out this NFT collection: ${collectionData.name}&url=${window.location.href}`, '_blank');
                                                        setShowMoreOptions(false);
                                                    }}
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 w-full text-left"
                                                    role="menuitem"
                                                >
                                                    <FiTwitter className="mr-2 h-4 w-4" />
                                                    Share on Twitter
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        window.open(`mailto:?subject=Check out this NFT collection: ${collectionData.name}&body=I found this amazing NFT collection: ${window.location.href}`);
                                                        setShowMoreOptions(false);
                                                    }}
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 w-full text-left"
                                                    role="menuitem"
                                                >
                                                    <FiMail className="mr-2 h-4 w-4" />
                                                    Share via Email
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        window.open(`https://t.me/share/url?url=${window.location.href}&text=Check out this NFT collection: ${collectionData.name}`, '_blank');
                                                        setShowMoreOptions(false);
                                                    }}
                                                    className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 w-full text-left"
                                                    role="menuitem"
                                                >
                                                    <FiShare2 className="mr-2 h-4 w-4" />
                                                    Share on Telegram
                                                </button>
                                                {collectionData.blockchainRef && (
                                                    <button
                                                        onClick={() => {
                                                            window.open(`https://solscan.io/token/${collectionData.blockchainRef}`, '_blank');
                                                            setShowMoreOptions(false);
                                                        }}
                                                        className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-700 w-full text-left"
                                                        role="menuitem"
                                                    >
                                                        <FiExternalLink className="mr-2 h-4 w-4" />
                                                        View on Explorer
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
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
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 overflow-hidden">
                {/* About Section */}
                <section className="mb-10 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-sm">
                    <div className="p-6">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">About "{collectionData.name || 'this collection'}"</h2>
                        
                        {/* Description */}
                        {collectionData.description && (
                            <div className="mb-6">
                                <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">Description</h3>
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
                        )}
                        
                        {/* Location Information */}
                        {(locationData.country || locationData.state || locationData.localGovernmentArea || collectionData.latitude || collectionData.longitude) && (
                            <div className="mb-6">
                                <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">Location Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {locationData.country && (
                                        <div className="bg-gray-50 dark:bg-zinc-700/30 p-3 rounded-md">
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Country</div>
                                            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{locationData.country}</div>
                                        </div>
                                    )}
                                    
                                    {locationData.state && (
                                        <div className="bg-gray-50 dark:bg-zinc-700/30 p-3 rounded-md">
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">State/Province</div>
                                            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{locationData.state}</div>
                                        </div>
                                    )}
                                    
                                    {locationData.localGovernmentArea && (
                                        <div className="bg-gray-50 dark:bg-zinc-700/30 p-3 rounded-md">
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Local Government Area</div>
                                            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{locationData.localGovernmentArea}</div>
                                        </div>
                                    )}
                                    
                                    {collectionData.latitude && (
                                        <div className="bg-gray-50 dark:bg-zinc-700/30 p-3 rounded-md">
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Latitude</div>
                                            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{collectionData.latitude}</div>
                                        </div>
                                    )}
                                    
                                    {collectionData.longitude && (
                                        <div className="bg-gray-50 dark:bg-zinc-700/30 p-3 rounded-md">
                                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Longitude</div>
                                            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{collectionData.longitude}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                        
                        {/* Property Details */}
                        <div className="mb-6">
                            <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">Property Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {collectionData.propertyType && (
                                    <div className="bg-gray-50 dark:bg-zinc-700/30 p-3 rounded-md">
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Property Type</div>
                                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{collectionData.propertyType}</div>
                                    </div>
                                )}
                                
                                {collectionData.площадьУчастка && (
                                    <div className="bg-gray-50 dark:bg-zinc-700/30 p-3 rounded-md">
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Land Area</div>
                                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{collectionData.площадьУчастка} sq.m</div>
                                    </div>
                                )}
                                
                                {collectionData.разрешенноеИспользование && (
                                    <div className="bg-gray-50 dark:bg-zinc-700/30 p-3 rounded-md">
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Permitted Use</div>
                                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{collectionData.разрешенноеИспользование}</div>
                                    </div>
                                )}
                                
                                {collectionData.кадастральныйНомер && (
                                    <div className="bg-gray-50 dark:bg-zinc-700/30 p-3 rounded-md">
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Cadastral Number</div>
                                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{collectionData.кадастральныйНомер}</div>
                                    </div>
                                )}
                                
                                {collectionData.формаСобственности && (
                                    <div className="bg-gray-50 dark:bg-zinc-700/30 p-3 rounded-md">
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Ownership Form</div>
                                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{collectionData.формаСобственности}</div>
                                    </div>
                                )}
                                
                                {collectionData.статусЗаписиЕГРН && (
                                    <div className="bg-gray-50 dark:bg-zinc-700/30 p-3 rounded-md">
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Registration Status</div>
                                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{collectionData.статусЗаписиЕГРН}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* NFT Details */}
                        <div>
                            <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">NFT Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="bg-gray-50 dark:bg-zinc-700/30 p-3 rounded-md">
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Collection Size</div>
                                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{collectionData.nftCollectionSize || collectionData.items} NFTs</div>
                                </div>
                                
                                {collectionData.listingPrice && (
                                    <div className="bg-gray-50 dark:bg-zinc-700/30 p-3 rounded-md">
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Initial Listing Price</div>
                                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">{formatCurrency(collectionData.listingPrice, collectionData.priceCurrency)}</div>
                                    </div>
                                )}
                                
                                {collectionData.blockchainRef && (
                                    <div className="bg-gray-50 dark:bg-zinc-700/30 p-3 rounded-md">
                                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Blockchain Reference</div>
                                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate" title={collectionData.blockchainRef}>
                                            {collectionData.blockchainRef.substring(0, 10)}...{collectionData.blockchainRef.substring(collectionData.blockchainRef.length - 6)}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* NFTs Grid Section */}
                <section className="overflow-hidden">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
                        Items ({formatStat(nfts?.length || 0)})
                    </h2>
                    {(nfts && nfts.length > 0) ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 w-full">
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