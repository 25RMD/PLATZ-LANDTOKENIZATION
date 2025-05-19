"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute'; // Use the general protected route
import LoadingSpinner from '@/components/common/LoadingSpinner';
import AnimatedButton from '@/components/common/AnimatedButton';
import ConfirmationModal from '@/components/common/ConfirmationModal';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiUserCheck, FiXCircle, FiInfo, FiGrid, FiCheckSquare, FiEdit3, FiEye } from 'react-icons/fi'; // Added FiEdit3, FiEye
import { HiOutlineClipboardCheck, HiCheck, HiX } from 'react-icons/hi';
import { Button } from '@/components/ui/button';

// Interface for the data expected from /api/admin/kyc-requests (now fetching KycUpdateRequests)
interface KycUpdateRequest {
    updateRequestId: string; // Renamed from id
    userId: string;
    status: string; // Should be 'PENDING'
    changes: Record<string, any>; // The proposed changes
    adminNotes?: string | null;
    submittedAt: string; // Renamed from createdAt
    // Flattened user details (current state)
    username?: string | null;
    email?: string | null;
    fullName?: string | null;
    dateOfBirth?: string | null;
    phone?: string | null;
    addressLine1?: string | null;
    addressLine2?: string | null;
    city?: string | null;
    stateProvince?: string | null;
    postalCode?: string | null;
    country?: string | null;
    govIdType?: string | null;
    govIdRef?: string | null;
    sofDocRef?: string | null;
    kycVerified: boolean; // Current verification status of the user
}

// --- START: New Interfaces for Land Listing Management ---
interface AdminLandListingUser {
    id: string;
    username: string | null;
    email: string | null;
}

interface AdminLandListing {
    id: string;
    nftTitle: string;
    status: 'DRAFT' | 'PENDING' | 'ACTIVE' | 'REJECTED' | 'DELISTED'; // Assuming these will be in prisma schema
    createdAt: string;
    user: AdminLandListingUser;
    listingPrice?: number | null;
    priceCurrency?: string | null;
    nftDescription?: string | null; // Added for more detail
}
// --- END: New Interfaces for Land Listing Management ---

// Helper function to format date strings or return N/A
const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleDateString();
    } catch (e) {
        return 'Invalid Date';
    }
};

const AdminDashboardContent = () => {
    const { user, isAdmin, isLoading: authLoading } = useAuth();
    const [requests, setRequests] = useState<KycUpdateRequest[]>([]); // Updated type
    const [loadingRequests, setLoadingRequests] = useState(true);
    const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({}); // Key is now updateRequestId
    const router = useRouter();

    // --- START: State for Tabs and Land Listings ---
    type Tab = 'kyc' | 'listings';
    type ListingSubTab = 'review' | 'active' | 'archived'; // New type for sub-tabs
    const [currentTab, setCurrentTab] = useState<Tab>('kyc');
    const [currentListingSubTab, setCurrentListingSubTab] = useState<ListingSubTab>('review'); // New state for sub-tabs

    // KYC State
    const [kycRequests, setKycRequests] = useState<KycUpdateRequest[]>([]);
    const [loadingKycRequests, setLoadingKycRequests] = useState(false);
    const [actionLoadingKyc, setActionLoadingKyc] = useState<Record<string, boolean>>({});

    // Land Listings State
    const [landListings, setLandListings] = useState<AdminLandListing[]>([]); // For 'review' (DRAFT, PENDING)
    const [loadingListings, setLoadingListings] = useState(false);
    const [activeListings, setActiveListings] = useState<AdminLandListing[]>([]); // For 'active'
    const [loadingActiveListings, setLoadingActiveListings] = useState(false);
    const [archivedListings, setArchivedListings] = useState<AdminLandListing[]>([]); // For 'rejected', 'delisted'
    const [loadingArchivedListings, setLoadingArchivedListings] = useState(false);
    const [listingActionLoading, setListingActionLoading] = useState<Record<string, { approve?: boolean; reject?: boolean; view?: boolean; delist?: boolean }>>({});

    // --- START: State for Modal and Expansion ---
    const [showDelistConfirmModal, setShowDelistConfirmModal] = useState(false);
    const [listingToDelist, setListingToDelist] = useState<AdminLandListing | null>(null);
    const [expandedListings, setExpandedListings] = useState<Record<string, boolean>>({});
    // --- END: State for Modal and Expansion ---

    // Redirect if not admin (double check)
    useEffect(() => {
        if (!authLoading && !isAdmin) {
            toast.error("Access Denied: Admin privileges required.");
            // Redirect non-admins to login instead of home page
            router.push('/login'); 
        }
    }, [authLoading, isAdmin, router]);

    const fetchKycRequests = useCallback(async () => {
        setLoadingKycRequests(true);
        try {
            const response = await fetch('/api/admin/kyc-requests', {
                credentials: 'include', // Include auth cookies
                headers: {
                    'x-user-is-admin': 'true' // Explicitly set admin header
                }
            });
            
            if (!response.ok) {
                // Try to parse error message from backend
                let errorMsg = 'Failed to fetch KYC requests';
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || errorMsg;
                } catch (parseError) { /* Ignore if response is not JSON */ }
                console.error(`KYC Request API returned status ${response.status}: ${errorMsg}`);
                throw new Error(errorMsg);
            }
            
            const data = await response.json();
            
            // Ensure data is an array
            if (!Array.isArray(data)) {
                console.error('KYC Request API returned unexpected data format:', data);
                throw new Error('Received invalid data format from server');
            }
            
            setKycRequests(data);
            console.log(`Successfully loaded ${data.length} KYC requests`);
        } catch (err: any) {
            toast.error(err.message || 'Could not load KYC requests.');
            console.error("Fetch KYC Requests Error:", err);
        } finally {
            setLoadingKycRequests(false);
        }
    }, []);

    // --- START: fetchLandListings Function ---
    const fetchLandListings = useCallback(async () => {
        setLoadingListings(true);
        try {
            // Fetching DRAFT and PENDING listings for review
            const response = await fetch('/api/admin/listings?status=DRAFT&status=PENDING', {
                credentials: 'include', // Include cookies in the request
            });
            if (!response.ok) {
                let errorMsg = 'Failed to fetch land listings for review';
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || errorMsg;
                } catch (parseError) { /* Ignore */ }
                throw new Error(errorMsg);
            }
            const responseData = await response.json();
            
            // Handle both response formats: array or {listings: array, message: string}
            const listings = Array.isArray(responseData) ? responseData : 
                             (responseData.listings && Array.isArray(responseData.listings) ? responseData.listings : []);
            
            setLandListings(listings);
        } catch (err: any) {
            toast.error(err.message || 'Could not load land listings.');
            console.error("Fetch Land Listings Error:", err);
            setLandListings([]); // Clear listings on error
        } finally {
            setLoadingListings(false);
        }
    }, []);
    // --- END: fetchLandListings Function ---

    // --- START: fetchActiveListings Function ---
    const fetchActiveListings = useCallback(async () => {
        setLoadingActiveListings(true);
        try {
            const response = await fetch('/api/admin/listings?status=ACTIVE', {
                credentials: 'include', // Include cookies in the request
            });
            if (!response.ok) {
                throw new Error((await response.json()).message || 'Failed to fetch active listings.');
            }
            const responseData = await response.json();
            
            // Handle both response formats: array or {listings: array, message: string}
            const listings = Array.isArray(responseData) ? responseData : 
                             (responseData.listings && Array.isArray(responseData.listings) ? responseData.listings : []);
            
            setActiveListings(listings);
        } catch (err: any) {
            toast.error(err.message || 'Could not load active listings.');
            setActiveListings([]);
        } finally {
            setLoadingActiveListings(false);
        }
    }, []);
    // --- END: fetchActiveListings Function ---

    // --- START: fetchArchivedListings Function ---
    const fetchArchivedListings = useCallback(async () => {
        setLoadingArchivedListings(true);
        try {
            const response = await fetch('/api/admin/listings?status=REJECTED&status=DELISTED', {
                credentials: 'include', // Include cookies in the request
            });
            if (!response.ok) {
                throw new Error((await response.json()).message || 'Failed to fetch archived listings.');
            }
            const responseData = await response.json();
            
            // Handle both response formats: array or {listings: array, message: string}
            const listings = Array.isArray(responseData) ? responseData : 
                             (responseData.listings && Array.isArray(responseData.listings) ? responseData.listings : []);
            
            setArchivedListings(listings);
        } catch (err: any) {
            toast.error(err.message || 'Could not load archived listings.');
            setArchivedListings([]);
        } finally {
            setLoadingArchivedListings(false);
        }
    }, []);
    // --- END: fetchArchivedListings Function ---

    // Fetch requests on initial load & tab/sub-tab change
    useEffect(() => {
        if (!isAdmin) {
            console.log('Not admin - skipping fetch operations');
            return;
        }
        
        console.log(`Current tab: ${currentTab}, sub-tab: ${currentListingSubTab}`);
        
        // Add a delay to ensure auth state is properly initialized
        const timer = setTimeout(() => {
            if (currentTab === 'kyc') {
                console.log('Fetching KYC requests...');
                fetchKycRequests();
            } else if (currentTab === 'listings') {
                if (currentListingSubTab === 'review') {
                    fetchLandListings(); 
                } else if (currentListingSubTab === 'active') {
                    fetchActiveListings();
                } else if (currentListingSubTab === 'archived') {
                    fetchArchivedListings();
                }
            }
        }, 500); // 500ms delay to ensure auth is established
        
        return () => clearTimeout(timer);
    }, [isAdmin, fetchKycRequests, fetchLandListings, fetchActiveListings, fetchArchivedListings, currentTab, currentListingSubTab]);

    // Renamed from handleVerify to handleApprove, uses updateRequestId
    const handleApprove = async (updateRequestId: string, userIdSubstring: string) => {
        setActionLoadingKyc(prev => ({ ...prev, [updateRequestId]: true }));
        const toastId = toast.loading(`Approving request for user ${userIdSubstring}...`);
        try {
            // Call the new approval endpoint
            const response = await fetch(`/api/admin/kyc-update-requests/${updateRequestId}/approve`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // No body needed, ID is in URL
            });
            if (!response.ok) {
                 const errorData = await response.json().catch(() => ({}));
                 throw new Error(errorData.message || 'Approval failed');
            }
            toast.success(`Request approved for user ${userIdSubstring}! User data updated.`, { id: toastId });
            // Refresh the list after approval
            fetchKycRequests();
        } catch (err: any) {
            toast.error(err.message || 'Failed to approve request.', { id: toastId });
            console.error("Approve KYC Request Error:", err);
        } finally {
             setActionLoadingKyc(prev => ({ ...prev, [updateRequestId]: false }));
        }
    };

    // Updated handleReject to use updateRequestId
    const handleReject = async (updateRequestId: string, userIdSubstring: string) => {
        if (!window.confirm(`Are you sure you want to reject this KYC update request for user ${userIdSubstring}...? This will discard the changes.`)) {
            return;
        }
        setActionLoadingKyc(prev => ({ ...prev, [updateRequestId]: true }));
        const toastId = toast.loading(`Rejecting request for user ${userIdSubstring}...`);
        try {
            // Call the new rejection endpoint
            const response = await fetch(`/api/admin/kyc-update-requests/${updateRequestId}/reject`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Rejection failed');
            }
            toast.success(`Request rejected for user ${userIdSubstring}.`, { id: toastId });
            fetchKycRequests(); // Refresh the list
        } catch (err: any) {
            toast.error(err.message || 'Failed to reject request.', { id: toastId });
            console.error("Reject KYC Request Error:", err);
        } finally {
            setActionLoadingKyc(prev => ({ ...prev, [updateRequestId]: false }));
        }
    };

    // --- START: handleUpdateListingStatus Function (Enhanced) ---
    const handleUpdateListingStatus = async (listingId: string, newStatus: 'ACTIVE' | 'REJECTED' | 'DELISTED') => {
        let actionType: 'approve' | 'reject' | 'delist' = 'approve'; // default
        if (newStatus === 'REJECTED') actionType = 'reject';
        if (newStatus === 'DELISTED') actionType = 'delist';

        setListingActionLoading(prev => ({ ...prev, [listingId]: { ...prev[listingId], [actionType]: true } }));
        try {
            const response = await fetch(`/api/admin/listings/${listingId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Include cookies in the request
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) {
                let errorMsg = `Failed to update listing to ${newStatus}.`;
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || errorMsg;
                } catch (parseError) { /* Ignore */ }
                throw new Error(errorMsg);
            }

            const updatedListing: AdminLandListing = await response.json();
            toast.success(`Listing ${updatedListing.nftTitle || listingId} has been ${newStatus.toLowerCase()}.`);

            // Update local state based on the new status
            if (newStatus === 'ACTIVE') {
                setLandListings(prev => prev.filter(l => l.id !== listingId));
                // setActiveListings(prev => [...prev, updatedListing]); // Or refetch Active tab if open
                if (currentListingSubTab === 'active') fetchActiveListings(); 
            } else if (newStatus === 'REJECTED') {
                setLandListings(prev => prev.filter(l => l.id !== listingId));
                if (currentListingSubTab === 'archived') fetchArchivedListings();
            } else if (newStatus === 'DELISTED') {
                setActiveListings(prev => prev.filter(l => l.id !== listingId));
                if (currentListingSubTab === 'archived') fetchArchivedListings();
            }
            
            if (listingToDelist && listingId === listingToDelist.id) {
                setShowDelistConfirmModal(false);
                setListingToDelist(null);
            }

        } catch (err: any) {
            toast.error(err.message || `Could not update listing status.`);
            console.error(`Update Listing Status (${newStatus}) Error:`, err);
        } finally {
            setListingActionLoading(prev => ({ ...prev, [listingId]: { ...prev[listingId], [actionType]: false } }));
        }
    };
    // --- END: handleUpdateListingStatus Function (Enhanced) ---

    // --- START: Toggle Expanded Details --- 
    const toggleExpandDetails = (listingId: string) => {
        setExpandedListings(prev => ({ ...prev, [listingId]: !prev[listingId] }));
    };
    // --- END: Toggle Expanded Details ---

    // Updated logic for rendering KYC requests with more robust data handling
    const renderKycRequests = () => {
        if (loadingKycRequests) {
            return (
                <div className="flex justify-center py-8">
                    <LoadingSpinner size="lg" />
                </div>
            );
        }

        if (kycRequests.length === 0) {
            return (
                <div className="text-center py-16 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <HiOutlineClipboardCheck className="mx-auto text-4xl text-gray-400" />
                    <p className="mt-2 text-gray-500 dark:text-gray-400">No pending KYC requests to review</p>
                </div>
            );
        }

        // Convert single flat request object to an array if needed
        const requestsArray = Array.isArray(kycRequests) ? kycRequests : [kycRequests];

        return (
            <div className="space-y-6">
                {requestsArray.map((request) => {
                    // Safely extract userId from request, defaulting to a substring of updateRequestId if missing
                    const userId = request.userId || (request.updateRequestId ? request.updateRequestId.substring(0, 8) : 'unknown');
                    const userIdSubstring = userId.substring(0, 8); // First 8 chars for display
                    
                    // Extract changes or default to empty object
                    const changes = request.changes || {};
                    
                    // Get details about the user's current state
                    const username = request.username || 'N/A';
                    const email = request.email || 'N/A';
                    
                    // Log the request structure for debugging
                    console.log('Processing KYC request:', request);

                    return (
                        <div key={request.updateRequestId} className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
                            <div className="flex flex-col md:flex-row md:justify-between">
                                <div>
                                    <p className="font-bold text-lg mb-2">User Update Request</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Username</p>
                                            <p>{username}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Email</p>
                                            <p>{email}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">User ID</p>
                                            <p title={userId}>{userIdSubstring}...</p>
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Submitted</p>
                                            <p>{formatDate(request.submittedAt)}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-4 md:mt-0 md:text-right">
                                    <div className="flex space-x-2 justify-start md:justify-end">
                                        <Button
                                            variant="success"
                                            onClick={() => handleApprove(request.updateRequestId, userIdSubstring)}
                                            disabled={actionLoadingKyc[request.updateRequestId]}
                                            icon={actionLoadingKyc[request.updateRequestId] ? <LoadingSpinner size="sm" /> : <HiCheck />}
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            variant="danger"
                                            onClick={() => handleReject(request.updateRequestId, userIdSubstring)}
                                            disabled={actionLoadingKyc[request.updateRequestId]}
                                            icon={actionLoadingKyc[request.updateRequestId] ? <LoadingSpinner size="sm" /> : <HiX />}
                                        >
                                            Reject
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            <p className="font-semibold text-md mb-2 mt-4">Requested Changes</p>
                            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {Object.entries(changes).map(([key, value]) => (
                                        <div key={key}>
                                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                                                {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                            </p>
                                            <p>{value as React.ReactNode}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    if (authLoading || (currentTab === 'kyc' && loadingKycRequests)) {
        return (
          <div className="flex justify-center items-center min-h-[60vh]">
            <LoadingSpinner size="lg" />
            <p className="ml-4 text-text-light dark:text-text-dark">Loading Admin Dashboard Content...</p>
          </div>
        );
    }

     if (!isAdmin) {
         // Should have been redirected, but render nothing as fallback
         return null;
     }

    const listingSubTabs: { id: ListingSubTab; label: string }[] = [
        { id: 'review', label: 'Awaiting Review' },
        { id: 'active', label: 'Active Listings' },
        { id: 'archived', label: 'Archived (Rejected/Delisted)' },
    ];

    return (
        <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5 }}
             className="container mx-auto mt-4 mb-12 p-6 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-xl bg-primary-light dark:bg-card-dark"
        >
            <h1 className="text-3xl font-semibold text-text-light dark:text-text-dark mb-6">Admin Dashboard</h1>

            {/* --- START: Tab Navigation --- */}
            <div className="mb-6 border-b border-gray-300 dark:border-zinc-700">
                <nav className="-mb-px flex space-x-6" aria-label="Tabs">
                    <button
                        onClick={() => setCurrentTab('kyc')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm 
                            ${currentTab === 'kyc' 
                                ? 'border-accent-light dark:border-accent-dark text-accent-light dark:text-accent-dark' 
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-zinc-600'}
                        `}
                    >
                        <FiUserCheck className="inline-block mr-2 h-5 w-5" /> KYC Management
                    </button>
                    <button
                        onClick={() => setCurrentTab('listings')}
                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm 
                            ${currentTab === 'listings' 
                                ? 'border-accent-light dark:border-accent-dark text-accent-light dark:text-accent-dark' 
                                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-zinc-600'}
                        `}
                    >
                       <FiGrid className="inline-block mr-2 h-5 w-5" /> Land Listing Management
                    </button>
                </nav>
            </div>
            {/* --- END: Tab Navigation --- */}

            {/* --- START: Conditional Content Rendering based on Tab --- */}
            {currentTab === 'kyc' && (
                <>
                    <h2 className="text-2xl font-semibold text-text-light dark:text-text-dark mb-4">Pending KYC Updates</h2>
                    {renderKycRequests()}
                </>
            )}

            {currentTab === 'listings' && (
                <>
                    {/* Sub-tab navigation for listings */}
                    <div className="mb-6 flex space-x-1 border-b border-gray-300 dark:border-zinc-700">
                        {listingSubTabs.map((subTab) => (
                            <button
                                key={subTab.id}
                                onClick={() => setCurrentListingSubTab(subTab.id)}
                                className={`px-4 py-2 -mb-px text-sm font-medium transition-colors duration-150 ease-in-out focus:outline-none 
                                    ${currentListingSubTab === subTab.id 
                                        ? 'border-b-2 border-accent-light dark:border-accent-dark text-accent-light dark:text-accent-dark'
                                        : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border-b-2 border-transparent hover:border-gray-300 dark:hover:border-zinc-600'}
                                `}
                            >
                                {subTab.label}
                            </button>
                        ))}
                    </div>

                    {/* Content for 'Awaiting Review' Sub-tab */}
                    {currentListingSubTab === 'review' && (
                        <>
                            {loadingListings ? (
                                 <div className="flex justify-center items-center py-10"><LoadingSpinner /> <span className='ml-2'>Loading listings for review...</span></div>
                            ) : landListings.length === 0 ? (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-10">No DRAFT or PENDING listings found for review.</p>
                            ) : (
                                <div className="space-y-6">
                                    {landListings.map((listing) => (
                                        <div key={listing.id} className="p-4 border border-gray-300 dark:border-zinc-700 rounded-lg bg-secondary-light dark:bg-zinc-800 shadow-md">
                                            {/* ... existing display logic for review listings ... */}
                                            <div className="flex flex-col sm:flex-row justify-between items-start mb-2">
                                                <h3 className="text-xl font-semibold text-accent-light dark:text-accent-dark mb-1 sm:mb-0">
                                                    {listing.nftTitle || 'Untitled Listing'}
                                                </h3>
                                                <span 
                                                    className={`px-2.5 py-0.5 text-xs font-medium rounded-full 
                                                        ${listing.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300' : 
                                                          listing.status === 'DRAFT' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300' : 
                                                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}
                                                    `}
                                                >
                                                    {listing.status}
                                                </span>
                                            </div>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm text-text-light dark:text-text-dark mb-3">
                                                <p><strong>Listing ID:</strong> <code className="text-xs bg-gray-200 dark:bg-zinc-700 px-1 py-0.5 rounded">{listing.id}</code></p>
                                                <p><strong>Creator:</strong> {listing.user.username || 'N/A'} ({listing.user.email || 'No Email'})</p>
                                                <p><strong>Created At:</strong> {formatDate(listing.createdAt)}</p>
                                                <p><strong>Price:</strong> {listing.listingPrice ? `${listing.listingPrice} ${listing.priceCurrency || ''}` : 'N/A'}</p>
                                                {!expandedListings[listing.id] && listing.nftDescription && (
                                                    <p className="md:col-span-2"><strong>Description:</strong> {listing.nftDescription.length > 100 ? `${listing.nftDescription.substring(0, 100)}...` : listing.nftDescription}</p>
                                                )}
                                            </div>
                                            
                                            {expandedListings[listing.id] && (
                                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-zinc-700 text-sm text-text-light dark:text-text-dark">
                                                    <p><strong>Full Description:</strong> {listing.nftDescription || 'N/A'}</p>
                                                    <p className="mt-2"><strong>Status Details:</strong> {listing.status === 'DRAFT' ? 'This listing is still in draft mode and has not been submitted for review.' : 'This listing has been submitted and is awaiting admin approval.'}</p>
                                                    <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">Further details will appear here as they become available.</p>
                                                </div>
                                            )}

                                            <div className="mt-4 pt-3 border-t border-gray-300 dark:border-zinc-700 flex flex-col sm:flex-row sm:items-center sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                                                <AnimatedButton 
                                                    onClick={() => toggleExpandDetails(listing.id)}
                                                    className="bg-gray-500 hover:bg-gray-600 text-white text-xs sm:text-sm flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md"
                                                >
                                                    <FiEye className="h-4 w-4" /> {expandedListings[listing.id] ? 'Hide Details' : 'View Full Details'}
                                                </AnimatedButton>
                                                <AnimatedButton 
                                                    onClick={() => handleUpdateListingStatus(listing.id, 'ACTIVE')}
                                                    disabled={listingActionLoading[listing.id]?.approve || listingActionLoading[listing.id]?.reject}
                                                    className="bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md"
                                                    data-testid={`approve-button-${listing.id}`}
                                                >
                                                    <FiCheckSquare className="h-4 w-4" /> {listingActionLoading[listing.id]?.approve ? 'Approving...' : 'Approve (Set ACTIVE)'}
                                                </AnimatedButton>
                                                <AnimatedButton 
                                                    onClick={() => handleUpdateListingStatus(listing.id, 'REJECTED')}
                                                    disabled={listingActionLoading[listing.id]?.approve || listingActionLoading[listing.id]?.reject}
                                                    className="bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md"
                                                    data-testid={`reject-button-${listing.id}`}
                                                >
                                                    <FiXCircle className="h-4 w-4" /> {listingActionLoading[listing.id]?.reject ? 'Rejecting...' : 'Reject (Set REJECTED)'}
                                                </AnimatedButton>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* Content for 'Active Listings' Sub-tab */}
                    {currentListingSubTab === 'active' && (
                        <>
                            {loadingActiveListings ? (
                                <div className="flex justify-center items-center py-10"><LoadingSpinner /> <span className='ml-2'>Loading active listings...</span></div>
                            ) : activeListings.length === 0 ? (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-10">No active listings found.</p>
                            ) : (
                                <div className="space-y-6">
                                    {activeListings.map((listing: AdminLandListing) => (
                                        <div key={listing.id} className="p-4 border border-gray-300 dark:border-zinc-700 rounded-lg bg-secondary-light dark:bg-zinc-800 shadow-md">
                                            <div className="flex flex-col sm:flex-row justify-between items-start mb-2">
                                                <h3 className="text-xl font-semibold text-accent-light dark:text-accent-dark mb-1 sm:mb-0">
                                                    {listing.nftTitle || 'Untitled Listing'}
                                                </h3>
                                                <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`}>
                                                    {listing.status}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm text-text-light dark:text-text-dark mb-3">
                                                <p><strong>Listing ID:</strong> <code className="text-xs bg-gray-200 dark:bg-zinc-700 px-1 py-0.5 rounded">{listing.id}</code></p>
                                                <p><strong>Creator:</strong> {listing.user.username || 'N/A'} ({listing.user.email || 'No Email'})</p>
                                                <p><strong>Created At:</strong> {formatDate(listing.createdAt)}</p>
                                                <p><strong>Price:</strong> {listing.listingPrice ? `${listing.listingPrice} ${listing.priceCurrency || ''}` : 'N/A'}</p>
                                            </div>
                                            {expandedListings[listing.id] && (
                                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-zinc-700 text-sm text-text-light dark:text-text-dark">
                                                    <p><strong>Full Description:</strong> {listing.nftDescription || 'N/A'}</p>
                                                    {/* Add more details here as needed */}
                                                    <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">Further details will appear here.</p>
                                                </div>
                                            )}
                                            <div className="mt-4 pt-3 border-t border-gray-300 dark:border-zinc-700 flex flex-col sm:flex-row sm:items-center sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                                                <AnimatedButton 
                                                    onClick={() => toggleExpandDetails(listing.id)}
                                                    className="bg-gray-500 hover:bg-gray-600 text-white text-xs sm:text-sm flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md"
                                                >
                                                    <FiEye className="h-4 w-4" /> {expandedListings[listing.id] ? 'Hide Details' : 'View Full Details'}
                                                </AnimatedButton>
                                                <AnimatedButton 
                                                    onClick={() => { setListingToDelist(listing); setShowDelistConfirmModal(true); }}
                                                    disabled={listingActionLoading[listing.id]?.delist}
                                                    className="bg-orange-600 hover:bg-orange-700 text-white text-xs sm:text-sm flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md"
                                                >
                                                    <FiXCircle className="h-4 w-4" /> {listingActionLoading[listing.id]?.delist ? 'Delisting...' : 'Delist Listing'}
                                                </AnimatedButton>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {/* Content for 'Archived' Sub-tab */}
                    {currentListingSubTab === 'archived' && (
                        <>
                            {loadingArchivedListings ? (
                                <div className="flex justify-center items-center py-10"><LoadingSpinner /> <span className='ml-2'>Loading archived listings...</span></div>
                            ) : archivedListings.length === 0 ? (
                                <p className="text-center text-gray-500 dark:text-gray-400 py-10">No rejected or delisted listings found.</p>
                            ) : (
                                <div className="space-y-6">
                                    {archivedListings.map((listing: AdminLandListing) => (
                                        <div key={listing.id} className="p-4 border border-gray-300 dark:border-zinc-700 rounded-lg bg-secondary-light dark:bg-zinc-800 shadow-md opacity-75">
                                            <div className="flex flex-col sm:flex-row justify-between items-start mb-2">
                                                <h3 className="text-xl font-semibold text-accent-light dark:text-accent-dark mb-1 sm:mb-0">
                                                    {listing.nftTitle || 'Untitled Listing'}
                                                </h3>
                                                <span 
                                                    className={`px-2.5 py-0.5 text-xs font-medium rounded-full 
                                                        ${listing.status === 'REJECTED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300' : 
                                                          listing.status === 'DELISTED' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300' : 
                                                          'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'}
                                                    `}
                                                >
                                                    {listing.status}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm text-text-light dark:text-text-dark mb-3">
                                                <p><strong>Listing ID:</strong> <code className="text-xs bg-gray-200 dark:bg-zinc-700 px-1 py-0.5 rounded">{listing.id}</code></p>
                                                <p><strong>Creator:</strong> {listing.user.username || 'N/A'} ({listing.user.email || 'No Email'})</p>
                                                <p><strong>Processed At:</strong> {formatDate(listing.createdAt)}</p> {/* Assuming createdAt is close enough or add updatedAt if available */}
                                                <p><strong>Price:</strong> {listing.listingPrice ? `${listing.listingPrice} ${listing.priceCurrency || ''}` : 'N/A'}</p>
                                            </div>
                                            {expandedListings[listing.id] && (
                                                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-zinc-700 text-sm text-text-light dark:text-text-dark">
                                                    <p><strong>Full Description:</strong> {listing.nftDescription || 'N/A'}</p>
                                                     {/* Add more details here as needed */}
                                                    <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">Further details will appear here.</p>
                                                </div>
                                            )}
                                            <div className="mt-4 pt-3 border-t border-gray-300 dark:border-zinc-700 flex flex-col sm:flex-row sm:items-center sm:justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                                                <AnimatedButton 
                                                    onClick={() => toggleExpandDetails(listing.id)}
                                                    className="bg-gray-500 hover:bg-gray-600 text-white text-xs sm:text-sm flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md"
                                                >
                                                    <FiEye className="h-4 w-4" /> {expandedListings[listing.id] ? 'Hide Details' : 'View Full Details'}
                                                </AnimatedButton>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
            {/* --- END: Land Listing Management Content --- */}
            <ConfirmationModal 
                isOpen={showDelistConfirmModal}
                onClose={() => { setShowDelistConfirmModal(false); setListingToDelist(null); }}
                onConfirm={() => {
                    if (listingToDelist) {
                        handleUpdateListingStatus(listingToDelist.id, 'DELISTED');
                    }
                }}
                title="Confirm Delist"
                message={`Are you sure you want to delist the listing "${listingToDelist?.nftTitle || 'this listing'}"? This action cannot be undone.`}
            />
        </motion.div>
    );
};

// Wrap the content with ProtectedRoute to ensure user is logged in
const AdminDashboardPage = () => {
    return (
        <ProtectedRoute>
            <AdminDashboardContent />
        </ProtectedRoute>
    );
};

export default AdminDashboardPage; 