/**
 * Diagnostic script to check if a Bluesky account exists
 */

import { BskyAgent } from '@atproto/api';

const handle = 'bta-broadcast.bsky.social';

async function checkBlueskyAccount() {
  console.log(`\n🔍 Checking Bluesky account: ${handle}`);
  console.log('='.repeat(60));
  
  const agent = new BskyAgent({ service: 'https://bsky.social' });
  
  try {
    // Try to resolve handle to DID
    const resolved = await agent.resolveHandle({ handle });
    console.log('✅ Account EXISTS!');
    console.log(`   Handle: ${handle}`);
    console.log(`   DID: ${resolved.data.did}`);
    
    // Try to get profile
    const profile = await agent.getProfile({ actor: resolved.data.did });
    console.log(`   Display Name: ${profile.data.displayName || 'Not set'}`);
    console.log(`   Description: ${profile.data.description || 'Not set'}`);
    console.log(`   Posts: ${profile.data.postsCount || 0}`);
    console.log(`   Followers: ${profile.data.followersCount || 0}`);
    console.log(`   Following: ${profile.data.followsCount || 0}`);
    
    return true;
  } catch (error: any) {
    if (error.message?.includes('Unable to resolve handle')) {
      console.log('❌ Account DOES NOT EXIST');
      console.log('   This handle has not been created on Bluesky yet.');
    } else {
      console.log('❌ Error checking account:', error.message);
    }
    return false;
  }
}

checkBlueskyAccount()
  .then((exists) => {
    if (!exists) {
      console.log('\n💡 Next Steps:');
      console.log('   1. Go to https://bsky.app');
      console.log('   2. Sign up with email: bta-social.sharing@bridgingtheaisle.com');
      console.log('   3. Choose handle: bta-broadcast');
      console.log('   4. Complete account setup');
      console.log('   5. Generate app password in Settings → Privacy and Security → App Passwords');
      console.log('\n   Then try connecting again in BTA!');
    } else {
      console.log('\n💡 Account exists! If connection still fails:');
      console.log('   1. Double-check you\'re using the EXACT email you used for Bluesky signup');
      console.log('   2. Verify the app password is correct (xxxx-xxxx-xxxx-xxxx format)');
      console.log('   3. Try generating a NEW app password');
      console.log('   4. Make sure you\'re logged into BTA as bta-social.sharing@bridgingtheaisle.com');
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
