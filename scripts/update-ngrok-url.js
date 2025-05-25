const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const MAX_RETRIES = 5;
const RETRY_DELAY = 3000; // 3 seconds
const envPath = path.join(__dirname, '..', '.env.local');

async function updateNgrokUrl() {
  let retries = 0;
  
  while (retries < MAX_RETRIES) {
    try {
      console.log(`Attempt ${retries + 1} to get ngrok URL...`);
      
      // Get ngrok URL using the API
      const apiUrl = 'http://127.0.0.1:4040/api/tunnels';
      const tunnels = JSON.parse(execSync(`curl -s ${apiUrl}`, { stdio: 'pipe' }).toString()).tunnels;
      
      if (!tunnels || tunnels.length === 0) {
        throw new Error('No active tunnels found');
      }
      
      const httpsTunnel = tunnels.find(t => t.proto === 'https');
      if (!httpsTunnel) {
        throw new Error('No HTTPS tunnel found');
      }
      
      const ngrokUrl = httpsTunnel.public_url;
      console.log('Found ngrok URL:', ngrokUrl);
      
      // Update .env.local
      let envContent = fs.readFileSync(envPath, 'utf8');
      
      // Update or add NEXT_PUBLIC_BASE_URL
      if (envContent.includes('NEXT_PUBLIC_BASE_URL=')) {
        envContent = envContent.replace(
          /NEXT_PUBLIC_BASE_URL=.*/,
          `NEXT_PUBLIC_BASE_URL=${ngrokUrl}`
        );
      } else {
        envContent += `\nNEXT_PUBLIC_BASE_URL=${ngrokUrl}\n`;
      }
      
      fs.writeFileSync(envPath, envContent);
      console.log('✅ Successfully updated .env.local with ngrok URL');
      return;
      
    } catch (error) {
      console.log(`Attempt ${retries + 1} failed: ${error.message}`);
      retries++;
      if (retries < MAX_RETRIES) {
        console.log(`Retrying in ${RETRY_DELAY/1000} seconds...`);
        await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      } else {
        console.error('❌ Max retries reached. Could not get ngrok URL.');
        console.log('\nTroubleshooting tips:');
        console.log('1. Make sure ngrok is installed and authenticated');
        console.log('2. Check if another ngrok process is already running');
        console.log('3. Try running ngrok manually first: npx ngrok http 3000');
        process.exit(1);
      }
    }
  }
}

updateNgrokUrl().catch(error => {
  console.error('❌ Error in updateNgrokUrl:', error.message);
  process.exit(1);
});
