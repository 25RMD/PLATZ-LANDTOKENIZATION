// Test script to debug frontend API calls
async function testBidInfoAPI() {
  console.log('Testing bid info API calls...');
  
  const testTokens = [104, 106, 102];
  
  for (const tokenId of testTokens) {
    try {
      console.log(`\n--- Testing Token ${tokenId} ---`);
      
      const response = await fetch(`http://localhost:3000/api/tokens/${tokenId}/bid-info`);
      console.log(`Status: ${response.status} ${response.statusText}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Response data:', JSON.stringify(data, null, 2));
      } else {
        const errorText = await response.text();
        console.log('Error response:', errorText);
      }
    } catch (error) {
      console.error(`Error fetching token ${tokenId}:`, error.message);
    }
  }
}

// Test if we can reach the server
async function testServerConnection() {
  try {
    const response = await fetch('http://localhost:3000/api/tokens/104/bid-info');
    console.log('Server connection test:', response.status);
    return response.ok;
  } catch (error) {
    console.error('Server connection failed:', error.message);
    return false;
  }
}

// Run tests
testServerConnection().then(connected => {
  if (connected) {
    testBidInfoAPI();
  } else {
    console.log('Cannot connect to server. Make sure it\'s running on localhost:3000');
  }
}); 