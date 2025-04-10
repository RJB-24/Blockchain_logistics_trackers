
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useBlockchain } from '@/hooks/blockchain';
import { Transaction } from '@/services/blockchain/types';
import { FileText, CheckCircle, Clock, AlertTriangle, ExternalLink } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

interface TransactionViewerProps {
  transactionHash: string;
  showDetails?: boolean;
}

export const TransactionViewer: React.FC<TransactionViewerProps> = ({ 
  transactionHash, 
  showDetails = true 
}) => {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const { verifyBlockchainRecord } = useBlockchain();

  useEffect(() => {
    const fetchTransaction = async () => {
      if (!transactionHash) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        const result = await verifyBlockchainRecord(transactionHash);
        
        if (result) {
          setTransaction({
            hash: transactionHash,
            blockNumber: result.blockNumber,
            from: result.from,
            to: result.to,
            data: '',
            timestamp: new Date(result.timestamp).getTime(),
            status: result.status === 'success' ? 'confirmed' : 'failed'
          });
        } else {
          toast.error('Failed to verify transaction');
        }
      } catch (error) {
        console.error('Error fetching transaction:', error);
        toast.error('Error verifying blockchain transaction');
      } finally {
        setLoading(false);
      }
    };

    fetchTransaction();
  }, [transactionHash, verifyBlockchainRecord]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" /> Verified</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      case 'failed':
        return <Badge className="bg-red-500"><AlertTriangle className="h-3 w-3 mr-1" /> Failed</Badge>;
      default:
        return <Badge className="bg-gray-500">Unknown</Badge>;
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const getTimestampText = (timestamp: number) => {
    if (!timestamp) return 'Unknown time';
    return `${formatDistanceToNow(timestamp)} ago`;
  };

  if (!showDetails) {
    return (
      <div className="flex items-center space-x-2 text-sm text-muted-foreground">
        <FileText className="h-4 w-4" />
        <span className="font-mono">{formatAddress(transactionHash)}</span>
        {transaction && getStatusBadge(transaction.status)}
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle className="text-md font-medium flex items-center">
          <FileText className="h-5 w-5 mr-2 text-eco-purple" />
          Blockchain Verification
        </CardTitle>
        <CardDescription>
          Transaction details and verification status
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-2">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin h-6 w-6 border-2 border-eco-purple border-t-transparent rounded-full"></div>
          </div>
        ) : transaction ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Status:</span>
              {getStatusBadge(transaction.status)}
            </div>
            
            <div>
              <span className="text-sm font-medium">Transaction Hash:</span>
              <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                {transaction.hash}
              </div>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm font-medium">Block Number:</span>
              <span className="font-mono">{transaction.blockNumber}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-sm font-medium">Timestamp:</span>
              <span>{getTimestampText(transaction.timestamp)}</span>
            </div>
            
            {expanded && (
              <>
                <Separator />
                
                <div>
                  <span className="text-sm font-medium">From:</span>
                  <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1">
                    {transaction.from}
                  </div>
                </div>
                
                <div>
                  <span className="text-sm font-medium">To:</span>
                  <div className="font-mono text-xs bg-gray-100 p-2 rounded mt-1">
                    {transaction.to}
                  </div>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="py-4 text-center text-muted-foreground">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>Transaction not found or not yet confirmed</p>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2">
        {transaction && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Show Less' : 'Show More'}
          </Button>
        )}
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-eco-purple"
          disabled={!transaction}
          onClick={() => {
            // In a real implementation, this would link to a blockchain explorer
            toast.info('Blockchain explorer would open here');
          }}
        >
          <ExternalLink className="h-4 w-4 mr-1" />
          View in Explorer
        </Button>
      </CardFooter>
    </Card>
  );
};

export default TransactionViewer;
