const { Resend } = require('resend');

const apiKey = process.env.RESEND_API_KEY || 're_bzdo6gz4_MGur21ju17hM8SdaDhyEveug';
const resend = new Resend(apiKey);

async function testEmail() {
  try {
    console.log('🔍 Testing Resend API configuration...');
    console.log('📧 API Key:', apiKey.substring(0, 10) + '...');
    
    const { data, error } = await resend.emails.send({
      from: 'Bridging the Aisle <noreply@bridgingtheaisle.com>',
      to: ['test@example.com'], // This will fail but show us the error
      subject: 'Test Email',
      html: '<p>Test</p>',
    });

    if (error) {
      console.error('❌ Resend API Error:', error);
    } else {
      console.log('✅ Email sent successfully:', data);
    }
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

testEmail();
