
# Blockchain Verification Edge Function

This edge function simulates blockchain verification and transaction recording in a secure environment. It serves as a bridge between the application and blockchain networks.

## Features

- **Verify blockchain transactions**: Check if a transaction hash exists and get its details
- **Register shipments on blockchain**: Record new shipment data with blockchain verification
- **Update shipment status**: Record status changes (processing, in-transit, delivered, delayed)
- **Execute smart contracts**: Handle automated processes for payment, customs, and delivery
- **Carbon credit management**: Issue carbon credits based on sustainability score
- **Dispute resolution**: Handle shipping disputes through blockchain consensus

## Implementation Details

This implementation currently simulates blockchain behavior to allow development without an actual blockchain connection. In a production environment, this would connect to a real blockchain network like Ethereum, Hyperledger, or a custom enterprise blockchain.

### How to Connect to a Real Blockchain

1. Replace the simulated functions with actual blockchain SDK calls
2. Add the necessary blockchain provider API keys as edge function secrets
3. Implement proper transaction signing and verification using wallet libraries
4. Add error handling specific to the blockchain network being used

## Request/Response Format

### Verify Transaction
```json
// Request
{
  "operation": "verify",
  "hash": "0x1234567890abcdef..."
}

// Response
{
  "verified": true,
  "blockNumber": 14358291,
  "timestamp": "2023-04-28T12:34:56.789Z",
  "from": "0xA742a6Af8F4D193CEF887D7A932ADc0A3D410D74",
  "to": "0xEC9CaB5E02F0DaE3dE3C1e5A543C79F0B92e8f95",
  "gasUsed": 42688,
  "status": "success"
}
```

### Register Shipment
```json
// Request
{
  "operation": "register",
  "shipmentData": {
    "id": "uuid-string",
    "transportType": "truck",
    "distanceKm": 250,
    "carbonFootprint": 45.8,
    "origin": "New York",
    "destination": "Boston"
  }
}

// Response
{
  "success": true,
  "transactionHash": "0x1234567890abcdef...",
  "blockchainRecord": {
    "shipmentId": "uuid-string",
    "timestamp": "2023-04-28T12:34:56.789Z",
    "carbonFootprint": 45.8,
    "transportType": "truck",
    "verified": true
  }
}
```

## Smart Contract Operations

The function supports various smart contract operations:

1. **Payment processing**:
   - Handles escrow release upon delivery
   - Manages partial payments for multi-leg shipments
   
2. **Customs clearance**:
   - Verifies documentation
   - Issues customs clearance certificate
   
3. **Delivery confirmation**:
   - Records proof of delivery
   - Triggers payment release
   
4. **Carbon credits**:
   - Issues tokens based on sustainability metrics
   - Records carbon savings on blockchain

## Future Enhancements

- Real blockchain network integration
- Multi-chain support
- Decentralized identity verification
- Integration with regulatory compliance systems
- Enhanced dispute resolution mechanisms

## Security Considerations

- Keep blockchain private keys secure and never store them directly in code
- Implement proper authentication for all blockchain operations
- Use defensive programming techniques to handle blockchain transaction failures
- Implement rate limiting to prevent abuse
