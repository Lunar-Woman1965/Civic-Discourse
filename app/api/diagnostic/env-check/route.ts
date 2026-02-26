import { NextResponse } from 'next/server';

export async function GET() {
  // Check critical environment variables WITHOUT exposing their values
  const envCheck = {
    BLUESKY_APP_PASSWORD_exists: !!process.env.BLUESKY_APP_PASSWORD,
    BLUESKY_APP_PASSWORD_length: process.env.BLUESKY_APP_PASSWORD?.length || 0,
    BLUESKY_APP_PASSWORD_format_valid: process.env.BLUESKY_APP_PASSWORD 
      ? /^[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}$/.test(process.env.BLUESKY_APP_PASSWORD)
      : false,
    DATABASE_URL_exists: !!process.env.DATABASE_URL,
    NEXTAUTH_SECRET_exists: !!process.env.NEXTAUTH_SECRET,
    NODE_ENV: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  };
  
  return NextResponse.json(envCheck);
}
