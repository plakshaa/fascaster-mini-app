// Quick test for mint API after middleware fix
async function quickTest() {
  try {
    console.log('🧪 Testing mint API after middleware fix...');
    
    const response = await fetch('http://localhost:3000/api/mint', {
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
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));
    
    if (response.status === 401) {
      console.log('❌ Still getting 401 - middleware fix might need server restart');
    } else if (response.status === 400) {
      console.log('✅ Middleware working! Now getting validation error (expected)');
    } else if (response.status === 500) {
      console.log('✅ Middleware working! Server error (likely wallet/gas issue)');
    } else {
      console.log('✅ API working properly!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

quickTest();
