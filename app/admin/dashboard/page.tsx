"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute'; // Use the general protected route
import LoadingSpinner from '@/components/common/LoadingSpinner';
import AnimatedButton from '@/components/common/AnimatedButton';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiUserCheck, FiXCircle } from 'react-icons/fi';

// Interface for the data expected from /api/admin/kyc-requests
interface KycRequestUser {
    id: string;
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
    createdAt: string;
}

const AdminDashboardContent = () => {
    const { user, isAdmin, isLoading: authLoading } = useAuth();
    const [requests, setRequests] = useState<KycRequestUser[]>([]);
    const [loadingRequests, setLoadingRequests] = useState(true);
    const [actionLoading, setActionLoading] = useState<Record<string, boolean>>({}); // Loading state per user ID
    const router = useRouter();

    // Redirect if not admin (double check)
    useEffect(() => {
        if (!authLoading && !isAdmin) {
            toast.error("Access Denied: Admin privileges required.");
            router.push('/'); // Redirect non-admins away
        }
    }, [authLoading, isAdmin, router]);

    const fetchRequests = useCallback(async () => {
        setLoadingRequests(true);
        try {
            const response = await fetch('/api/admin/kyc-requests');
            if (!response.ok) {
                throw new Error('Failed to fetch KYC requests');
            }
            const data: KycRequestUser[] = await response.json();
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

    const handleVerify = async (userId: string) => {
        setActionLoading(prev => ({ ...prev, [userId]: true }));
        const toastId = toast.loading(`Verifying user ${userId.substring(0, 6)}...`);
        try {
            const response = await fetch('/api/admin/verify-user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });
            if (!response.ok) {
                 const errorData = await response.json().catch(() => ({}));
                 throw new Error(errorData.message || 'Verification failed');
            }
            toast.success(`User ${userId.substring(0, 6)} verified successfully!`, { id: toastId });
            // Refresh the list after verification
            fetchRequests();
        } catch (err: any) {
            toast.error(err.message || 'Failed to verify user.', { id: toastId });
            console.error("Verify User Error:", err);
        } finally {
             setActionLoading(prev => ({ ...prev, [userId]: false }));
        }
    };

    // TODO: Implement handleReject function if needed
    // const handleReject = async (userId: string) => { ... };

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
            <h1 className="text-3xl font-semibold text-text-light dark:text-text-dark mb-6">Admin Dashboard - KYC Verification</h1>

            {requests.length === 0 ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-10">No pending KYC requests found.</p>
            ) : (
                <div className="space-y-6">
                    {requests.map((req) => (
                        <div key={req.id} className="p-4 border border-gray-300 dark:border-zinc-700 rounded-lg bg-secondary-light dark:bg-zinc-800 shadow-md">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                                <div className="flex-grow space-y-2 text-sm">
                                    <p><strong>User ID:</strong> <code className="text-xs bg-gray-200 dark:bg-zinc-700 px-1 py-0.5 rounded">{req.id}</code></p>
                                    <p><strong>Username:</strong> {req.username || 'N/A'}</p>
                                    <p><strong>Email:</strong> {req.email || 'N/A'}</p>
                                    <p><strong>Full Name:</strong> {req.fullName || 'N/A'}</p>
                                    <p><strong>DOB:</strong> {req.dateOfBirth ? new Date(req.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                                    <p><strong>Phone:</strong> {req.phone || 'N/A'}</p>
                                    <p><strong>Address:</strong> {`${req.addressLine1 || ''}${req.addressLine2 ? ', ' + req.addressLine2 : ''}, ${req.city || ''}, ${req.stateProvince || ''} ${req.postalCode || ''}, ${req.country || ''}`}</p>
                                    <p><strong>Gov ID Type:</strong> {req.govIdType || 'N/A'}</p>
                                    <p><strong>Gov ID Ref:</strong> {req.govIdRef || 'N/A'}</p>
                                    <p><strong>SoF Doc Ref:</strong> {req.sofDocRef || 'N/A'}</p>
                                     <p><strong>Submitted:</strong> {new Date(req.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="flex-shrink-0 flex flex-col md:items-end space-y-2 mt-2 md:mt-0">
                                     <AnimatedButton
                                         onClick={() => handleVerify(req.id)}
                                         disabled={actionLoading[req.id]}
                                         className="w-full md:w-auto flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md disabled:opacity-50"
                                     >
                                         <FiUserCheck/> {actionLoading[req.id] ? 'Verifying...' : 'Verify User'}
                                     </AnimatedButton>
                                      {/* Add Reject Button if implementing rejection */}
                                      {/* <AnimatedButton onClick={() => handleReject(req.id)} disabled={actionLoading[req.id]} className="..."><FiXCircle/> Reject</AnimatedButton> */}
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