// Test script for the debug API endpoint
const { default: fetch } = await import('node-fetch');

async function testDebugApi() {
  try {
    console.log('Testing debug API endpoint...');
    const response = await fetch('http://localhost:3000/api/admin/debug-kyc');
    
    if (!response.ok) {
      console.error(`API request failed with status ${response.status}`);
      const errorData = await response.json();
      console.error('Error:', errorData);
      return;
    }
    
    const data = await response.json();
    console.log('Debug API response:', JSON.stringify(data, null, 2));
    
    // Check specific elements
    if (data.counts && data.counts.kycRequests > 0) {
      console.log(`Found ${data.counts.kycRequests} KYC requests in the database`);
      console.log('Sample KYC request:');
      console.log(JSON.stringify(data.sampleRequest, null, 2));
    } else {
      console.log('No KYC requests found in the database');
    }
    
    console.log('\nDatabase table information:');
    console.log(JSON.stringify(data.tableColumns, null, 2));
    
  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

testDebugApi(); 