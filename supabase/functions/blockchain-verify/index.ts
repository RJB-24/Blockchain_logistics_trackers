
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// Define CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Respond to CORS preflight requests
const handleCors = (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders,
      status: 204,
    });
  }
  return null;
};

// Mock blockchain verification function
// In a real application, this would interact with a blockchain network
const verifyBlockchainRecord = async (hash: string) => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  // Mock verification result
  return {
    verified: true,
    blockNumber: Math.floor(Math.random() * 1000000) + 15000000,
    timestamp: new Date().toISOString(),
    from: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e",
    to: "0x8Ba1f109551bD432803012645Ac136ddd64DBA72",
    gasUsed: Math.floor(Math.random() * 100000) + 50000,
    status: "success",
  };
};

// Generate a mock Ethereum transaction hash
const generateTransactionHash = () => {
  const chars = "0123456789abcdef";
  let hash = "0x";
  for (let i = 0; i < 64; i++) {
    hash += chars[Math.floor(Math.random() * chars.length)];
  }
  return hash;
};

// Calculate carbon footprint based on transport method and distance
const calculateCarbonFootprint = (transportType: string, distanceKm: number): number => {
  // Carbon emission factors (gCO2/km)
  const emissionFactors: Record<string, number> = {
    air: 0.82,
    truck: 0.092,
    rail: 0.022,
    ship: 0.015,
    "multi-modal": 0.05,
  };

  const factor = emissionFactors[transportType.toLowerCase()] || emissionFactors.truck;
  return Math.round(factor * distanceKm * 100) / 100; // kg CO2
};

serve(async (req) => {
  // Handle CORS
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    // Check request method
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 405,
      });
    }

    // Parse request body
    const body = await req.json();
    
    // Handle different operation types
    switch (body.operation) {
      case "verify": {
        // Verify an existing blockchain record
        if (!body.hash) {
          return new Response(JSON.stringify({ error: "Hash is required" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          });
        }
        
        const result = await verifyBlockchainRecord(body.hash);
        
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      case "register": {
        // Register a new shipment on the blockchain
        if (!body.shipmentData) {
          return new Response(JSON.stringify({ error: "Shipment data is required" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          });
        }
        
        // Generate a transaction hash
        const transactionHash = generateTransactionHash();
        
        // Calculate carbon footprint if needed
        let carbonFootprint = body.shipmentData.carbonFootprint;
        if (!carbonFootprint && body.shipmentData.transportType && body.shipmentData.distanceKm) {
          carbonFootprint = calculateCarbonFootprint(
            body.shipmentData.transportType, 
            body.shipmentData.distanceKm
          );
        }
        
        // Mock blockchain registration
        const result = {
          success: true,
          transactionHash,
          blockchainRecord: {
            shipmentId: body.shipmentData.id || crypto.randomUUID(),
            timestamp: new Date().toISOString(),
            carbonFootprint,
            transportType: body.shipmentData.transportType,
            verified: true,
          }
        };
        
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      case "update": {
        // Update shipment status on the blockchain
        if (!body.shipmentId || !body.status) {
          return new Response(JSON.stringify({ error: "Shipment ID and status are required" }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
            status: 400,
          });
        }
        
        // Generate a transaction hash
        const transactionHash = generateTransactionHash();
        
        // Mock blockchain update
        const result = {
          success: true,
          transactionHash,
          blockchainRecord: {
            shipmentId: body.shipmentId,
            status: body.status,
            timestamp: new Date().toISOString(),
            verified: true,
          }
        };
        
        return new Response(JSON.stringify(result), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
      
      default:
        return new Response(JSON.stringify({ error: "Unknown operation" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 400,
        });
    }
  } catch (error) {
    console.error("Error processing request:", error);
    
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
