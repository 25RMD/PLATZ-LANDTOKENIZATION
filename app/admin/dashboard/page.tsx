"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute'; // Use the general protected route
import LoadingSpinner from '@/components/common/LoadingSpinner';
import AnimatedButton from '@/components/common/AnimatedButton';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiUserCheck, FiXCircle, FiInfo } from 'react-icons/fi';

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

    // Redirect if not admin (double check)
    useEffect(() => {
        if (!authLoading && !isAdmin) {
            toast.error("Access Denied: Admin privileges required.");
            // Redirect non-admins to login instead of home page
            router.push('/login'); 
        }
    }, [authLoading, isAdmin, router]);

    const fetchRequests = useCallback(async () => {
        setLoadingRequests(true);
        try {
            const response = await fetch('/api/admin/kyc-requests');
            if (!response.ok) {
                // Try to parse error message from backend
                let errorMsg = 'Failed to fetch KYC requests';
                try {
                    const errorData = await response.json();
                    errorMsg = errorData.message || errorMsg;
                } catch (parseError) { /* Ignore if response is not JSON */ }
                throw new Error(errorMsg);
            }
            const data: KycUpdateRequest[] = await response.json(); // Updated type
            setRequests(data);
        } catch (err: any) {
            toast.error(err.message || 'Could not load KYC requests.');
            console.error("Fetch KYC Requests Error:", err);
        } finally {
            setLoadingRequests(false);
        }
    }, []);

    // Fetch requests on initial load
    useEffect(() => {
        if (isAdmin) { // Only fetch if confirmed admin
            fetchRequests();
        }
    }, [isAdmin, fetchRequests]);

    // Renamed from handleVerify to handleApprove, uses updateRequestId
    const handleApprove = async (updateRequestId: string, userIdSubstring: string) => {
        setActionLoading(prev => ({ ...prev, [updateRequestId]: true }));
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
            fetchRequests();
        } catch (err: any) {
            toast.error(err.message || 'Failed to approve request.', { id: toastId });
            console.error("Approve KYC Request Error:", err);
        } finally {
             setActionLoading(prev => ({ ...prev, [updateRequestId]: false }));
        }
    };

    // Updated handleReject to use updateRequestId
    const handleReject = async (updateRequestId: string, userIdSubstring: string) => {
        if (!window.confirm(`Are you sure you want to reject this KYC update request for user ${userIdSubstring}...? This will discard the changes.`)) {
            return;
        }
        setActionLoading(prev => ({ ...prev, [updateRequestId]: true }));
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
            fetchRequests(); // Refresh the list
        } catch (err: any) {
            toast.error(err.message || 'Failed to reject request.', { id: toastId });
            console.error("Reject KYC Request Error:", err);
        } finally {
            setActionLoading(prev => ({ ...prev, [updateRequestId]: false }));
        }
    };

    if (authLoading || loadingRequests) {
        return (
          <div className="flex justify-center items-center min-h-[60vh]">
            <LoadingSpinner size="lg" />
            <p className="ml-4 text-text-light dark:text-text-dark">Loading Admin Dashboard...</p>
          </div>
        );
    }

     if (!isAdmin) {
         // Should have been redirected, but render nothing as fallback
         return null;
     }

    return (
        <motion.div
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ duration: 0.5 }}
             className="container mx-auto mt-4 mb-12 p-6 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-xl bg-primary-light dark:bg-card-dark"
        >
            <h1 className="text-3xl font-semibold text-text-light dark:text-text-dark mb-6">Admin Dashboard - Pending KYC Updates</h1>

            {requests.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-10">No pending KYC requests found.</p>
            ) : (
                <div className="space-y-6">
                    {requests.map((req) => (
                        <div key={req.updateRequestId} className="p-4 border border-gray-300 dark:border-zinc-700 rounded-lg bg-secondary-light dark:bg-zinc-800 shadow-md">
                            <h2 className="text-lg font-medium mb-3 text-text-light dark:text-text-dark">Update Request ID: <code className="text-base bg-gray-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded">{req.updateRequestId}</code></h2>
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                {/* Column 1: Current User Info */} 
                                <div className="flex-grow space-y-1 text-sm w-full md:w-1/2 border-r md:pr-4 border-gray-300 dark:border-zinc-600">
                                    <h3 className="text-base font-medium mb-2 underline">Current User Data</h3>
                                    <p><strong>User ID:</strong> <code className="text-xs bg-gray-200 dark:bg-zinc-700 px-1 py-0.5 rounded">{req.userId}</code></p>
                                    <p><strong>Username:</strong> {req.username || 'N/A'}</p>
                                    <p><strong>Email:</strong> {req.email || 'N/A'}</p>
                                    <p><strong>Current Status:</strong> {req.kycVerified ? <span className="text-green-600 dark:text-green-400 font-medium">(Verified)</span> : <span className="text-yellow-600 dark:text-yellow-400 font-medium">(Not Verified)</span>}</p>
                                    <hr className="my-2 border-gray-300 dark:border-zinc-600"/>
                                    <p><strong>Full Name:</strong> {req.fullName || 'N/A'}</p>
                                    <p><strong>DOB:</strong> {formatDate(req.dateOfBirth)}</p>
                                    <p><strong>Phone:</strong> {req.phone || 'N/A'}</p>
                                    <p><strong>Address 1:</strong> {req.addressLine1 || 'N/A'}</p>
                                    <p><strong>Address 2:</strong> {req.addressLine2 || 'N/A'}</p>
                                    <p><strong>City:</strong> {req.city || 'N/A'}</p>
                                    <p><strong>State/Province:</strong> {req.stateProvince || 'N/A'}</p>
                                    <p><strong>Postal Code:</strong> {req.postalCode || 'N/A'}</p>
                                    <p><strong>Country:</strong> {req.country || 'N/A'}</p>
                                    <p><strong>Gov ID Type:</strong> {req.govIdType || 'N/A'}</p>
                                    <p><strong>Gov ID Ref:</strong> {req.govIdRef || 'N/A'}</p>
                                    <p><strong>SoF Doc Ref:</strong> {req.sofDocRef || 'N/A'}</p>
                                    <p><strong>Submitted:</strong> {new Date(req.submittedAt).toLocaleString()}</p>
                                </div>

                                {/* Column 2: Proposed Changes & Actions */} 
                                <div className="flex-grow space-y-1 text-sm w-full md:w-1/2 md:pl-4">
                                     <h3 className="text-base font-medium mb-2 underline">Proposed Changes</h3>
                                     {Object.entries(req.changes).length > 0 ? (
                                         Object.entries(req.changes).map(([key, value]) => (
                                             <p key={key} className="bg-yellow-50 dark:bg-yellow-900/30 px-2 py-1 rounded border border-yellow-200 dark:border-yellow-800">
                                                 <strong>{key}:</strong> <span className="text-yellow-700 dark:text-yellow-300">{value === null ? 'N/A' : (key === 'dateOfBirth' ? formatDate(value as string) : String(value))}</span>
                                             </p>
                                         ))
                                     ) : (
                                         <p className="text-gray-500 dark:text-gray-400 italic">No changes submitted in this request (likely initial submission or error).</p>
                                     )}

                                    {/* Action Buttons */}
                                    <div className="flex flex-col md:items-end space-y-2 mt-4 pt-4 border-t border-gray-300 dark:border-zinc-600">
                                     <AnimatedButton
                                         onClick={() => handleApprove(req.updateRequestId, req.userId.substring(0, 6))}
                                         disabled={actionLoading[req.updateRequestId]}
                                         className="w-full md:w-auto flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-50"
                                     >
                                         <FiUserCheck/> {actionLoading[req.updateRequestId] ? 'Approving...' : 'Approve Changes'}
                                      </AnimatedButton>
                                      {/* Reject Button */}
                                      <AnimatedButton
                                         onClick={() => handleReject(req.updateRequestId, req.userId.substring(0, 6))}
                                         disabled={actionLoading[req.updateRequestId]}
                                         className="w-full md:w-auto flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md disabled:opacity-50"
                                      >
                                         <FiXCircle/> {actionLoading[req.updateRequestId] ? 'Rejecting...' : 'Reject Changes'}
                                     </AnimatedButton>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
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