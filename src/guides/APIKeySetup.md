
# API Key Setup Guide

This guide explains how to replace placeholder API keys with real ones in the Blockchain-Based Logistics Tracker application.

## Required API Keys

The application uses several API keys for different services:

1. **Supabase API Keys** - For database and authentication
2. **Blockchain API Keys** - For interacting with blockchain networks
3. **Google Maps API Key** - For the mapping and route optimization features
4. **IoT Platform API Keys** - For connecting to IoT sensors (optional)

## Setting Up Supabase API Keys

1. Go to the [Supabase Dashboard](https://supabase.com/dashboard/project/vqxotgcgsbvjcrchcwup)
2. Navigate to Project Settings → API
3. You will see:
   - **Project URL**: The URL of your Supabase project
   - **anon public key**: Used for unauthenticated requests
   - **service_role key**: Used for server-side requests (keep this secure!)

4. In the `src/integrations/supabase/client.ts` file, replace:
   ```typescript
   const SUPABASE_URL = "https://vqxotgcgsbvjcrchcwup.supabase.co";
   const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZxeG90Z2Nnc2J2amNyY2hjd3VwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQxODMzNTcsImV4cCI6MjA1OTc1OTM1N30.txsr3aosri2xUiYLiRLJGzoPTsW2DXtMcwY8DirvVFM";
   ```
   
   With your actual values.

## Setting Up Blockchain API Keys

For Ethereum-based blockchain integration:

1. Create an account with a blockchain provider like [Infura](https://infura.io/) or [Alchemy](https://www.alchemy.com/)
2. Create a new project in their dashboard
3. Get your API key/project ID and endpoint URL
4. Add these as secrets in Supabase Edge Functions:
   
   a. Go to [Supabase Edge Functions Secrets](https://supabase.com/dashboard/project/vqxotgcgsbvjcrchcwup/settings/functions)
   
   b. Add the following secrets:
   ```
   BLOCKCHAIN_API_URL = "https://mainnet.infura.io/v3/YOUR_PROJECT_ID"
   BLOCKCHAIN_API_KEY = "YOUR_API_KEY"
   BLOCKCHAIN_NETWORK = "mainnet" (or "goerli", "sepolia", etc. for test networks)
   ```

5. For wallet management, you'll need a deployment wallet private key:
   ```
   BLOCKCHAIN_WALLET_PRIVATE_KEY = "YOUR_PRIVATE_KEY"
   ```
   
   ⚠️ **IMPORTANT**: Keep your private key secure! For production, use proper key management systems.

## Setting Up Google Maps API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to APIs & Services → Credentials
4. Click "Create Credentials" → "API Key"
5. Restrict the key to only the Google Maps APIs you're using:
   - Maps JavaScript API
   - Directions API
   - Distance Matrix API
   - Geocoding API
   - Places API

6. Add the key as a secret in Supabase Edge Functions:
   ```
   GOOGLE_MAPS_API_KEY = "YOUR_GOOGLE_MAPS_API_KEY"
   ```

7. For client-side usage, update the MapView component to use this key

## Setting Up IoT Platform API Keys (Optional)

If you're using a real IoT platform like AWS IoT, Azure IoT Hub, or Google Cloud IoT:

1. Get your API keys from your IoT platform provider
2. Add them to Supabase Edge Functions secrets:
   ```
   IOT_PLATFORM_API_KEY = "YOUR_IOT_API_KEY"
   IOT_PLATFORM_PROJECT_ID = "YOUR_PROJECT_ID"
   ```

## Updating the Edge Functions to Use Real API Keys

When the application is using real API keys, you'll need to update the edge functions to use them:

1. In `blockchain-verify/index.ts`:
   ```typescript
   // Replace placeholder implementations with real blockchain calls
   // Example for Ethereum:
   const provider = new ethers.providers.JsonRpcProvider(
     Deno.env.get("BLOCKCHAIN_API_URL")
   );
   const wallet = new ethers.Wallet(
     Deno.env.get("BLOCKCHAIN_WALLET_PRIVATE_KEY"),
     provider
   );
   ```

2. In `sustainability-ai/index.ts` for Google Maps integration:
   ```typescript
   const googleMapsApiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
   // Use the key for API calls
   ```

## Testing Your API Keys

After replacing the placeholder keys, test the application to ensure everything works:

1. **Supabase Authentication**: Try signing up and logging in
2. **Blockchain Integration**: Create a shipment and verify it's recorded on the blockchain
3. **Maps and Route Optimization**: Check if maps load and routes can be optimized
4. **IoT Integration**: Verify sensor data is being received and displayed

## Troubleshooting

If you encounter issues:

1. **API Key Format**: Ensure you've copied the entire key without any spaces
2. **API Quotas**: Check if you've hit free tier limits for any services
3. **Network Errors**: Look at the browser console or Supabase Edge Function logs
4. **CORS Issues**: Make sure your API keys are allowed on your application domain

## Production Considerations

Before deploying to production:

1. Set appropriate API key restrictions (domain/IP restrictions)
2. Use environment-specific keys (development vs. production)
3. Implement proper error handling for API failures
4. Consider API costs for production-scale usage

## Next Steps

Once your API keys are set up:

1. Complete the user account setup as described in the User Account Setup Guide
2. Create test shipments with real data
3. Test the full application workflow from shipment creation to delivery

For any questions or issues with API key setup, please contact the system administrator.
