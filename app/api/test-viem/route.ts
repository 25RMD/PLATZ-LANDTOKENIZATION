import { NextRequest, NextResponse } from 'next/server';
import { testViemConnection } from '@/lib/ethereum/test-viem';

/**
 * GET /api/test-viem
 * 
 * Test endpoint to verify Viem integration works correctly
 * 
 * Response:
 * {
 *   success: boolean,
 *   blockNumber?: bigint,
 *   blockHash?: string,
 *   timestamp?: string,
 *   transactionCount?: number,
 *   error?: string
 * }
 */
export async function GET(request: NextRequest) {
  console.log("API GET /api/test-viem: Starting test...");
  
  try {
    // Test the Viem connection
    const result = await testViemConnection();
    
    // Convert BigInt values to strings for JSON serialization
    const serializedResult = JSON.parse(JSON.stringify(result, (key, value) => {
      // Convert BigInt to string during serialization
      if (typeof value === 'bigint') {
        return value.toString();
      }
      return value;
    }));
    
    // Return the serialized test result
    return NextResponse.json(serializedResult);
  } catch (error) {
    console.error('Error testing Viem connection:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'An error occurred while testing Viem connection', 
        error: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
