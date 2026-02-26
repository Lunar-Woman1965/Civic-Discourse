
import twilio from 'twilio';

// Initialize Twilio client
export function getTwilioClient() {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  
  if (!accountSid || !authToken) {
    throw new Error('Twilio credentials not configured');
  }
  
  return twilio(accountSid, authToken);
}

// Send verification code via SMS
export async function sendVerificationCode(phone: string, code: string): Promise<boolean> {
  try {
    const client = getTwilioClient();
    const from = process.env.TWILIO_PHONE_NUMBER;
    
    if (!from) {
      throw new Error('Twilio phone number not configured');
    }
    
    await client.messages.create({
      body: `Your Bridging the Aisle verification code is: ${code}. This code expires in 10 minutes.`,
      from,
      to: phone,
    });
    
    return true;
  } catch (error) {
    console.error('Error sending verification code:', error);
    return false;
  }
}

// Generate 6-digit verification code
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
