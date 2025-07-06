import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { getContractAddress } from '@/config/contracts';
import { PlatzLandNFTABI } from '@/contracts/PlatzLandNFTABI';
import { LandMarketplaceABI } from '@/contracts/LandMarketplaceABI';

/**
 * React hook that lets the connected wallet approve the marketplace and list a collection.
 * The caller must supply the collectionId and the mainTokenId that represents the collection.
 *
 * Status flow:
 * - idle
 * - approving
 * - approved
 * - listing
 * - listed
 * - error
 */
export default function useMarketplaceListing() {
  const [status, setStatus] = useState<'idle' | 'approving' | 'approved' | 'listing' | 'listed' | 'error'>('idle');
  const [txHash, setTxHash] = useState<string | undefined>();
  const [error, setError] = useState<string | undefined>();

  const listCollection = useCallback(async (
    {
      collectionId,
      mainTokenId,
      priceEth,
      paymentToken = ethers.ZeroAddress as `0x${string}`,
    }: {
      collectionId: string | number;
      mainTokenId: string | number;
      /** Price in ETH */
      priceEth: string | number;
      /** Address of ERC-20 payment token or 0x0 for native ETH */
      paymentToken?: `0x${string}`;
    },
  ) => {
    try {
      if (!(window as any)?.ethereum) throw new Error('Ethereum wallet not detected');

      // Connect wallet
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();

      // Resolve contract addresses
      const nftAddress = getContractAddress('PLATZ_LAND_NFT');
      const marketplaceAddress = getContractAddress('LAND_MARKETPLACE');

      // 1. Ensure approval
      setStatus('approving');
      const nftContract = new ethers.Contract(nftAddress, PlatzLandNFTABI, signer);
      const approved = await nftContract.getApproved(BigInt(mainTokenId));
      if (approved.toLowerCase() !== marketplaceAddress.toLowerCase()) {
        const approveTx = await nftContract.approve(marketplaceAddress, BigInt(mainTokenId));
        await approveTx.wait();
      }
      setStatus('approved');

      // 2. List collection
      setStatus('listing');
      const marketplace = new ethers.Contract(marketplaceAddress, LandMarketplaceABI, signer);
      const priceWei = ethers.parseEther(priceEth.toString());
      const tx = await marketplace.listCollection(BigInt(collectionId), priceWei, paymentToken);
      setTxHash(tx.hash);
      await tx.wait();
      setStatus('listed');

      // 3. Notify backend so DB reflects listing
      try {
        await fetch('/api/marketplace-listings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ collectionId: collectionId.toString(), transactionHash: tx.hash }),
        });
      } catch (err) {
        console.warn('Failed to notify backend of listing:', err);
      }

      return tx.hash;
    } catch (e: any) {
      console.error('Failed to list collection:', e);
      setError(e.message || 'Unknown error');
      setStatus('error');
      throw e;
    }
  }, []);

  return { listCollection, status, txHash, error };
}
