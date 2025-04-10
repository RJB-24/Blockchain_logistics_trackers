
// Edge function for handling supply chain management and blockchain tracking

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.4.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ShipmentEvent {
  shipmentId: string;
  eventType: 'created' | 'status_updated' | 'location_updated' | 'document_added' | 'customs_cleared' | 'delivered';
  timestamp: string;
  data: any;
  transactionHash?: string;
}

interface BlockchainRecord {
  success: boolean;
  transactionHash: string;
  message?: string;
  data?: any;
}

interface SupplyChainParticipant {
  id: string;
  name: string;
  role: 'supplier' | 'manufacturer' | 'distributor' | 'retailer' | 'customer' | 'regulator';
  publicKey: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }
  
  try {
    const { action, shipmentId, eventData, participantId, documentHash, query } = await req.json();
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    console.log(`Supply Chain Management function called with action: ${action}`);
    
    switch (action) {
      case 'record_event':
        return await recordSupplyChainEvent(shipmentId, eventData, supabase);
        
      case 'verify_product_history':
        return await verifyProductHistory(shipmentId, supabase);
        
      case 'transfer_ownership':
        return await transferOwnership(shipmentId, eventData.fromParticipant, eventData.toParticipant, supabase);
        
      case 'add_document':
        return await addDocumentToShipment(shipmentId, documentHash, eventData.documentType, supabase);
        
      case 'create_smart_contract':
        return await createSmartContract(eventData.contractType, eventData.parties, eventData.terms, supabase);
        
      case 'query_supply_chain':
        return await querySupplyChain(query, supabase);
        
      default:
        return new Response(
          JSON.stringify({
            success: false,
            error: "Invalid action specified",
          }),
          {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          }
        );
    }
    
  } catch (error) {
    console.error("Error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

async function recordSupplyChainEvent(shipmentId: string, eventData: any, supabase: any): Promise<Response> {
  console.log(`Recording supply chain event for shipment ${shipmentId}:`, eventData);
  
  try {
    // Validate the shipment exists
    const { data: shipment, error: shipmentError } = await supabase
      .from('shipments')
      .select('*')
      .eq('id', shipmentId)
      .single();
      
    if (shipmentError) throw new Error('Shipment not found');
    
    // Create the event record
    const event: ShipmentEvent = {
      shipmentId,
      eventType: eventData.type,
      timestamp: new Date().toISOString(),
      data: eventData,
      transactionHash: generateRandomHash() // In a real implementation, this would be a blockchain transaction hash
    };
    
    // Record the event in the database (simulated)
    // In a real implementation, this would also record the event on the blockchain
    const { data: recordedEvent, error: eventError } = await supabase
      .from('shipment_events')
      .insert({
        shipment_id: event.shipmentId,
        event_type: event.eventType,
        data: event.data,
        blockchain_tx_hash: event.transactionHash
      })
      .select()
      .single();
      
    if (eventError) throw eventError;
    
    // If this is a status update event, update the shipment status
    if (event.eventType === 'status_updated') {
      const { error: updateError } = await supabase
        .from('shipments')
        .update({ status: eventData.status })
        .eq('id', shipmentId);
        
      if (updateError) throw updateError;
    }
    
    // Return success response with blockchain record
    return new Response(
      JSON.stringify({
        success: true,
        event: recordedEvent,
        blockchainRecord: {
          transactionHash: event.transactionHash,
          blockNumber: Math.floor(Math.random() * 1000000) + 15000000,
          timestamp: event.timestamp,
          verified: true
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error('Error recording supply chain event:', error);
    throw error;
  }
}

async function verifyProductHistory(shipmentId: string, supabase: any): Promise<Response> {
  console.log(`Verifying product history for shipment ${shipmentId}`);
  
  try {
    // Get all events for this shipment
    const { data: events, error: eventsError } = await supabase
      .from('shipment_events')
      .select('*')
      .eq('shipment_id', shipmentId)
      .order('created_at', { ascending: true });
      
    if (eventsError) throw eventsError;
    
    // Get basic shipment info
    const { data: shipment, error: shipmentError } = await supabase
      .from('shipments')
      .select('*')
      .eq('id', shipmentId)
      .single();
      
    if (shipmentError) throw shipmentError;
    
    // Verify each event on the blockchain (in a real implementation)
    // Here we just simulate the verification
    const verifiedEvents = events.map((event: any) => ({
      ...event,
      blockchain_verified: true,
      verification_time: new Date().toISOString()
    }));
    
    // Check for any missing or potentially tampered events
    // This is a simplified check for demonstration
    const isHistoryComplete = events.length > 0 && 
      events.some((e: any) => e.event_type === 'created') &&
      (shipment.status === 'delivered' ? 
        events.some((e: any) => e.event_type === 'delivered') : 
        true);
    
    return new Response(
      JSON.stringify({
        success: true,
        shipment,
        events: verifiedEvents,
        verification: {
          historyComplete: isHistoryComplete,
          verifiedOnBlockchain: true,
          timeOfVerification: new Date().toISOString(),
          verificationHash: generateRandomHash()
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error('Error verifying product history:', error);
    throw error;
  }
}

async function transferOwnership(
  shipmentId: string, 
  fromParticipantId: string, 
  toParticipantId: string, 
  supabase: any
): Promise<Response> {
  console.log(`Transferring ownership of shipment ${shipmentId} from ${fromParticipantId} to ${toParticipantId}`);
  
  try {
    // Validate shipment and participants
    const { data: shipment, error: shipmentError } = await supabase
      .from('shipments')
      .select('*')
      .eq('id', shipmentId)
      .single();
      
    if (shipmentError) throw new Error('Shipment not found');
    
    // In a real implementation, verify that fromParticipant currently owns the shipment
    // and that they've authorized this transfer
    
    // Record the transfer event
    const transferHash = generateRandomHash();
    const transferTime = new Date().toISOString();
    
    // Create a shipment event for the transfer
    const { error: eventError } = await supabase
      .from('shipment_events')
      .insert({
        shipment_id: shipmentId,
        event_type: 'ownership_transferred',
        data: {
          fromParticipant: fromParticipantId,
          toParticipant: toParticipantId,
          transferTime,
          reason: 'Standard supply chain handoff'
        },
        blockchain_tx_hash: transferHash
      });
      
    if (eventError) throw eventError;
    
    // Update the shipment with the new owner
    const { error: updateError } = await supabase
      .from('shipments')
      .update({ 
        customer_id: toParticipantId, // Assuming customer_id is used to track current owner
        updated_at: transferTime
      })
      .eq('id', shipmentId);
      
    if (updateError) throw updateError;
    
    return new Response(
      JSON.stringify({
        success: true,
        transferRecord: {
          shipmentId,
          fromParticipant: fromParticipantId,
          toParticipant: toParticipantId,
          transferTime,
          transactionHash: transferHash,
          blockNumber: Math.floor(Math.random() * 1000000) + 15000000,
          status: 'confirmed'
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error('Error transferring ownership:', error);
    throw error;
  }
}

async function addDocumentToShipment(
  shipmentId: string, 
  documentHash: string, 
  documentType: string, 
  supabase: any
): Promise<Response> {
  console.log(`Adding document of type ${documentType} to shipment ${shipmentId}`);
  
  try {
    // Validate the shipment exists
    const { data: shipment, error: shipmentError } = await supabase
      .from('shipments')
      .select('*')
      .eq('id', shipmentId)
      .single();
      
    if (shipmentError) throw new Error('Shipment not found');
    
    // Record document in the database
    const { data: document, error: documentError } = await supabase
      .from('shipment_documents')
      .insert({
        shipment_id: shipmentId,
        document_type: documentType,
        document_hash: documentHash,
        is_verified: true,
        blockchain_tx_hash: generateRandomHash()
      })
      .select()
      .single();
      
    if (documentError) throw documentError;
    
    // Create a shipment event for the document addition
    const { error: eventError } = await supabase
      .from('shipment_events')
      .insert({
        shipment_id: shipmentId,
        event_type: 'document_added',
        data: {
          documentId: document.id,
          documentType,
          documentHash,
          timestamp: new Date().toISOString()
        },
        blockchain_tx_hash: document.blockchain_tx_hash
      });
      
    if (eventError) throw eventError;
    
    return new Response(
      JSON.stringify({
        success: true,
        document,
        blockchainRecord: {
          transactionHash: document.blockchain_tx_hash,
          timestamp: new Date().toISOString(),
          documentHash,
          verified: true
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error('Error adding document to shipment:', error);
    throw error;
  }
}

async function createSmartContract(
  contractType: string, 
  parties: string[], 
  terms: any, 
  supabase: any
): Promise<Response> {
  console.log(`Creating ${contractType} smart contract between parties:`, parties);
  
  try {
    // Generate contract details
    const contractId = generateRandomId();
    const contractHash = generateRandomHash();
    const creationTime = new Date().toISOString();
    
    // In a real implementation, this would deploy a smart contract to the blockchain
    
    // Record the contract in the database
    const { data: contract, error: contractError } = await supabase
      .from('smart_contracts')
      .insert({
        contract_id: contractId,
        contract_type: contractType,
        parties,
        terms,
        status: 'active',
        created_at: creationTime,
        blockchain_tx_hash: contractHash
      })
      .select()
      .single();
      
    if (contractError) throw contractError;
    
    return new Response(
      JSON.stringify({
        success: true,
        contract,
        blockchainRecord: {
          contractAddress: '0x' + generateRandomId().replace(/-/g, '').substring(0, 40),
          deploymentHash: contractHash,
          timestamp: creationTime,
          status: 'deployed'
        }
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error('Error creating smart contract:', error);
    throw error;
  }
}

async function querySupplyChain(query: any, supabase: any): Promise<Response> {
  console.log(`Querying supply chain with parameters:`, query);
  
  try {
    let data;
    let error;
    
    switch (query.type) {
      case 'product_trace':
        // Trace a product through the supply chain using its identifier
        ({ data, error } = await supabase
          .from('shipment_events')
          .select(`
            *,
            shipments:shipment_id(*)
          `)
          .eq('data->productId', query.productId)
          .order('created_at', { ascending: true }));
        break;
        
      case 'participant_shipments':
        // Get all shipments involving a specific participant
        ({ data, error } = await supabase
          .from('shipments')
          .select('*')
          .or(`customer_id.eq.${query.participantId},assigned_driver_id.eq.${query.participantId}`));
        break;
        
      case 'carbon_footprint':
        // Calculate carbon footprint for a specific time period
        const startDate = query.startDate || '2000-01-01';
        const endDate = query.endDate || new Date().toISOString();
        
        ({ data, error } = await supabase
          .from('shipments')
          .select('carbon_footprint, transport_type')
          .gte('created_at', startDate)
          .lte('created_at', endDate));
          
        if (!error && data) {
          // Calculate total carbon footprint
          const totalFootprint = data.reduce((sum: number, shipment: any) => 
            sum + (shipment.carbon_footprint || 0), 0);
            
          // Group by transport type
          const byTransportType = data.reduce((acc: any, shipment: any) => {
            const type = shipment.transport_type || 'unknown';
            acc[type] = (acc[type] || 0) + (shipment.carbon_footprint || 0);
            return acc;
          }, {});
          
          data = { totalFootprint, byTransportType, timeFrame: { startDate, endDate } };
        }
        break;
        
      default:
        throw new Error('Invalid query type');
    }
    
    if (error) throw error;
    
    return new Response(
      JSON.stringify({
        success: true,
        results: data,
        query
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error('Error querying supply chain:', error);
    throw error;
  }
}

// Helper functions
function generateRandomHash(): string {
  const characters = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 64; i++) {
    hash += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return hash;
}

function generateRandomId(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
