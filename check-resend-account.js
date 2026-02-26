const https = require('https');

const apiKey = 're_bzdo6gz4_MGur21ju17hM8SdaDhyEveug';

const options = {
  hostname: 'api.resend.com',
  path: '/domains',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  }
};

console.log('🔍 Checking Resend account details...\n');

const req = https.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Response Status:', res.statusCode);
    console.log('\nResponse Data:');
    try {
      const parsed = JSON.parse(data);
      console.log(JSON.stringify(parsed, null, 2));
    } catch (e) {
      console.log(data);
    }
  });
});

req.on('error', (e) => {
  console.error('Request Error:', e);
});

req.end();
