
# Blockchain-Based Supply Chain Logistics Tracker

## Overview

This project is a comprehensive supply chain logistics management system that leverages blockchain technology for transparent, secure, and efficient shipment tracking. The application provides real-time visibility into shipments, route optimization, sustainability analytics, and blockchain verification of supply chain events.

## Key Features

- **Blockchain Verification**: Immutable records of shipment creation, status updates, and delivery confirmations
- **Multi-modal Route Optimization**: AI-powered route planning for trucks, ships, rail, and air transport
- **Real-time Tracking**: Monitor shipment location and conditions with IoT sensor data
- **Sustainability Analytics**: Track and reduce carbon footprint with AI-generated recommendations
- **Smart Contracts**: Automated customs clearance, payment processing, and dispute resolution
- **Role-based Access**: Separate interfaces for managers, drivers, and customers

## Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL database, authentication, and edge functions)
- **Blockchain Integration**: Simulated blockchain interactions with provable transactions
- **Data Visualization**: Recharts for analytics dashboards
- **Maps & Routes**: Integration with mapping services for route visualization
- **AI Integration**: Machine learning for route optimization and sustainability suggestions

## Project Architecture

```
├── src/
│   ├── components/       # Reusable UI components
│   ├── contexts/         # React context providers
│   ├── hooks/            # Custom React hooks
│   ├── integrations/     # External service integrations
│   ├── pages/            # Page components by user role
│   │   ├── customer/     # Customer-facing pages
│   │   ├── driver/       # Driver-facing pages
│   │   ├── manager/      # Management pages
│   │   └── shared/       # Shared pages (like shipment details)
│   ├── services/         # Business logic services
│   └── utils/            # Utility functions
├── supabase/
│   ├── functions/        # Supabase Edge Functions
│   │   ├── blockchain-verify/  # Blockchain verification
│   │   └── sustainability-ai/  # AI for sustainability analysis
│   └── migrations/       # Database migration scripts
└── public/               # Static assets
```

## User Roles

### Manager
- Create and manage shipments
- Analyze sustainability metrics
- View AI-generated optimization suggestions
- Manage users and review customer feedback

### Driver
- Update shipment status and location
- Optimize delivery routes
- Record delivery updates with sensor data
- Confirm deliveries on blockchain

### Customer
- Track shipments in real-time
- View carbon footprint reports
- Leave reviews for completed deliveries
- Verify deliveries using blockchain records

## Blockchain Integration

The system uses blockchain technology to ensure:

1. **Immutability**: Once recorded, shipment data cannot be altered
2. **Transparency**: All participants can verify the authenticity of transactions
3. **Traceability**: Complete audit trail of a product's journey
4. **Smart Contracts**: Automated execution of predefined rules

### Blockchain Process Flow:

1. When a shipment is created, its details are recorded on the blockchain
2. Status updates (in-transit, delayed, delivered) are verified and recorded
3. Sensor data (temperature, humidity, location) is periodically logged
4. Smart contracts automatically trigger actions based on predefined conditions
5. Customers and regulators can verify the authenticity of the entire supply chain

## Setting Up User Accounts

### Option 1: Using the Supabase Dashboard

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

## Future Development

Here are areas for potential enhancement:

### Blockchain Integration
- Implement an actual blockchain network (Ethereum, Hyperledger, etc.)
- Replace simulated transactions with real blockchain interactions
- Develop more sophisticated smart contracts for business logic

### IoT Integration
- Connect with real IoT devices for accurate sensor data
- Implement real-time data streaming from vehicles
- Add more sensor types (shock detection, light exposure, etc.)

### AI and Machine Learning
- Enhance route optimization with machine learning models
- Implement predictive maintenance for vehicles
- Add anomaly detection for identifying potential issues

### User Experience
- Develop mobile applications for drivers and customers
- Add voice-activated features for hands-free operation
- Implement augmented reality for package handling instructions

### Sustainability
- Add carbon credit trading functionality
- Implement more detailed sustainability metrics and certifications
- Create gamification elements for encouraging sustainable practices

## Contribution Guidelines

To contribute to this project:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
