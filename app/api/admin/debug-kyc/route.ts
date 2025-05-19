import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import prisma from '@/lib/db';

// Debug endpoint - skips authentication for diagnostic purposes
// IMPORTANT: Remove or secure this endpoint when finished debugging
export async function GET(request: NextRequest) {
  try {
    // Check database connection
    const dbStatus = await prisma.$queryRaw`SELECT 1 as connected`;
    
    // Count all tables
    const kycCount = await prisma.kycUpdateRequest.count();
    const usersCount = await prisma.user.count();
    
    // Get one test kyc request
    const sampleKycRequest = await prisma.kycUpdateRequest.findFirst({
      select: {
        id: true,
        userId: true,
        status: true,
        changes: true,
        createdAt: true
      }
    });
    
    // Check if KYC table exists
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = 'kyc_update_requests'
      ) as "exists"`;
    
    // Check table structure
    const tableColumns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'kyc_update_requests'`;
    
    return NextResponse.json({
      dbStatus,
      tableExists,
      tableColumns,
      counts: {
        kycRequests: kycCount,
        users: usersCount
      },
      sampleRequest: sampleKycRequest,
      message: 'Database debug information'
    }, { status: 200 });
  } catch (error) {
    console.error("Database Debug Error:", error);
    return NextResponse.json({ 
      message: 'Error checking database', 
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
} 