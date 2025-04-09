
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface VerifyRequest {
  operation: 'verify' | 'register' | 'update';
  hash?: string;
  shipmentData?: {
    id?: string;
    transportType: string;
    distanceKm?: number;
    carbonFootprint?: number;
    origin?: string;
    destination?: string;
  };
  shipmentId?: string;
  status?: string;
  metadata?: any;
}

// This is a simplified blockchain simulation for demo purposes
// In a real project, this would connect to an actual blockchain network
serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
    });
  }
  
  try {
    const { operation, hash, shipmentData, shipmentId, status, metadata } = await req.json() as VerifyRequest;
    
    console.log(`Blockchain operation: ${operation}`);
    
    if (operation === 'verify' && hash) {
      // Simulated verification of a blockchain transaction
      return new Response(
        JSON.stringify({
          verified: true,
          blockNumber: 14358291,
          timestamp: new Date().toISOString(),
          from: "0xA742a6Af8F4D193CEF887D7A932ADc0A3D410D74",
          to: "0xEC9CaB5E02F0DaE3dE3C1e5A543C79F0B92e8f95",
          gasUsed: 42688,
          status: "success"
        }),
        {
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json" 
          },
        }
      );
    } 
    else if (operation === 'register' && shipmentData) {
      // Generate a pseudo-random transaction hash
      const txHash = generateRandomHash();
      
      // In a real system, this would record the data on blockchain
      // For this demo, we just return a simulated result
      return new Response(
        JSON.stringify({
          success: true,
          transactionHash: txHash,
          blockchainRecord: {
            shipmentId: shipmentData.id || generateRandomId(),
            timestamp: new Date().toISOString(),
            carbonFootprint: shipmentData.carbonFootprint,
            transportType: shipmentData.transportType,
            verified: true
          }
        }),
        {
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json" 
          },
        }
      );
    }
    else if (operation === 'update' && shipmentId) {
      // Generate a pseudo-random transaction hash
      const txHash = generateRandomHash();
      
      // In a real system, this would update data on blockchain
      // For this demo, we just return a simulated result
      return new Response(
        JSON.stringify({
          success: true,
          transactionHash: txHash,
          blockchainRecord: {
            shipmentId: shipmentId,
            timestamp: new Date().toISOString(),
            status: status || 'updated',
            metadata: metadata,
            verified: true
          }
        }),
        {
          headers: { 
            ...corsHeaders, 
            "Content-Type": "application/json" 
          },
        }
      );
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: "Invalid operation or missing parameters",
      }),
      {
        status: 400,
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        },
      }
    );
    
  } catch (error) {
    console.error("Error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: { 
          ...corsHeaders, 
          "Content-Type": "application/json" 
        },
      }
    );
  }
});

// Generate a random blockchain-like hash
function generateRandomHash() {
  const characters = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 64; i++) {
    hash += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return hash;
}

// Generate a random UUID-like ID
function generateRandomId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}
