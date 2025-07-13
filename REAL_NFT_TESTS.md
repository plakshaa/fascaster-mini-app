# NFT Minting Test Commands

## Test with your real IPFS metadata

### Using curl:
```bash
curl -X POST http://localhost:3000/api/mint \
  -H "Content-Type: application/json" \
  -d '{
    "to": "0xB2009F8B8229941E65337d091EF44C997ED9028f",
    "tokenURI": "https://nftstorage.link/ipfs/bafkreicuve4f4oa475tezmklkyl7r23wxswv3l2uy6k5bg3nkmw5wbprp4"
  }'
```

### Test with different wallet addresses:
```bash
# Test 1: Your minting wallet
curl -X POST http://localhost:3000/api/mint \
  -H "Content-Type: application/json" \
  -d '{
    "to": "0xB2009F8B8229941E65337d091EF44C997ED9028f",
    "tokenURI": "https://nftstorage.link/ipfs/bafkreicuve4f4oa475tezmklkyl7r23wxswv3l2uy6k5bg3nkmw5wbprp4"
  }'

# Test 2: Different wallet
curl -X POST http://localhost:3000/api/mint \
  -H "Content-Type: application/json" \
  -d '{
    "to": "0x742d35Cc6634C0532925a3b8D6aC6d9C2d9a5c7c",
    "tokenURI": "https://nftstorage.link/ipfs/bafkreicuve4f4oa475tezmklkyl7r23wxswv3l2uy6k5bg3nkmw5wbprp4"
  }'
```

### Using Node.js test scripts:
```bash
# Quick single mint test
node quick-real-mint.js

# Comprehensive test with multiple wallets
node test-real-nft.js
```

## Expected Response:
```json
{
  "success": true,
  "message": "NFT minted successfully! 🎉",
  "transaction": {
    "hash": "0x...",
    "blockNumber": "...",
    "gasUsed": "...",
    "status": "success"
  },
  "nft": {
    "contractAddress": "0x63eb3f3fc921e716f0050861d167c77575834201",
    "tokenId": "...",
    "to": "0xB2009F8B8229941E65337d091EF44C997ED9028f",
    "tokenURI": "https://nftstorage.link/ipfs/bafkreicuve4f4oa475tezmklkyl7r23wxswv3l2uy6k5bg3nkmw5wbprp4"
  },
  "explorer": "https://alfajores-blockscout.celo-testnet.org/tx/0x..."
}
```

## Metadata URL:
Your IPFS metadata: https://nftstorage.link/ipfs/bafkreicuve4f4oa475tezmklkyl7r23wxswv3l2uy6k5bg3nkmw5wbprp4

## Contract Address:
0x63eb3f3fc921e716f0050861d167c77575834201

## Your Wallet Address:
0xB2009F8B8229941E65337d091EF44C997ED9028f
