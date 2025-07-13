import { NextResponse } from 'next/server';
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { celoAlfajores } from 'viem/chains';

// Celo Alfajores testnet configuration
const ALFAJORES_RPC_URL = 'https://alfajores-forno.celo-testnet.org';
const CONTRACT_ADDRESS = '0x63eb3f3fc921e716f0050861d167c77575834201';

// Contract ABI for the mintCharm function
const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "to",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "tokenURI",
        "type": "string"
      }
    ],
    "name": "mintCharm",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Initialize clients
const publicClient = createPublicClient({
  chain: celoAlfajores,
  transport: http(ALFAJORES_RPC_URL)
});

export async function POST(request) {
  try {
    console.log('🎨 Minting NFT request received');
    
    // Parse request body
    const { to, tokenURI } = await request.json();
    
    // Validate inputs
    if (!to || !tokenURI) {
      console.error('❌ Missing required fields');
      return NextResponse.json(
        { error: 'Missing required fields: to and tokenURI' },
        { status: 400 }
      );
    }
    
    // Validate wallet address format
    if (!to.match(/^0x[a-fA-F0-9]{40}$/)) {
      console.error('❌ Invalid wallet address format');
      return NextResponse.json(
        { error: 'Invalid wallet address format' },
        { status: 400 }
      );
    }
    
    // Validate tokenURI format
    if (!tokenURI.startsWith('http')) {
      console.error('❌ Invalid tokenURI format');
      return NextResponse.json(
        { error: 'Invalid tokenURI format - must be a valid HTTP URL' },
        { status: 400 }
      );
    }
    
    // Get private key from environment
    const privateKey = process.env.PRIVATE_KEY;
    if (!privateKey) {
      console.error('❌ PRIVATE_KEY environment variable not set');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }
    
    // Ensure private key has 0x prefix for viem
    const formattedPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
    
    console.log(`🔍 Minting NFT to: ${to}`);
    console.log(`🔗 Token URI: ${tokenURI}`);
    
    // Create account from private key
    const account = privateKeyToAccount(formattedPrivateKey);
    
    // Create wallet client
    const walletClient = createWalletClient({
      account,
      chain: celoAlfajores,
      transport: http(ALFAJORES_RPC_URL)
    });
    
    console.log(`👛 Using wallet: ${account.address}`);
    
    // Check wallet balance
    const balance = await publicClient.getBalance({ address: account.address });
    console.log(`💰 Wallet balance: ${balance} wei`);
    
    if (balance === 0n) {
      console.error('❌ Insufficient funds in wallet');
      return NextResponse.json(
        { error: 'Insufficient funds in minting wallet' },
        { status: 500 }
      );
    }
    
    // Prepare transaction
    const { request: simulateRequest } = await publicClient.simulateContract({
      account,
      address: CONTRACT_ADDRESS,
      abi: CONTRACT_ABI,
      functionName: 'mintCharm',
      args: [to, tokenURI],
    });
    
    console.log('✅ Transaction simulation successful');
    
    // Execute the transaction
    const txHash = await walletClient.writeContract(simulateRequest);
    console.log(`📝 Transaction submitted: ${txHash}`);
    
    // Wait for transaction confirmation
    const receipt = await publicClient.waitForTransactionReceipt({ 
      hash: txHash,
      timeout: 60000 // 60 second timeout
    });
    
    console.log(`✅ Transaction confirmed in block: ${receipt.blockNumber}`);
    
    // Extract token ID from logs if available
    let tokenId = null;
    if (receipt.logs && receipt.logs.length > 0) {
      // Look for Transfer event to extract tokenId
      for (const log of receipt.logs) {
        if (log.topics && log.topics.length >= 4) {
          // Transfer event signature: Transfer(address,address,uint256)
          const transferEventSignature = '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';
          if (log.topics[0] === transferEventSignature) {
            // Token ID is in the 4th topic (index 3)
            const tokenIdHex = log.topics[3];
            tokenId = parseInt(tokenIdHex, 16);
            console.log(`🎯 Token ID extracted: ${tokenId}`);
            break;
          }
        }
      }
    }
    
    // If token ID extraction failed, try alternative method
    if (!tokenId && receipt.logs && receipt.logs.length > 0) {
      console.log('🔍 Alternative token ID extraction...');
      const transferLog = receipt.logs.find(log => 
        log.address.toLowerCase() === CONTRACT_ADDRESS.toLowerCase()
      );
      if (transferLog && transferLog.topics && transferLog.topics.length >= 4) {
        const tokenIdHex = transferLog.topics[3];
        tokenId = parseInt(tokenIdHex, 16);
        console.log(`🎯 Token ID extracted (alternative): ${tokenId}`);
      }
    }
    
    // Return success response
    const response = {
      success: true,
      message: 'NFT minted successfully! 🎉',
      transaction: {
        hash: txHash,
        blockNumber: receipt.blockNumber.toString(),
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status
      },
      nft: {
        contractAddress: CONTRACT_ADDRESS,
        tokenId: tokenId?.toString(),
        to: to,
        tokenURI: tokenURI
      },
      explorer: `https://alfajores-blockscout.celo-testnet.org/tx/${txHash}`
    };
    
    console.log('🎉 NFT minted successfully!');
    console.log(`🔍 View on explorer: https://alfajores-blockscout.celo-testnet.org/tx/${txHash}`);
    
    return NextResponse.json(response, { status: 200 });
    
  } catch (error) {
    console.error('❌ Error minting NFT:', error);
    
    // Handle specific error types
    if (error.message.includes('insufficient funds')) {
      return NextResponse.json(
        { error: 'Insufficient funds for gas fees' },
        { status: 500 }
      );
    }
    
    if (error.message.includes('revert')) {
      return NextResponse.json(
        { error: 'Contract execution reverted - check contract state' },
        { status: 500 }
      );
    }
    
    if (error.message.includes('timeout')) {
      return NextResponse.json(
        { error: 'Transaction timeout - may still be pending' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to mint NFT',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to mint NFTs.' },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to mint NFTs.' },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST to mint NFTs.' },
    { status: 405 }
  );
}
