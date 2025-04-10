
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useBlockchain } from '@/hooks/blockchain';
import { toast } from 'sonner';
import { FileJson, CheckCircle2, Truck, CreditCard, FileCheck, ShieldCheck } from 'lucide-react';

interface SmartContractOperationsProps {
  shipmentId: string;
  onContractExecuted?: (contractType: string, txHash: string) => void;
}

export const SmartContractOperations: React.FC<SmartContractOperationsProps> = ({ 
  shipmentId,
  onContractExecuted 
}) => {
  const [selectedContract, setSelectedContract] = useState<string>('delivery');
  const [loading, setLoading] = useState(false);
  const { executeSmartContract, processPayment, processClearance, confirmDelivery } = useBlockchain();

  // Form states for different contract types
  const [paymentDetails, setPaymentDetails] = useState({
    amount: '',
    currency: 'USD'
  });
  
  const [customsDetails, setCustomsDetails] = useState({
    countryCode: '',
    documentHash: ''
  });
  
  const [deliveryDetails, setDeliveryDetails] = useState({
    recipientSignature: '',
    deliveryNotes: ''
  });

  const handleExecuteContract = async () => {
    if (!shipmentId) {
      toast.error('Shipment ID is required');
      return;
    }

    setLoading(true);
    try {
      let result;

      switch (selectedContract) {
        case 'payment':
          if (!paymentDetails.amount) {
            toast.error('Payment amount is required');
            setLoading(false);
            return;
          }

          result = await processPayment(
            shipmentId, 
            Number(paymentDetails.amount), 
            paymentDetails.currency
          );
          break;

        case 'customs':
          if (!customsDetails.countryCode || !customsDetails.documentHash) {
            toast.error('Country code and document hash are required');
            setLoading(false);
            return;
          }

          result = await processClearance(
            shipmentId, 
            customsDetails.countryCode, 
            [customsDetails.documentHash]
          );
          break;

        case 'delivery':
          if (!deliveryDetails.recipientSignature) {
            toast.error('Recipient signature is required');
            setLoading(false);
            return;
          }

          result = await confirmDelivery(
            shipmentId, 
            deliveryDetails.recipientSignature, 
            deliveryDetails.deliveryNotes
          );
          break;

        default:
          toast.error('Invalid contract type');
          setLoading(false);
          return;
      }

      if (result && result.success && onContractExecuted) {
        onContractExecuted(selectedContract, result.transactionHash || '');
      }

    } catch (error) {
      console.error('Error executing contract:', error);
      toast.error('Failed to execute smart contract');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileJson className="h-5 w-5 mr-2 text-eco-purple" />
          Smart Contract Operations
        </CardTitle>
        <CardDescription>
          Execute blockchain smart contracts for this shipment
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="contract-type">Contract Type</Label>
          <Select 
            value={selectedContract} 
            onValueChange={setSelectedContract}
          >
            <SelectTrigger id="contract-type">
              <SelectValue placeholder="Select contract type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="delivery">
                <div className="flex items-center">
                  <Truck className="h-4 w-4 mr-2" />
                  Delivery Confirmation
                </div>
              </SelectItem>
              <SelectItem value="payment">
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Payment Release
                </div>
              </SelectItem>
              <SelectItem value="customs">
                <div className="flex items-center">
                  <FileCheck className="h-4 w-4 mr-2" />
                  Customs Clearance
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {selectedContract === 'payment' && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="payment-amount">Payment Amount</Label>
              <Input
                id="payment-amount"
                type="number"
                placeholder="Enter amount"
                value={paymentDetails.amount}
                onChange={(e) => setPaymentDetails(prev => ({ ...prev, amount: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="payment-currency">Currency</Label>
              <Select 
                value={paymentDetails.currency} 
                onValueChange={(value) => setPaymentDetails(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger id="payment-currency">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD - US Dollar</SelectItem>
                  <SelectItem value="EUR">EUR - Euro</SelectItem>
                  <SelectItem value="GBP">GBP - British Pound</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}

        {selectedContract === 'customs' && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="country-code">Country Code</Label>
              <Select 
                value={customsDetails.countryCode} 
                onValueChange={(value) => setCustomsDetails(prev => ({ ...prev, countryCode: value }))}
              >
                <SelectTrigger id="country-code">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="US">United States</SelectItem>
                  <SelectItem value="CN">China</SelectItem>
                  <SelectItem value="DE">Germany</SelectItem>
                  <SelectItem value="UK">United Kingdom</SelectItem>
                  <SelectItem value="FR">France</SelectItem>
                  <SelectItem value="JP">Japan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="document-hash">Document Hash</Label>
              <Input
                id="document-hash"
                placeholder="Enter document hash"
                value={customsDetails.documentHash}
                onChange={(e) => setCustomsDetails(prev => ({ ...prev, documentHash: e.target.value }))}
              />
            </div>
          </div>
        )}

        {selectedContract === 'delivery' && (
          <div className="space-y-3">
            <div>
              <Label htmlFor="recipient-signature">Recipient Signature</Label>
              <Input
                id="recipient-signature"
                placeholder="Enter recipient name or signature code"
                value={deliveryDetails.recipientSignature}
                onChange={(e) => setDeliveryDetails(prev => ({ ...prev, recipientSignature: e.target.value }))}
              />
            </div>
            
            <div>
              <Label htmlFor="delivery-notes">Delivery Notes</Label>
              <Textarea
                id="delivery-notes"
                placeholder="Enter any notes about the delivery"
                value={deliveryDetails.deliveryNotes}
                onChange={(e) => setDeliveryDetails(prev => ({ ...prev, deliveryNotes: e.target.value }))}
                rows={3}
              />
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          className="w-full bg-eco-purple hover:bg-eco-purple/90"
          onClick={handleExecuteContract}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full"></div>
              Processing...
            </>
          ) : (
            <>
              <ShieldCheck className="h-4 w-4 mr-2" />
              Execute Smart Contract
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SmartContractOperations;
