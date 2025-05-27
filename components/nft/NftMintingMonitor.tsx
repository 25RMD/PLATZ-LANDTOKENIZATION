import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { Loader2, CheckCircle, XCircle, AlertTriangle, RefreshCcw } from 'lucide-react';
import { useToast } from '../ui/use-toast';

interface NftMintingMonitorProps {
  landListingId: string;
  onMintingComplete?: (data: any) => void;
  refreshInterval?: number; // in milliseconds
}

interface MintingStatus {
  status: 'NOT_STARTED' | 'PENDING' | 'COMPLETED' | 'FAILED';
  data?: any;
  error?: string;
}

export function NftMintingMonitor({ 
  landListingId,
  onMintingComplete,
  refreshInterval = 5000 
}: NftMintingMonitorProps) {
  const [status, setStatus] = useState<MintingStatus>({ status: 'NOT_STARTED' });
  const [loading, setLoading] = useState(false);
  const [intervalId, setIntervalId] = useState<number | null>(null);
  const { toast } = useToast();

  // Function to fetch the minting status
  const fetchMintingStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/nft/status?landListingId=${landListingId}`);
      const data = await response.json();
      
      if (data.success) {
        setStatus({
          status: data.status,
          data: data.data
        });
        
        // If minting is complete, clear the interval and call the callback
        if (data.status === 'COMPLETED') {
          if (intervalId) {
            clearInterval(intervalId);
            setIntervalId(null);
          }
          if (onMintingComplete) {
            onMintingComplete(data.data);
          }
          toast({
            title: "NFT Minting Complete",
            description: "Your NFT has been successfully minted!",
            variant: "default",
          });
        }
        
        // If minting failed, clear the interval
        if (data.status === 'FAILED') {
          if (intervalId) {
            clearInterval(intervalId);
            setIntervalId(null);
          }
          toast({
            title: "NFT Minting Failed",
            description: data.data?.mintErrorReason || "Failed to mint the NFT.",
            variant: "destructive",
          });
        }
      } else {
        setStatus({
          status: 'FAILED',
          error: data.error || 'Failed to fetch minting status'
        });
      }
    } catch (error) {
      console.error('Error fetching minting status:', error);
      setStatus({
        status: 'FAILED',
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Function to reset the minting status
  const resetMintingStatus = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/nft/status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ landListingId })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStatus({ status: 'NOT_STARTED' });
        toast({
          title: "Status Reset",
          description: "Minting status has been reset successfully.",
          variant: "default",
        });
      } else {
        toast({
          title: "Reset Failed",
          description: data.message || "Failed to reset minting status.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error resetting minting status:', error);
      toast({
        title: "Reset Failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Start monitoring when the component mounts
  useEffect(() => {
    fetchMintingStatus();
    
    // Set up polling interval if status is PENDING
    if (status.status === 'PENDING' && !intervalId) {
      const id = setInterval(fetchMintingStatus, refreshInterval);
      setIntervalId(id);
    }
    
    // Clean up interval when component unmounts
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [landListingId, status.status, intervalId]);

  // Render the appropriate UI based on the minting status
  const renderStatusContent = () => {
    switch (status.status) {
      case 'NOT_STARTED':
        return (
          <Alert className="bg-slate-50">
            <AlertTitle className="flex items-center">
              <AlertTriangle className="h-4 w-4 mr-2 text-yellow-500" />
              NFT Minting Not Started
            </AlertTitle>
            <AlertDescription>
              The NFT minting process hasn't started yet. Please start the minting process.
            </AlertDescription>
          </Alert>
        );
      
      case 'PENDING':
        return (
          <Alert className="bg-blue-50">
            <AlertTitle className="flex items-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin text-blue-500" />
              NFT Minting in Progress
            </AlertTitle>
            <AlertDescription>
              Your NFT is being minted on the blockchain. This process may take a few minutes.
              {status.data?.mintTimestamp && (
                <div className="text-xs mt-2">
                  Started: {new Date(status.data.mintTimestamp).toLocaleString()}
                </div>
              )}
            </AlertDescription>
          </Alert>
        );
      
      case 'COMPLETED':
        return (
          <Alert className="bg-green-50">
            <AlertTitle className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
              NFT Minting Complete
            </AlertTitle>
            <AlertDescription>
              Your NFT has been successfully minted!
              
              {status.data && (
                <div className="mt-2 space-y-1 text-xs">
                  {status.data.mintTransactionHash && (
                    <div>
                      Transaction: 
                      <a 
                        href={`https://sepolia.etherscan.io/tx/${status.data.mintTransactionHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-1 text-blue-500 hover:underline"
                      >
                        View on Etherscan
                      </a>
                    </div>
                  )}
                  {status.data.collectionId && (
                    <div>Collection ID: {status.data.collectionId}</div>
                  )}
                  {status.data.mainTokenId && (
                    <div>Token ID: {status.data.mainTokenId}</div>
                  )}
                </div>
              )}
            </AlertDescription>
          </Alert>
        );
      
      case 'FAILED':
        return (
          <Alert className="bg-red-50">
            <AlertTitle className="flex items-center">
              <XCircle className="h-4 w-4 mr-2 text-red-500" />
              NFT Minting Failed
            </AlertTitle>
            <AlertDescription>
              {status.data?.mintErrorReason || status.error || "Failed to mint the NFT. Please try again."}
              
              <Button 
                variant="secondary"
                size="sm"
                className="mt-2"
                onClick={resetMintingStatus}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    <RefreshCcw className="h-4 w-4 mr-2" />
                    Reset Status
                  </>
                )}
              </Button>
            </AlertDescription>
          </Alert>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {renderStatusContent()}
      
      <div className="flex justify-end">
        <Button
          variant="secondary"
          size="sm"
          onClick={fetchMintingStatus}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Checking...
            </>
          ) : (
            <>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Refresh Status
            </>
          )}
        </Button>
      </div>
    </div>
  );
} 