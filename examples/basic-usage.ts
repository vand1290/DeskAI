import { initializeDeskAI } from '../dist/index.js';

/**
 * Basic usage example for DeskAI memory system
 * 
 * This example demonstrates:
 * - Initializing the system
 * - Creating conversations
 * - Sending messages
 * - Retrieving conversation history
 * - Searching conversations
 * - Getting analytics
 */

async function basicUsageExample() {
  console.log('=== DeskAI Basic Usage Example ===\n');

  // Initialize DeskAI with a custom data directory
  console.log('1. Initializing DeskAI...');
  const { memory, agent } = await initializeDeskAI('./examples/data');
  console.log('✓ DeskAI initialized\n');

  // Start a new conversation
  console.log('2. Starting a new conversation...');
  const conversationId = await agent.startConversation('Demo Conversation', ['demo', 'example']);
  console.log(`✓ Started conversation: ${conversationId}\n`);

  // Send some messages
  console.log('3. Sending messages...');
  
  const response1 = await agent.processMessage('Hello, DeskAI!');
  console.log(`User: Hello, DeskAI!`);
  console.log(`Agent: ${response1.content}\n`);

  const response2 = await agent.processMessage('Can you help me understand how memory works?');
  console.log(`User: Can you help me understand how memory works?`);
  console.log(`Agent: ${response2.content}\n`);

  // Get conversation history
  console.log('4. Retrieving conversation history...');
  const history = await agent.getConversationHistory();
  console.log(`✓ Retrieved ${history.length} messages\n`);

  // List all conversations
  console.log('5. Listing all conversations...');
  const conversations = await memory.listConversations();
  console.log(`✓ Found ${conversations.length} conversation(s):`);
  conversations.forEach(conv => {
    console.log(`  - ${conv.title} (${conv.messageCount} messages, tags: ${conv.tags?.join(', ') || 'none'})`);
  });
  console.log();

  // Search for content
  console.log('6. Searching conversations...');
  const searchResults = await memory.searchConversations('memory');
  console.log(`✓ Found ${searchResults.length} message(s) containing "memory"\n`);

  // Get analytics
  console.log('7. Getting analytics...');
  const analytics = await memory.getAnalytics();
  console.log(`✓ Analytics:`);
  console.log(`  - Total conversations: ${analytics.totalConversations}`);
  console.log(`  - Total messages: ${analytics.totalMessages}`);
  console.log(`  - Average messages per conversation: ${analytics.averageMessagesPerConversation.toFixed(1)}`);
  if (analytics.frequentTopics.length > 0) {
    console.log(`  - Frequent topics: ${analytics.frequentTopics.map(t => `${t.topic} (${t.count})`).join(', ')}`);
  }
  console.log();

  // Export conversations
  console.log('8. Exporting conversations...');
  const exported = await memory.exportConversations();
  console.log(`✓ Exported ${exported.length} conversation(s)\n`);

  console.log('=== Example Complete ===');
  console.log('All data saved to: ./examples/data/conversations.json');
}

// Run the example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  basicUsageExample().catch(console.error);
}

export { basicUsageExample };
