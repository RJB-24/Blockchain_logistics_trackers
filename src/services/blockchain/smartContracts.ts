
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ShipmentRecord, Transaction } from './types';

// Execute customs clearance smart contract
export const executeCustomsClearance = async (
  shipmentId: string,
  countryCode: string,
  documentHashes: string[]
): Promise<{ success: boolean; transactionHash?: string; message?: string }> => {
  try {
    // Call the blockchain verification edge function
    const { data, error } = await supabase.functions.invoke('blockchain-verify', {
      body: {
        operation: 'execute-contract',
        contractType: 'customs',
        payload: {
          shipmentId,
          countryCode,
          documentHashes,
          timestamp: new Date().toISOString()
        }
      }
    });

    if (error) throw error;

    if (!data.success) {
      throw new Error(data.message || 'Customs clearance contract execution failed');
    }

    // Record the contract execution in the database
    await supabase.from('shipment_events').insert({
      shipment_id: shipmentId,
      event_type: 'customs_cleared',
      data: {
        countryCode,
        documentHashes,
        contractAddress: data.contractAddress,
        transactionHash: data.transactionHash
      },
      blockchain_tx_hash: data.transactionHash
    });

    // Update the shipment status
    await supabase.from('shipments').update({
      status: 'customs_cleared',
      updated_at: new Date().toISOString()
    }).eq('id', shipmentId);

    toast.success('Customs clearance completed and verified on blockchain');
    return {
      success: true,
      transactionHash: data.transactionHash
    };
  } catch (error) {
    console.error('Error executing customs clearance:', error);
    toast.error('Failed to execute customs clearance');
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Execute payment release smart contract
export const executePaymentRelease = async (
  shipmentId: string,
  amount: number,
  currency: string = 'USD'
): Promise<{ success: boolean; transactionHash?: string; message?: string }> => {
  try {
    // Call the blockchain verification edge function
    const { data, error } = await supabase.functions.invoke('blockchain-verify', {
      body: {
        operation: 'execute-contract',
        contractType: 'payment',
        payload: {
          shipmentId,
          amount,
          currency,
          releaseTime: new Date().toISOString()
        }
      }
    });

    if (error) throw error;

    if (!data.success) {
      throw new Error(data.message || 'Payment release contract execution failed');
    }

    // Record the payment in the database
    await supabase.from('shipment_events').insert({
      shipment_id: shipmentId,
      event_type: 'payment_released',
      data: {
        amount,
        currency,
        contractAddress: data.contractAddress,
        transactionHash: data.transactionHash
      },
      blockchain_tx_hash: data.transactionHash
    });

    toast.success('Payment released and verified on blockchain');
    return {
      success: true,
      transactionHash: data.transactionHash
    };
  } catch (error) {
    console.error('Error executing payment release:', error);
    toast.error('Failed to release payment');
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Create a dispute resolution smart contract
export const createDisputeResolution = async (
  shipmentId: string,
  description: string,
  claimAmount: number,
  evidence: string[]
): Promise<{ success: boolean; transactionHash?: string; message?: string }> => {
  try {
    // Call the blockchain verification edge function
    const { data, error } = await supabase.functions.invoke('blockchain-verify', {
      body: {
        operation: 'resolve-dispute',
        shipmentId,
        disputeDetails: {
          description,
          claimAmount,
          evidence,
          filedAt: new Date().toISOString()
        }
      }
    });

    if (error) throw error;

    if (!data.resolved) {
      // Even if not immediately resolved, record the dispute
      await supabase.from('shipment_events').insert({
        shipment_id: shipmentId,
        event_type: 'dispute_filed',
        data: {
          description,
          claimAmount,
          evidence,
          resolution: data.resolution
        }
      });

      toast.info('Dispute filed for review. You will be notified of the resolution.');
      return {
        success: true,
        message: data.resolution
      };
    }

    // If resolved, update the shipment status
    await supabase.from('shipments').update({
      status: 'dispute_resolved',
      updated_at: new Date().toISOString()
    }).eq('id', shipmentId);

    // Record the resolution in the database
    await supabase.from('shipment_events').insert({
      shipment_id: shipmentId,
      event_type: 'dispute_resolved',
      data: {
        description,
        claimAmount,
        evidence,
        resolution: data.resolution
      }
    });

    toast.success('Dispute resolved: ' + data.resolution);
    return {
      success: true,
      message: data.resolution
    };
  } catch (error) {
    console.error('Error creating dispute resolution:', error);
    toast.error('Failed to create dispute resolution');
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Execute delivery confirmation with smart contract
export const executeDeliveryConfirmation = async (
  shipmentId: string,
  recipientSignature: string,
  deliveryNotes: string
): Promise<{ success: boolean; transactionHash?: string; message?: string }> => {
  try {
    // Call the blockchain verification edge function
    const { data, error } = await supabase.functions.invoke('blockchain-verify', {
      body: {
        operation: 'execute-contract',
        contractType: 'delivery',
        payload: {
          shipmentId,
          recipientSignature,
          deliveryNotes,
          deliveryTime: new Date().toISOString()
        }
      }
    });

    if (error) throw error;

    if (!data.success) {
      throw new Error(data.message || 'Delivery confirmation contract execution failed');
    }

    // Update the shipment status
    await supabase.from('shipments').update({
      status: 'delivered',
      actual_arrival_date: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).eq('id', shipmentId);

    // Record the delivery in the database
    await supabase.from('shipment_events').insert({
      shipment_id: shipmentId,
      event_type: 'delivered',
      data: {
        recipientSignature,
        deliveryNotes,
        contractAddress: data.contractAddress,
        transactionHash: data.transactionHash
      },
      blockchain_tx_hash: data.transactionHash
    });

    toast.success('Delivery confirmed and verified on blockchain');
    return {
      success: true,
      transactionHash: data.transactionHash
    };
  } catch (error) {
    console.error('Error confirming delivery:', error);
    toast.error('Failed to confirm delivery');
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Execute carbon credit token issuance
export const executeCarbonCreditIssuance = async (
  shipmentId: string,
  sustainabilityScore: number
): Promise<{ success: boolean; tokens?: number; message?: string }> => {
  try {
    // Call the blockchain verification edge function
    const { data, error } = await supabase.functions.invoke('blockchain-verify', {
      body: {
        operation: 'carbon-credits',
        shipmentId,
        sustainabilityScore
      }
    });

    if (error) throw error;

    if (!data.success) {
      throw new Error('Carbon credit issuance failed');
    }

    // Record the carbon credit issuance in the database
    await supabase.from('shipment_events').insert({
      shipment_id: shipmentId,
      event_type: 'carbon_credits_issued',
      data: {
        sustainabilityScore,
        tokens: data.tokens,
        transactionHash: data.transactionHash
      },
      blockchain_tx_hash: data.transactionHash
    });

    toast.success(`${data.tokens} carbon credit tokens issued`);
    return {
      success: true,
      tokens: data.tokens
    };
  } catch (error) {
    console.error('Error issuing carbon credits:', error);
    toast.error('Failed to issue carbon credits');
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};
