# NFT Minting API - Charmcaster

## Overview
This API route allows minting NFTs on the Celo Alfajores testnet for matched users in the Charmcaster app.

## Contract Details
- **Network**: Celo Alfajores Testnet
- **Contract Address**: `0x63eb3f3fc921e716f0050861d167c77575834201`
- **Contract Type**: ERC721 with URI Storage
- **Function**: `mintCharm(address to, string memory tokenURI)`

## API Endpoint

### POST `/api/mint`

Mints a new Charm NFT to the specified wallet address.

**Request Body:**
```json
{
  "to": "0x1234567890123456789012345678901234567890",
  "tokenURI": "https://example.com/metadata.json"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "NFT minted successfully! 🎉",
  "transaction": {
    "hash": "0x...",
    "blockNumber": "12345678",
    "gasUsed": "150000",
    "status": "success"
  },
  "nft": {
    "contractAddress": "0x63eb3f3fc921e716f0050861d167c77575834201",
    "tokenId": "1",
    "to": "0x1234567890123456789012345678901234567890",
    "tokenURI": "https://example.com/metadata.json"
  },
  "explorer": "https://alfajores-blockscout.celo-testnet.org/tx/0x..."
}
```

**Error Response (4xx/5xx):**
```json
{
  "error": "Error message",
  "details": "Additional error details"
}
```

## Setup Instructions

### 1. Environment Variables
Add to your `.env.local` file:
```bash
# Your wallet's private key (without 0x prefix)
PRIVATE_KEY=your_private_key_here
```

### 2. Middleware Configuration
The mint API endpoint is configured to bypass authentication in `middleware.ts`. 
The middleware allows public access to:
- `/api/mint` (for NFT minting)
- `/api/auth/sign-in` (for authentication)
- `/api/og` (for Open Graph images)
- `/api/webhook` (for webhooks)

### 3. Wallet Setup
- Make sure your wallet has CELO tokens on Alfajores testnet
- Get testnet tokens from: https://faucet.celo.org/alfajores
- The wallet needs enough gas to execute minting transactions
- Use `node get-wallet-info.js` to get your wallet address for funding

### 4. Install Dependencies
The API uses `viem` for blockchain interaction. Make sure it's installed:
```bash
npm install viem
```

## Usage Examples

### Basic Minting
```javascript
const response = await fetch('/api/mint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    to: '0x1234567890123456789012345678901234567890',
    tokenURI: 'https://example.com/metadata.json'
  })
});

const result = await response.json();
```

### Using the Utility Functions
```javascript
import { mintMatchNFT } from './lib/nft-minting';

// Complete minting process with metadata creation
const result = await mintMatchNFT(matchData, walletAddress);
```

## Error Handling

The API handles common errors:
- **400**: Invalid request (bad wallet address, missing fields)
- **500**: Server errors (insufficient funds, contract issues, timeouts)

## Security Notes

- Keep your `PRIVATE_KEY` secure and never commit it to version control
- Use a dedicated wallet for minting (not your main wallet)
- Consider using a more secure key management system for production

## Testing

### Quick Tests
Run the comprehensive test script to verify the API works:
```bash
node test-mint-comprehensive.js
```

### Get Wallet Info
Check your wallet address and funding status:
```bash
node get-wallet-info.js
```

### Manual Testing
Basic test with curl:
```bash
curl -X POST http://localhost:3000/api/mint \
  -H "Content-Type: application/json" \
  -d '{"to":"0x1234567890123456789012345678901234567890","tokenURI":"https://example.com/metadata.json"}'
```

## Blockchain Explorer

View transactions on Celo Alfajores:
- **Blockscout**: https://alfajores-blockscout.celo-testnet.org/
- **CeloScan**: https://celoscan.io/

## Troubleshooting

### Common Issues:
1. **"Insufficient funds"** - Add CELO tokens to your wallet
2. **"Invalid address"** - Check wallet address format
3. **"Transaction timeout"** - Network congestion, transaction may still succeed
4. **"Contract execution reverted"** - Check contract state and permissions

### Gas Optimization:
- Current gas limit is estimated automatically
- Consider batching multiple mints if needed
- Monitor gas prices on Celo network

## Production Considerations

For production deployment:
1. Use a secure key management system
2. Implement rate limiting
3. Add authentication/authorization
4. Monitor transaction costs
5. Implement proper metadata storage (IPFS)
6. Add transaction retry logic
7. Consider using a gas station for dynamic gas pricing
