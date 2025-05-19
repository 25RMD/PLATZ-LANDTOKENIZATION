const axios = require('axios');
const fs = require('fs');
const path = require('path');

// --- Configuration ---
// Path to your .env.local file (or .env, etc.)
const envFilePath = path.resolve(__dirname, '..', '.env.local');
// The ngrok local API URL
const NGROK_API_URL = 'http://localhost:4040/api/tunnels';
// The name of the environment variable to update
const ENV_VAR_NAME = 'NEXT_PUBLIC_BASE_URL';
// The local port your application runs on (that ngrok is tunneling)
const APP_PORT = 3000; 
// -------------------

async function updateNgrokUrlInEnv() {
  console.log(`Attempting to update ${ENV_VAR_NAME} in ${envFilePath}...`);

  try {
    // 1. Fetch ngrok tunnels information
    const response = await axios.get(NGROK_API_URL);
    const tunnels = response.data.tunnels;

    if (!tunnels || tunnels.length === 0) {
      console.error('\nError: No ngrok tunnels found. Is ngrok running and tunneling your app?');
      process.exit(1);
    }

    // 2. Find the correct HTTPS tunnel for your app
    // We look for an https tunnel that forwards to your APP_PORT
    const httpsTunnel = tunnels.find(tunnel => 
      tunnel.proto === 'https' && 
      tunnel.config.addr.includes(`localhost:${APP_PORT}`)
    );

    let publicUrl;
    if (httpsTunnel) {
      publicUrl = httpsTunnel.public_url;
    } else {
      // Fallback: try to find any https tunnel if specific one not found
      const anyHttpsTunnel = tunnels.find(tunnel => tunnel.proto === 'https');
      if (anyHttpsTunnel) {
        publicUrl = anyHttpsTunnel.public_url;
        console.warn(`Warning: Could not find specific HTTPS tunnel for localhost:${APP_PORT}. Using first available HTTPS tunnel: ${publicUrl}`);
      } else {
        console.error(`\nError: No HTTPS tunnel found for localhost:${APP_PORT} or any HTTPS tunnel.`);
        process.exit(1);
      }
    }

    if (!publicUrl) {
        console.error('\nError: Could not extract public URL from ngrok tunnels.');
        process.exit(1);
    }

    console.log(`Successfully fetched ngrok public URL: ${publicUrl}`);

    // 3. Read the .env.local file content
    let envContent = '';
    if (fs.existsSync(envFilePath)) {
      envContent = fs.readFileSync(envFilePath, 'utf8');
    } else {
      console.log(`Note: ${envFilePath} does not exist. It will be created.`);
    }

    // 4. Update or add the environment variable
    const lines = envContent.split('\n');
    let found = false;
    const newLines = lines.map(line => {
      if (line.startsWith(`${ENV_VAR_NAME}=`)) {
        found = true;
        return `${ENV_VAR_NAME}=${publicUrl}`;
      }
      return line;
    });

    // If the variable was not found, add it to the end (ensuring no duplicate empty lines if file was empty)
    if (!found) {
      if (newLines.length === 1 && newLines[0] === '') { // file was empty or only had a newline
        newLines[0] = `${ENV_VAR_NAME}=${publicUrl}`;
      } else {
        newLines.push(`${ENV_VAR_NAME}=${publicUrl}`);
      }
    }

    // 5. Write the updated content back to the .env.local file
    fs.writeFileSync(envFilePath, newLines.join('\n').trim() + '\n'); // Ensure a single trailing newline
    console.log(`Successfully updated ${ENV_VAR_NAME} to ${publicUrl} in ${envFilePath}`);

  } catch (error) {
    if (error.code === 'ECONNREFUSED') {
      console.error(`\nError: Connection refused. Could not connect to ngrok API at ${NGROK_API_URL}.`);
      console.error('Please ensure ngrok is running and forwarding your application port.');
    } else if (error.isAxiosError && error.response) {
      console.error(`\nError: ngrok API request failed with status ${error.response.status} - ${error.response.statusText}.`);
      console.error('Response data:', error.response.data);
    } else {
      console.error('\nAn unexpected error occurred:');
      console.error(error.message);
    }
    process.exit(1);
  }
}

updateNgrokUrlInEnv();
