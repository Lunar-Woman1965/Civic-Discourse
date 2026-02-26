#!/usr/bin/env tsx

// Load environment variables FIRST
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env' });

async function testWelcomeTemplate() {
  console.log('\n=== Testing Welcome Email with Resend Template ===\n');
  console.log('Template ID: bta-welcome');
  console.log('Test Email: lmhansen26062@ymail.com\n');

  // Import AFTER env vars are loaded
  const { sendWelcomeEmail } = await import('./lib/resend');

  try {
    const result = await sendWelcomeEmail('lmhansen26062@ymail.com');
    
    if (result.success) {
      console.log('\n✅ SUCCESS: Welcome email sent using template bta-welcome');
      console.log('Email ID:', (result.data as any)?.data?.id || (result.data as any)?.id || 'N/A');
      console.log('\n📧 Check your Resend dashboard at: https://resend.com/emails');
      console.log('   Look for the email sent to lmhansen26062@ymail.com');
      console.log('   Verify it uses the "bta-welcome" template\n');
    } else {
      console.log('\n❌ FAILED: Could not send welcome email');
      console.log('Error:', result.error);
    }
  } catch (error: any) {
    console.error('\n❌ EXCEPTION:', error.message || error);
  }
}

testWelcomeTemplate();
