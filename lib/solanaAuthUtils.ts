import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

// Function to create the message the user needs to sign
export const createSignInMessage = (nonce: string): string => {
   // IMPORTANT: Customize this message. Make it clear what the user is signing.
   // Include the domain to prevent phishing across different sites.
   // Consider adding more context if needed.
   const domain = process.env.NEXT_PUBLIC_APP_DOMAIN || 'localhost'; // Get domain from env
   // Ensure you set NEXT_PUBLIC_APP_DOMAIN in your .env.local
   return `Please sign this message to verify your identity for ${domain}.\n\nNonce: ${nonce}`;
};


// Function to verify the signature on the backend
export const verifySolanaSignature = (
   publicKeyBase58: string,
   message: string, // The *exact* message constructed with createSignInMessage(nonce)
   signature: Uint8Array | string // Accept buffer or base58 string signature
): boolean => {
   try {
       const publicKeyBytes = new PublicKey(publicKeyBase58).toBytes();
       const messageBytes = new TextEncoder().encode(message);

       // Decode signature if it's a base58 string
       const signatureBytes = typeof signature === 'string' ? bs58.decode(signature) : signature;

       if (signatureBytes.length !== 64) {
           console.error("Solana signature verification failed: Invalid signature length.");
           return false;
       }

       // Verify using nacl (TweetNaCl.js)
       const result = nacl.sign.detached.verify(messageBytes, signatureBytes, publicKeyBytes);
       return result;
   } catch (error) {
       console.error("Solana signature verification failed:", error);
       return false;
   }
}; 