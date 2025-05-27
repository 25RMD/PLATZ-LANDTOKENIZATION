import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    console.log(`[SCHEMA_CHECK] Checking nft_bids table schema...`);

    // Query the information schema to see what columns exist in nft_bids table
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns 
      WHERE table_name = 'nft_bids' 
      ORDER BY column_name;
    `;

    console.log(`[SCHEMA_CHECK] nft_bids columns:`, columns);

    return NextResponse.json({
      success: true,
      table: 'nft_bids',
      columns
    });

  } catch (error) {
    console.error('[SCHEMA_CHECK] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await prisma.$disconnect();
  }
} 