import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Types
export interface SmartContractExecutionResult {
  success: boolean;
  transactionHash?: string;
  error?: string;
  data?: any;
}

/**
 * Execute a smart contract for shipment tracking
 */
export const executeShipmentTrackingContract = async (
  shipmentId: string,
  status: string,
  location: { lat: number; lng: number }
): Promise<SmartContractExecutionResult> => {
  try {
    // Call blockchain-verify edge function
    const { data, error } = await supabase.functions.invoke('blockchain-verify', {
      body: {
        operation: 'track_shipment',
        shipmentData: {
          shipmentId,
          status,
          location,
          timestamp: new Date().toISOString()
        }
      }
    });

    if (error) throw error;

    // Record the event in the database
    // Note: Using 'from' with a direct table name rather than through a relation
    await supabase
      .from('shipments')
      .update({ 
        status, 
        blockchain_tx_hash: data.transactionHash 
      })
      .eq('id', shipmentId);

    toast.success('Shipment status updated on blockchain');
    
    return {
      success: true,
      transactionHash: data.transactionHash,
      data: data.result
    };
  } catch (error) {
    console.error('Error executing shipment tracking contract:', error);
    toast.error('Failed to update shipment status on blockchain');
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Execute a smart contract for transfer of ownership
 */
export const executeTransferOwnershipContract = async (
  shipmentId: string,
  fromUserId: string,
  toUserId: string
): Promise<SmartContractExecutionResult> => {
  try {
    // Call blockchain-verify edge function
    const { data, error } = await supabase.functions.invoke('blockchain-verify', {
      body: {
        operation: 'transfer_ownership',
        transferData: {
          shipmentId,
          fromUserId,
          toUserId,
          timestamp: new Date().toISOString()
        }
      }
    });

    if (error) throw error;

    // Record the ownership transfer event
    // Store this in the shipments table directly or another related table
    await supabase
      .from('shipments')
      .update({ 
        customer_id: toUserId,
        blockchain_tx_hash: data.transactionHash 
      })
      .eq('id', shipmentId);

    toast.success('Ownership transfer recorded on blockchain');
    
    return {
      success: true,
      transactionHash: data.transactionHash,
      data: data.result
    };
  } catch (error) {
    console.error('Error executing ownership transfer contract:', error);
    toast.error('Failed to transfer ownership on blockchain');
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Execute a smart contract for product verification
 */
export const executeProductVerificationContract = async (
  shipmentId: string,
  verificationData: {
    temperature: number;
    humidity: number;
    isIntact: boolean;
  }
): Promise<SmartContractExecutionResult> => {
  try {
    // Call blockchain-verify edge function
    const { data, error } = await supabase.functions.invoke('blockchain-verify', {
      body: {
        operation: 'verify_product',
        verificationData: {
          shipmentId,
          ...verificationData,
          timestamp: new Date().toISOString()
        }
      }
    });

    if (error) throw error;

    // Record the sensor data
    await supabase
      .from('sensor_data')
      .insert({
        shipment_id: shipmentId,
        temperature: verificationData.temperature,
        humidity: verificationData.humidity,
        shock_detected: !verificationData.isIntact,
        blockchain_tx_hash: data.transactionHash
      });

    toast.success('Product verification recorded on blockchain');
    
    return {
      success: true,
      transactionHash: data.transactionHash,
      data: data.result
    };
  } catch (error) {
    console.error('Error executing product verification contract:', error);
    toast.error('Failed to verify product on blockchain');
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Execute a smart contract for payment settlement
 */
export const executePaymentSettlementContract = async (
  shipmentId: string,
  amount: number,
  currency: string = 'USD'
): Promise<SmartContractExecutionResult> => {
  try {
    // Call blockchain-verify edge function
    const { data, error } = await supabase.functions.invoke('blockchain-verify', {
      body: {
        operation: 'settle_payment',
        paymentData: {
          shipmentId,
          amount,
          currency,
          timestamp: new Date().toISOString()
        }
      }
    });

    if (error) throw error;

    // Record the payment settlement
    // This would typically go into a payments table, but for now we'll update the shipment
    await supabase
      .from('shipments')
      .update({ 
        blockchain_tx_hash: data.transactionHash 
      })
      .eq('id', shipmentId);

    toast.success(`Payment of ${amount} ${currency} settled on blockchain`);
    
    return {
      success: true,
      transactionHash: data.transactionHash,
      data: data.result
    };
  } catch (error) {
    console.error('Error executing payment settlement contract:', error);
    toast.error('Failed to settle payment on blockchain');
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Execute a smart contract for carbon credits
 */
export const executeCarbonCreditsContract = async (
  shipmentId: string,
  carbonSaved: number
): Promise<SmartContractExecutionResult> => {
  try {
    // Call blockchain-verify edge function
    const { data, error } = await supabase.functions.invoke('blockchain-verify', {
      body: {
        operation: 'carbon_credits',
        carbonData: {
          shipmentId,
          carbonSaved,
          timestamp: new Date().toISOString()
        }
      }
    });

    if (error) throw error;

    // Record the carbon credits issuance
    await supabase
      .from('shipments')
      .update({ 
        blockchain_tx_hash: data.transactionHash 
      })
      .eq('id', shipmentId);

    toast.success(`${data.tokens} carbon credits issued on blockchain`);
    
    return {
      success: true,
      transactionHash: data.transactionHash,
      data: {
        tokens: data.tokens
      }
    };
  } catch (error) {
    console.error('Error executing carbon credits contract:', error);
    toast.error('Failed to issue carbon credits on blockchain');
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Execute a smart contract for customs clearance
 */
export const executeCustomsClearance = async (
  shipmentId: string,
  customsData: {
    countryCode: string;
    declarationId: string;
    clearanceDate: Date;
  }
): Promise<SmartContractExecutionResult> => {
  try {
    // Call blockchain-verify edge function
    const { data, error } = await supabase.functions.invoke('blockchain-verify', {
      body: {
        operation: 'customs_clearance',
        customsData: {
          shipmentId,
          ...customsData,
          clearanceDate: customsData.clearanceDate.toISOString(),
          timestamp: new Date().toISOString()
        }
      }
    });

    if (error) throw error;

    // Record the customs clearance
    await supabase
      .from('shipments')
      .update({ 
        customs_status: 'cleared',
        blockchain_tx_hash: data.transactionHash 
      })
      .eq('id', shipmentId);

    toast.success('Customs clearance recorded on blockchain');
    
    return {
      success: true,
      transactionHash: data.transactionHash,
      data: data.result
    };
  } catch (error) {
    console.error('Error executing customs clearance contract:', error);
    toast.error('Failed to record customs clearance on blockchain');
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Execute a smart contract for payment release
 */
export const executePaymentRelease = async (
  shipmentId: string,
  paymentData: {
    amount: number;
    currency: string;
    recipientId: string;
  }
): Promise<SmartContractExecutionResult> => {
  try {
    // Call blockchain-verify edge function
    const { data, error } = await supabase.functions.invoke('blockchain-verify', {
      body: {
        operation: 'release_payment',
        paymentData: {
          shipmentId,
          ...paymentData,
          timestamp: new Date().toISOString()
        }
      }
    });

    if (error) throw error;

    // Record the payment release
    await supabase
      .from('shipments')
      .update({ 
        payment_status: 'paid',
        blockchain_tx_hash: data.transactionHash 
      })
      .eq('id', shipmentId);

    toast.success(`Payment of ${paymentData.amount} ${paymentData.currency} released on blockchain`);
    
    return {
      success: true,
      transactionHash: data.transactionHash,
      data: data.result
    };
  } catch (error) {
    console.error('Error executing payment release contract:', error);
    toast.error('Failed to release payment on blockchain');
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

/**
 * Create a dispute resolution smart contract
 */
export const createDisputeResolution = async (
  shipmentId: string,
  disputeData: {
    reason: string;
    claimantId: string;
    respondentId: string;
    evidenceHashes: string[];
  }
): Promise<SmartContractExecutionResult> => {
  try {
    // Call blockchain-verify edge function
    const { data, error } = await supabase.functions.invoke('blockchain-verify', {
      body: {
        operation: 'create_dispute',
        disputeData: {
          shipmentId,
          ...disputeData,
          timestamp: new Date().toISOString()
        }
      }
    });

    if (error) throw error;

    // Record the dispute creation
    await supabase
      .from('disputes')
      .insert({
        shipment_id: shipmentId,
        reason: disputeData.reason,
        claimant_id: disputeData.claimantId,
        respondent_id: disputeData.respondentId,
        evidence_hashes: disputeData.evidenceHashes,
        status: 'open',
        blockchain_tx_hash: data.transactionHash
      });

    toast.success('Dispute resolution contract created on blockchain');
    
    return {
      success: true,
      transactionHash: data.transactionHash,
      data: data.result
    };
  } catch (error) {
    console.error('Error creating dispute resolution contract:', error);
    toast.error('Failed to create dispute resolution on blockchain');
    
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
