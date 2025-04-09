
# User Account Setup Guide for Blockchain-Based Logistics Tracker

This guide will show you how to set up and manage different user accounts (Manager, Customer, Driver) in our logistics tracking system.

## Understanding User Roles

Our system uses a role-based access control system with three main roles:

1. **Manager**: Can create shipments, manage users, view and analyze data, and access all features
2. **Customer**: Can track shipments, leave reviews, view carbon reports, and receive updates
3. **Driver**: Can update shipment status, provide delivery updates, optimize routes, and report issues

## Setting Up User Accounts

### Option 1: Using the Supabase Authentication UI

1. Go to the Supabase Dashboard at https://supabase.com/dashboard/project/vqxotgcgsbvjcrchcwup/auth/users
2. Click on "Add User" and enter the required information
3. In the "User Roles" section, add the appropriate role for the user (manager, customer, or driver)

### Option 2: Creating Users in the Application

1. Use the sign-up page in the application
2. After creating the account, the default role will be "customer"
3. To change the role:
   - Log in as a manager
   - Go to User Management
   - Find the user and update their role

## Replacing Placeholder API Keys

To replace the placeholder API keys with real ones, follow these steps:

1. **Supabase API Keys**:
   - Go to Supabase Dashboard → Project Settings → API
   - Copy your real API keys (anon public key and service role key)
   - Update the keys in `src/integrations/supabase/client.ts`

2. **Blockchain API Keys** (if using a real blockchain):
   - Go to your blockchain provider (Ethereum, Hyperledger, etc.)
   - Generate API keys for your application
   - Add these keys as Supabase Edge Function Secrets:
     - Go to Supabase Dashboard → Edge Functions → Secrets
     - Add a new secret with the key `BLOCKCHAIN_API_KEY` and your actual API key

3. **Google Maps API Key** (for real map implementation):
   - Go to the Google Cloud Console → APIs & Services → Credentials
   - Create or use an existing API key that has Google Maps JavaScript API enabled
   - Add this key as a Supabase Edge Function Secret:
     - Go to Supabase Dashboard → Edge Functions → Secrets
     - Add a new secret with the key `GOOGLE_MAPS_API_KEY` and your actual API key

## Database Schema Setup

Our system uses the following core tables:

1. **profiles**: Stores user profile information
2. **user_roles**: Stores role assignments for users
3. **shipments**: Stores shipment information
4. **sensor_data**: Stores IoT sensor readings
5. **reviews**: Stores customer reviews
6. **routes**: Stores optimized routes

## Testing Different User Accounts

### Manager Account Test

1. Sign in with a manager account
2. Try creating a new shipment
3. View the dashboard with analytics
4. Access user management
5. Check sustainability recommendations

### Customer Account Test

1. Sign in with a customer account
2. Track a shipment
3. View carbon reports
4. Leave a review for a completed shipment
5. View blockchain verification of your shipment

### Driver Account Test

1. Sign in with a driver account
2. Update the status of an in-transit shipment
3. Use the route optimization feature
4. Record delivery updates
5. Check vehicle maintenance predictions

## Troubleshooting

If you encounter issues with user roles or permissions:

1. Check the user_roles table to ensure the user has the correct role assigned
2. Verify that the RLS (Row Level Security) policies are correctly configured
3. Make sure the user is properly authenticated before accessing protected features
4. Check the browser console and server logs for any error messages

For API key issues:

1. Ensure the keys are correctly formatted and have no extra spaces
2. Verify the keys have the necessary permissions enabled
3. Check if the keys are properly set in the application configuration
4. Test the API connection using a tool like Postman before implementing in the app

## Further Resources

- Supabase Authentication Documentation: https://supabase.com/docs/guides/auth
- Row Level Security Guide: https://supabase.com/docs/guides/auth/row-level-security
- Edge Functions Guide: https://supabase.com/docs/guides/functions

If you need further assistance, please contact the system administrator.
