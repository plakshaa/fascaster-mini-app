// Get wallet address from private key for funding
const { privateKeyToAccount } = require('viem/accounts');
require('dotenv').config({ path: '.env.local' });

try {
  const privateKey = process.env.PRIVATE_KEY;
  
  if (!privateKey) {
    console.error('❌ PRIVATE_KEY not found in environment');
    console.log('Make sure you have PRIVATE_KEY set in your .env.local file');
    console.log('Current environment variables:', Object.keys(process.env).filter(key => key.includes('PRIVATE')));
    process.exit(1);
  }
  
  // Ensure private key has 0x prefix
  const formattedPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
  
  const account = privateKeyToAccount(formattedPrivateKey);
  
  console.log('🔑 Wallet Information:');
  console.log('Address:', account.address);
  console.log('Private Key:', formattedPrivateKey);
  console.log('');
  console.log('💰 To fund this wallet on Celo Alfajores testnet:');
  console.log('1. Go to: https://faucet.celo.org/alfajores');
  console.log('2. Enter this address:', account.address);
  console.log('3. Request testnet CELO tokens');
  console.log('');
  console.log('🔍 Check balance at:');
  console.log('https://alfajores-blockscout.celo-testnet.org/address/' + account.address);
  
} catch (error) {
  console.error('❌ Error:', error.message);
  console.log('Make sure your private key is valid (64 characters, hex)');
}
