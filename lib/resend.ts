import { Resend } from 'resend';

if (!process.env.RESEND_API_KEY) {
  throw new Error('RESEND_API_KEY is not set in environment variables');
}

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send welcome email using Resend template
 * Uses custom template: bta-welcome (from Resend dashboard)
 */
export async function sendWelcomeEmail(email: string) {
  try {
    const response = await resend.emails.send({
      from: 'Welcome <welcome@bridgingtheaisle.com>',
      to: email,
      subject: 'Welcome to Bridging the Aisle!',
      template: {
        id: 'bta-welcome',
      },
    } as any);

    console.log('✅ Welcome email sent successfully via Resend template (bta-welcome):', response);
    return { success: true, data: response };
  } catch (error: any) {
    console.error('❌ Failed to send welcome email using template bta-welcome:', error);
    console.error('Error details:', error.message || error);
    return { success: false, error };
  }
}

/**
 * Send verification email using inline HTML
 * Note: Resend templates exist in dashboard but inline HTML is more reliable
 */
export async function sendVerificationEmail(email: string, firstName: string, verificationUrl: string) {
  try {
    const response = await resend.emails.send({
      from: 'Bridging the Aisle <email_verification@bridgingtheaisle.com>',
      to: email,
      subject: 'Verify Your Email - Bridging the Aisle',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Verify Your Email</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #14b8a6; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0;">Verify Your Email ✉️</h1>
            </div>
            <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
              <p style="font-size: 16px;">Hello${firstName ? ` ${firstName}` : ''},</p>
              <p>Thank you for signing up for Bridging the Aisle! To complete your registration, please verify your email address by clicking the button below:</p>
              <p style="margin: 30px 0; text-align: center;">
                <a href="${verificationUrl}" style="background-color: #14b8a6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Verify My Email</a>
              </p>
              <p style="font-size: 14px; color: #666;">
                Or copy and paste this link into your browser:<br>
                <a href="${verificationUrl}" style="color: #14b8a6; word-break: break-all;">${verificationUrl}</a>
              </p>
              <p style="margin-top: 30px; font-size: 14px; color: #666; border-top: 1px solid #ddd; padding-top: 20px;">
                This verification link will expire in 24 hours.<br><br>
                If you didn't create an account with Bridging the Aisle, you can safely ignore this email.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log('✅ Verification email sent successfully via Resend:', response);
    return { success: true, data: response };
  } catch (error: any) {
    console.error('❌ Failed to send verification email:', error);
    console.error('Error details:', error.message || error);
    return { success: false, error };
  }
}

/**
 * Send password reset email using inline HTML
 * Note: Resend templates exist in dashboard but inline HTML is more reliable
 */
export async function sendPasswordResetEmail(email: string, firstName: string, resetUrl: string) {
  try {
    const response = await resend.emails.send({
      from: 'Bridging the Aisle <password_reset@bridgingtheaisle.com>',
      to: email,
      subject: 'Reset Your Password - Bridging the Aisle',
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <title>Reset Your Password</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #14b8a6; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: white; margin: 0;">Reset Your Password 🔒</h1>
            </div>
            <div style="background-color: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px;">
              <p style="font-size: 16px;">Hello${firstName ? ` ${firstName}` : ''},</p>
              <p>We received a request to reset your password for your Bridging the Aisle account. Click the button below to create a new password:</p>
              <p style="margin: 30px 0; text-align: center;">
                <a href="${resetUrl}" style="background-color: #14b8a6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: bold;">Reset Password</a>
              </p>
              <p style="font-size: 14px; color: #666;">
                Or copy and paste this link into your browser:<br>
                <a href="${resetUrl}" style="color: #14b8a6; word-break: break-all;">${resetUrl}</a>
              </p>
              <p style="margin-top: 30px; font-size: 14px; color: #666; border-top: 1px solid #ddd; padding-top: 20px;">
                This password reset link will expire in 1 hour.<br><br>
                If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    console.log('✅ Password reset email sent successfully via Resend:', response);
    return { success: true, data: response };
  } catch (error: any) {
    console.error('❌ Failed to send password reset email:', error);
    console.error('Error details:', error.message || error);
    return { success: false, error };
  }
}