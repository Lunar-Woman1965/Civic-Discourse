import { BskyAgent } from '@atproto/api';

async function testHandle(identifier: string, appPassword: string) {
  const agent = new BskyAgent({ service: 'https://bsky.social' });
  
  console.log(`\nTrying identifier: ${identifier}`);
  try {
    const loginResult = await agent.login({ identifier, password: appPassword });
    console.log(`✅ SUCCESS! Handle: ${loginResult.data.handle}, DID: ${loginResult.data.did}`);
    return true;
  } catch (error: any) {
    console.log(`❌ Failed: ${error.message}`);
    return false;
  }
}

async function testMultipleHandles() {
  const appPassword = 'm7lf-rtjp-dirc-7j3k';
  
  const identifiers = [
    'bta-social.sharing@bridgingtheaisle.com',
    'bta-social.sharing',
    'bta-social.sharing.bsky.social',
    'bridgingtheaisle.com'
  ];
  
  for (const identifier of identifiers) {
    const success = await testHandle(identifier, appPassword);
    if (success) {
      console.log('\n🎉 Found working identifier!');
      break;
    }
  }
}

testMultipleHandles().catch(console.error);
