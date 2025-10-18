import { initializeDeskAI } from '../dist/index.js';

/**
 * Router API usage example
 * 
 * Demonstrates using the Router API to interact with DeskAI
 */

async function routerApiExample() {
  console.log('=== DeskAI Router API Example ===\n');

  const { router } = await initializeDeskAI('./examples/data');

  // Start a conversation
  console.log('1. Starting conversation via router...');
  const startResult = await router.handleRequest({
    action: 'startConversation',
    params: { title: 'Router API Demo', tags: ['api', 'router'] }
  });
  console.log(`✓ ${startResult.success ? 'Success' : 'Failed'}`);
  if (startResult.data) {
    console.log(`  Conversation ID: ${(startResult.data as { conversationId: string }).conversationId}\n`);
  }

  // Send a message
  console.log('2. Sending message via router...');
  const messageResult = await router.handleRequest({
    action: 'message',
    params: { message: 'Hello from the router API!' }
  });
  console.log(`✓ ${messageResult.success ? 'Success' : 'Failed'}`);
  if (messageResult.data) {
    const data = messageResult.data as { response: string };
    console.log(`  Response: ${data.response}\n`);
  }

  // List conversations
  console.log('3. Listing conversations via router...');
  const listResult = await router.handleRequest({
    action: 'listConversations'
  });
  console.log(`✓ ${listResult.success ? 'Success' : 'Failed'}`);
  if (listResult.data) {
    const data = listResult.data as { conversations: Array<{ title: string; messageCount: number }> };
    console.log(`  Found ${data.conversations.length} conversation(s)\n`);
  }

  // Search conversations
  console.log('4. Searching via router...');
  const searchResult = await router.handleRequest({
    action: 'searchConversations',
    params: { query: 'router' }
  });
  console.log(`✓ ${searchResult.success ? 'Success' : 'Failed'}`);
  if (searchResult.data) {
    const data = searchResult.data as { results: Array<unknown> };
    console.log(`  Found ${data.results.length} result(s)\n`);
  }

  // Get analytics
  console.log('5. Getting analytics via router...');
  const analyticsResult = await router.handleRequest({
    action: 'getAnalytics'
  });
  console.log(`✓ ${analyticsResult.success ? 'Success' : 'Failed'}`);
  if (analyticsResult.data) {
    const data = analyticsResult.data as { 
      analytics: { 
        totalConversations: number; 
        totalMessages: number;
      } 
    };
    console.log(`  Total conversations: ${data.analytics.totalConversations}`);
    console.log(`  Total messages: ${data.analytics.totalMessages}\n`);
  }

  // Test error handling
  console.log('6. Testing error handling...');
  const errorResult = await router.handleRequest({
    action: 'unknown_action'
  });
  console.log(`✓ Error handling works: ${!errorResult.success ? 'Yes' : 'No'}`);
  if (errorResult.error) {
    console.log(`  Error message: ${errorResult.error}\n`);
  }

  console.log('=== Router API Example Complete ===');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  routerApiExample().catch(console.error);
}

export { routerApiExample };
