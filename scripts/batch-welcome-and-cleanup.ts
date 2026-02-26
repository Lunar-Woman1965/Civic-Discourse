#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';
import { Resend } from 'resend';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env' });

const prisma = new PrismaClient();
const resend = new Resend(process.env.RESEND_API_KEY);

interface SendResult {
  email: string;
  name: string | null;
  success: boolean;
  emailId?: string;
  error?: string;
}

interface DeleteResult {
  username: string;
  email: string;
  deleted: boolean;
  error?: string;
}

async function sendWelcomeEmail(email: string): Promise<{ success: boolean; emailId?: string; error?: string }> {
  try {
    const response = await resend.emails.send({
      from: 'welcome@bridgingtheaisle.com',
      to: email,
      subject: 'Welcome to Bridging the Aisle!',
      template: {
        id: 'bta-welcome',
      },
    });

    // Resend SDK returns { data: { id: string } } on success
    const emailId = (response as any)?.data?.id || (response as any)?.id || 'unknown';
    return { success: true, emailId };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

async function sendWelcomeToAllVerified(): Promise<SendResult[]> {
  console.log('\n🔍 Fetching all verified users...');
  
  const users = await prisma.user.findMany({
    where: {
      emailVerified: { not: null },
      isActive: true,
      isPermanentlyBanned: false,
    },
    select: {
      id: true,
      email: true,
      name: true,
      username: true,
    },
  });

  console.log(`✅ Found ${users.length} verified users\n`);

  const results: SendResult[] = [];
  let successCount = 0;
  let failCount = 0;

  for (const user of users) {
    console.log(`📧 Sending to: ${user.email} (${user.name || user.username || 'No name'})`);
    
    const result = await sendWelcomeEmail(user.email);
    
    if (result.success) {
      console.log(`   ✅ SUCCESS - Email ID: ${result.emailId}`);
      successCount++;
    } else {
      console.log(`   ❌ FAILED - Error: ${result.error}`);
      failCount++;
    }

    results.push({
      email: user.email,
      name: user.name,
      success: result.success,
      emailId: result.emailId,
      error: result.error,
    });

    // Rate limiting: 100ms delay between sends
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\n📊 WELCOME EMAIL SUMMARY:`);
  console.log(`   Total Users: ${users.length}`);
  console.log(`   Successful: ${successCount}`);
  console.log(`   Failed: ${failCount}`);

  return results;
}

async function deleteTestAccounts(): Promise<DeleteResult[]> {
  console.log('\n\n🗑️  DELETING TEST ACCOUNTS\n');
  
  const testUsernames = ['Moon-Woman', 'Menika'];
  const results: DeleteResult[] = [];

  for (const testUsername of testUsernames) {
    console.log(`🔍 Looking for user: ${testUsername}`);
    
    try {
      // Find user by username (case-insensitive)
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { username: { equals: testUsername, mode: 'insensitive' } },
            { name: { contains: testUsername, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
        },
      });

      if (!user) {
        console.log(`   ⚠️  User not found: ${testUsername}`);
        results.push({
          username: testUsername,
          email: 'N/A',
          deleted: false,
          error: 'User not found',
        });
        continue;
      }

      console.log(`   📧 Found: ${user.email} (${user.name || user.username})`);
      console.log(`   🗑️  Deleting user...`);

      // Delete the user (this will cascade delete related records based on schema)
      await prisma.user.delete({
        where: { id: user.id },
      });

      console.log(`   ✅ DELETED: ${user.email}\n`);
      
      results.push({
        username: testUsername,
        email: user.email,
        deleted: true,
      });
    } catch (error: any) {
      console.log(`   ❌ FAILED: ${error.message}\n`);
      results.push({
        username: testUsername,
        email: 'N/A',
        deleted: false,
        error: error.message,
      });
    }
  }

  console.log(`\n📊 DELETION SUMMARY:`);
  const deletedCount = results.filter(r => r.deleted).length;
  const failedCount = results.filter(r => !r.deleted).length;
  console.log(`   Total Accounts Targeted: ${testUsernames.length}`);
  console.log(`   Deleted: ${deletedCount}`);
  console.log(`   Failed/Not Found: ${failedCount}`);

  return results;
}

async function main() {
  try {
    console.log('='.repeat(60));
    console.log('BATCH WELCOME EMAILS & TEST ACCOUNT CLEANUP');
    console.log('='.repeat(60));

    // Step 1: Send welcome emails to all verified users
    const welcomeResults = await sendWelcomeToAllVerified();

    // Step 2: Delete test accounts
    const deleteResults = await deleteTestAccounts();

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('FINAL SUMMARY');
    console.log('='.repeat(60));
    console.log(`\n✅ Welcome Emails Sent: ${welcomeResults.filter(r => r.success).length}`);
    console.log(`❌ Welcome Emails Failed: ${welcomeResults.filter(r => !r.success).length}`);
    console.log(`\n🗑️  Test Accounts Deleted: ${deleteResults.filter(r => r.deleted).length}`);
    console.log(`⚠️  Accounts Not Found/Failed: ${deleteResults.filter(r => !r.deleted).length}`);
    console.log('\n' + '='.repeat(60));

  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
