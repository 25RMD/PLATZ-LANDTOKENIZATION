"use client";

import React, { useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, AlertTriangle } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { ListingStatus } from '@prisma/client';
import type { User, LandListing } from '@prisma/client';
import PulsingDotsSpinner from '@/components/common/PulsingDotsSpinner';

// Define the combined type for a listing with its creator's user data
type ListingWithUser = LandListing & { 
  user: User;
  rejectionReason?: string | null;
};

// An authorization component specific to this page to check for admin role
const AdminAuth = ({ children }: { children: ReactNode }) => {
    const { user, isLoading, isAuthenticated } = useAuth();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[60vh]">
                <PulsingDotsSpinner size={48} color="bg-black dark:bg-white" />
            </div>
        );
    }

    if (!isAuthenticated || !user?.isAdmin) {
        return (
            <div className="text-center p-8">
                <AlertTriangle className="mx-auto h-12 w-12 text-red-500" />
                <h2 className="mt-4 text-2xl font-bold">Access Denied</h2>
                <p className="mt-2">You do not have permission to view this page.</p>
            </div>
        );
    }

    return <>{children}</>;
};

const AdminDashboardPage = () => {
    const [listings, setListings] = useState<ListingWithUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<ListingStatus>(ListingStatus.PENDING);
    const [expandedCard, setExpandedCard] = useState<string | null>(null);
    const [rejectionReason, setRejectionReason] = useState('');
    const [rejectionModalListingId, setRejectionModalListingId] = useState<string | null>(null);

    // ---------------- KYC STATE ----------------
    type KycRequest = {
        updateRequestId: string;
        userId: string;
        status: string;
        changes: Record<string, any>;
        adminNotes: string | null;
        submittedAt: string;
        username: string | null;
        email: string | null;
        fullName: string | null;
        kycVerified: boolean;
    };

    const [activeSection, setActiveSection] = useState<'LISTINGS' | 'KYC'>('LISTINGS');
    const [kycRequests, setKycRequests] = useState<KycRequest[]>([]);
    const [kycLoading, setKycLoading] = useState(false);
    const [kycError, setKycError] = useState<string | null>(null);
    const [expandedKycCard, setExpandedKycCard] = useState<string | null>(null);
    const [kycRejectionReason, setKycRejectionReason] = useState('');
    const [rejectionModalKycId, setRejectionModalKycId] = useState<string | null>(null);

    useEffect(() => {
        const fetchListings = async () => {
            setIsLoading(true);
            try {
                const response = await fetch('/api/admin/listings');
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch listings.');
                }
                const data = await response.json();
                setListings(data);
            } catch (err: any) {
                setError(err.message);
                toast.error(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchListings();
    }, []);

    // Fetch KYC requests when section switches to KYC
    useEffect(() => {
        if (activeSection !== 'KYC') return;
        const fetchKyc = async () => {
            setKycLoading(true);
            try {
                const response = await fetch('/api/admin/kyc-requests');
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Failed to fetch KYC requests.');
                }
                const data = await response.json();
                setKycRequests(data);
            } catch (err: any) {
                setKycError(err.message);
                toast.error(err.message);
            } finally {
                setKycLoading(false);
            }
        };
        fetchKyc();
    }, [activeSection]);

    const handleStatusUpdate = async (listingId: string, status: ListingStatus, reason?: string) => {
        const originalListings = [...listings];
        
        // Optimistically update the UI
        const updatedListings = listings.map(l => 
            l.id === listingId ? { ...l, status, rejectionReason: reason || null } : l
        );
        setListings(updatedListings);
        if (rejectionModalListingId) setRejectionModalListingId(null); // Close modal on submission

        try {
            const response = await fetch(`/api/admin/listings/${listingId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status, rejectionReason: reason }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update status.');
            }

            toast.success(`Listing has been ${status.toLowerCase()}.`);

        } catch (err: any) {
            toast.error(err.message);
            setListings(originalListings); // Revert on error
        }
    };

    const openRejectionModal = (listingId: string) => {
        setRejectionReason('');
        setRejectionModalListingId(listingId);
    };

    const filteredListings = listings.filter(l => l.status === activeTab);

    // ---- KYC Helpers ----
    const handleKycDecision = async (requestId: string, action: 'APPROVED' | 'REJECTED', reason?: string) => {
        const original = [...kycRequests];
        // optimistic update remove or change status
        if (action === 'APPROVED') {
            setKycRequests(prev => prev.filter(r => r.updateRequestId !== requestId));
        } else {
            setKycRequests(prev => prev.map(r => r.updateRequestId === requestId ? { ...r, status: 'REJECTED', adminNotes: reason || null } : r));
        }

        const endpoint = `/api/admin/kyc-update-requests/${requestId}/${action === 'APPROVED' ? 'approve' : 'reject'}`;
        try {
            const response = await fetch(endpoint, {
                method: action === 'APPROVED' ? 'POST' : 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: action === 'REJECTED' ? JSON.stringify({ reason }) : undefined,
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update KYC request.');
            }
            toast.success(`KYC request ${action.toLowerCase()} successfully.`);
        } catch (err: any) {
            toast.error(err.message);
            setKycRequests(original); // revert
        }
    };

    const openKycRejectionModal = (requestId: string) => {
        setKycRejectionReason('');
        setRejectionModalKycId(requestId);
    };

    const renderListings = () => {
        if (isLoading) return <div className="flex justify-center p-8"><PulsingDotsSpinner size={32} /></div>;
        if (error) return <p className="text-red-500 text-center p-8">Error: {error}</p>;
        if (filteredListings.length === 0) return <p className="text-gray-500 dark:text-gray-400 text-center p-8">No {activeTab.toLowerCase()} listings found.</p>;

        return (
            <div className="space-y-4">
                {filteredListings.map(listing => (
                    <Card key={listing.id}>
                        <CardHeader className="flex justify-between items-center cursor-pointer" onClick={() => setExpandedCard(expandedCard === listing.id ? null : listing.id)}>
                            <div>
                                <CardTitle>{listing.listingTitle || 'Untitled Listing'}</CardTitle>
                                <CardDescription>Submitted by: {listing.user.username || 'Unknown User'}</CardDescription>
                            </div>
                            <motion.div animate={{ rotate: expandedCard === listing.id ? 180 : 0 }}>
                                <ChevronDown />
                            </motion.div>
                        </CardHeader>
                        <AnimatePresence>
                            {expandedCard === listing.id && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-0">
                                        <p className="md:col-span-2"><strong>Description:</strong> {listing.propertyDescription || 'N/A'}</p>
                                        <p><strong>Price:</strong> ${listing.listingPrice?.toLocaleString() || '0'}</p>
                                        <p><strong>Location:</strong> {listing.city || 'N/A'}, {listing.state || 'N/A'}</p>
                                        <p><strong>Submitted:</strong> {new Date(listing.createdAt).toLocaleDateString()}</p>
                                        {listing.status === ListingStatus.REJECTED && <p className="md:col-span-2"><strong>Rejection Reason:</strong> {listing.rejectionReason}</p>}
                                        
                                        {activeTab === ListingStatus.PENDING && (
                                            <div className="flex gap-4 mt-4 md:col-span-2">
                                                <Button variant="success" onClick={() => handleStatusUpdate(listing.id, ListingStatus.APPROVED)}>Approve</Button>
                                                <Button variant="danger" onClick={() => openRejectionModal(listing.id)}>Reject</Button>
                                            </div>
                                        )}
                                    </CardContent>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Card>
                ))}
            </div>
        );
    };

    // --------- RENDER KYC REQUESTS ---------
    const renderKycRequests = () => {
        if (kycLoading) return <div className="flex justify-center p-8"><PulsingDotsSpinner size={32} /></div>;
        if (kycError) return <p className="text-red-500 text-center p-8">Error: {kycError}</p>;
        if (kycRequests.length === 0) return <p className="text-gray-500 dark:text-gray-400 text-center p-8">No pending KYC requests.</p>;

        return (
            <div className="space-y-4">
                {kycRequests.map(req => (
                    <Card key={req.updateRequestId}>
                        <CardHeader className="flex justify-between items-center cursor-pointer" onClick={() => setExpandedKycCard(expandedKycCard === req.updateRequestId ? null : req.updateRequestId)}>
                            <div>
                                <CardTitle>{req.fullName || req.username || 'Unnamed User'}</CardTitle>
                                <CardDescription>Submitted: {new Date(req.submittedAt).toLocaleDateString()}</CardDescription>
                            </div>
                            <motion.div animate={{ rotate: expandedKycCard === req.updateRequestId ? 180 : 0 }}>
                                <ChevronDown />
                            </motion.div>
                        </CardHeader>
                        <AnimatePresence>
                            {expandedKycCard === req.updateRequestId && (
                                <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <CardContent className="space-y-2 pt-0">
                                        <p><strong>User:</strong> {req.username || 'N/A'} ({req.email || 'No email'})</p>
                                        <p><strong>KYC Verified:</strong> {req.kycVerified ? 'Yes' : 'No'}</p>
                                        <div>
                                            <strong>Proposed Changes:</strong>
                                            <pre className="bg-black/5 dark:bg-white/5 rounded p-2 mt-1 text-xs whitespace-pre-wrap">
{JSON.stringify(req.changes, null, 2)}
                                            </pre>
                                        </div>
                                        <div className="flex gap-4 pt-2">
                                            <Button variant="success" onClick={() => handleKycDecision(req.updateRequestId, 'APPROVED')}>Approve</Button>
                                            <Button variant="danger" onClick={() => openKycRejectionModal(req.updateRequestId)}>Reject</Button>
                                        </div>
                                    </CardContent>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </Card>
                ))}
            </div>
        );
    };

    return (
        <AdminAuth>
             <div className="container mx-auto p-4">
                 <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

                 {/* Section Tabs */}
                 <div className="flex border-b mb-6">
                     {(['LISTINGS', 'KYC'] as const).map(section => (
                         <button
                             key={section}
                             onClick={() => setActiveSection(section)}
                             className={`py-2 px-4 text-sm font-medium transition-colors ${activeSection === section ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                         >
                             {section === 'LISTINGS' ? 'Land Listings' : 'KYC Requests'}
                         </button>
                     ))}
                 </div>

                 {/* Sub Tabs for listings */}
                 {activeSection === 'LISTINGS' && (
                     <>
                         <div className="flex border-b mb-4">
                             {(Object.values(ListingStatus)).map(status => (
                                 <button
                                     key={status}
                                     onClick={() => setActiveTab(status)}
                                     className={`py-2 px-4 text-sm font-medium transition-colors ${activeTab === status ? 'border-b-2 border-purple-500 text-purple-600 dark:text-purple-400' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
                                 >
                                     {status}
                                 </button>
                             ))}
                         </div>
                         {renderListings()}
                     </>
                 )}

                 {activeSection === 'KYC' && renderKycRequests()}

                {rejectionModalListingId && (
                    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
                         <Card className="w-full max-w-md">
                            <CardHeader>
                                <CardTitle>Provide Rejection Reason</CardTitle>
                                <CardDescription>This action is permanent. The listing will be hidden.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Label htmlFor="rejectionReason" className="mb-2">Reason</Label>
                                <Input 
                                    id="rejectionReason"
                                    value={rejectionReason}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRejectionReason(e.target.value)}
                                    placeholder="e.g., Incomplete documentation"
                                    autoFocus
                                />
                                <div className="flex justify-end gap-4 mt-6">
                                    <Button variant="secondary" onClick={() => setRejectionModalListingId(null)}>Cancel</Button>
                                    <Button 
                                        variant="danger"
                                        onClick={() => handleStatusUpdate(rejectionModalListingId, ListingStatus.REJECTED, rejectionReason)}
                                        disabled={!rejectionReason.trim()}
                                    >
                                        Confirm Rejection
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
                 {/* KYC Rejection Modal */}
                 {rejectionModalKycId && (
                     <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
                         <Card className="w-full max-w-md">
                             <CardHeader>
                                 <CardTitle>Provide Rejection Reason</CardTitle>
                                 <CardDescription>This will mark the KYC request as rejected.</CardDescription>
                             </CardHeader>
                             <CardContent>
                                 <Label htmlFor="kycRejectionReason" className="mb-2">Reason</Label>
                                 <Input
                                     id="kycRejectionReason"
                                     value={kycRejectionReason}
                                     onChange={(e: React.ChangeEvent<HTMLInputElement>) => setKycRejectionReason(e.target.value)}
                                     placeholder="e.g., Document mismatch"
                                     autoFocus
                                 />
                                 <div className="flex justify-end gap-4 mt-6">
                                     <Button variant="secondary" onClick={() => setRejectionModalKycId(null)}>Cancel</Button>
                                     <Button
                                         variant="danger"
                                         onClick={() => handleKycDecision(rejectionModalKycId!, 'REJECTED', kycRejectionReason)}
                                         disabled={!kycRejectionReason.trim()}
                                     >
                                         Confirm Rejection
                                     </Button>
                                 </div>
                             </CardContent>
                         </Card>
                     </div>
                 )}
            </div>
        </AdminAuth>
    );
};

export default AdminDashboardPage;