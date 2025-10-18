import { initializeDeskAI } from '../dist/index.js';

/**
 * Learning mode example for DeskAI
 * 
 * This example demonstrates:
 * - Enabling/disabling learning mode
 * - Tracking user actions
 * - Generating adaptive suggestions
 * - Viewing learning statistics
 * - Managing learning data
 */

async function learningModeExample() {
  console.log('=== DeskAI Learning Mode Example ===\n');

  // Initialize DeskAI with a custom data directory
  console.log('1. Initializing DeskAI...');
  const { memory, agent, learning } = await initializeDeskAI('./examples/data');
  console.log('✓ DeskAI initialized with learning mode\n');

  // Check if learning is enabled
  console.log('2. Checking learning mode status...');
  const isEnabled = learning.isEnabled();
  console.log(`✓ Learning mode is: ${isEnabled ? 'ENABLED' : 'DISABLED'}\n`);

  // Enable learning mode if not already enabled
  if (!isEnabled) {
    console.log('3. Enabling learning mode...');
    await learning.setEnabled(true);
    console.log('✓ Learning mode enabled\n');
  }

  // Simulate user interactions
  console.log('4. Simulating user interactions...');
  
  // Start a conversation with tags
  const conv1 = await agent.startConversation('Work Discussion', ['work', 'project']);
  console.log('✓ Started conversation about work');
  
  await agent.processMessage('How do I improve productivity?');
  await agent.processMessage('Show me my analytics');
  console.log('✓ Sent messages and viewed analytics');
  
  // Start another conversation
  const conv2 = await agent.startConversation('Personal Notes', ['personal']);
  await agent.processMessage('What are my recent conversations?');
  console.log('✓ Started another conversation\n');

  // Create a pattern by repeating actions
  console.log('5. Creating usage patterns...');
  for (let i = 0; i < 3; i++) {
    await agent.processMessage(`Message ${i + 1}`);
    // Simulate viewing analytics
    await learning.trackAction('view_analytics');
    // Simulate search
    await learning.trackAction('search', { query: 'test' });
  }
  console.log('✓ Created repeating workflow pattern\n');

  // Get learning statistics
  console.log('6. Getting learning statistics...');
  const stats = await learning.getStatistics();
  console.log(`✓ Learning Statistics:`);
  console.log(`  - Total actions tracked: ${stats.totalActions}`);
  console.log(`  - Tools monitored: ${stats.toolsTracked}`);
  console.log(`  - Workflows detected: ${stats.workflowsDetected}`);
  console.log(`  - Topics tracked: ${stats.topicsTracked}`);
  console.log();

  // Generate adaptive suggestions
  console.log('7. Generating adaptive suggestions...');
  const suggestions = await learning.generateSuggestions(5);
  console.log(`✓ Generated ${suggestions.length} suggestion(s):`);
  suggestions.forEach((suggestion, idx) => {
    console.log(`  ${idx + 1}. [${suggestion.type.toUpperCase()}] ${suggestion.content}`);
    console.log(`     Confidence: ${(suggestion.confidence * 100).toFixed(0)}% | ${suggestion.reasoning}`);
  });
  console.log();

  // Get detailed learning data
  console.log('8. Viewing detailed learning data...');
  const data = await learning.getLearningData();
  
  if (data.toolUsage.length > 0) {
    console.log('✓ Tool Usage Patterns:');
    data.toolUsage.slice(0, 5).forEach(tool => {
      console.log(`  - ${tool.toolName}: ${tool.usageCount} uses`);
    });
    console.log();
  }

  if (data.workflows.length > 0) {
    console.log('✓ Common Workflows:');
    data.workflows.slice(0, 3).forEach(workflow => {
      console.log(`  - ${workflow.sequence.join(' → ')}`);
      console.log(`    Frequency: ${workflow.frequency} times`);
    });
    console.log();
  }

  if (data.frequentTopics.length > 0) {
    console.log('✓ Frequent Topics:');
    data.frequentTopics.slice(0, 5).forEach(topic => {
      console.log(`  - ${topic.topic}: ${topic.count} occurrences`);
    });
    console.log();
  }

  // Demonstrate disabling learning
  console.log('9. Disabling learning mode...');
  await learning.setEnabled(false);
  console.log('✓ Learning mode disabled');
  console.log('  Note: Actions will no longer be tracked until re-enabled\n');

  // Re-enable for cleanup demonstration
  await learning.setEnabled(true);
  console.log('10. Re-enabled learning mode\n');

  // Optional: Clear learning data (commented out by default)
  // console.log('11. Clearing learning data...');
  // await learning.reset();
  // console.log('✓ All learning data has been reset\n');

  console.log('=== Example Complete ===');
  console.log('Learning data saved to: ./examples/data/learning.json');
  console.log('\nPrivacy Note: All learning happens locally on your device.');
  console.log('No data is ever sent to external servers.');
}

// Run the example if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  learningModeExample().catch(console.error);
}

export { learningModeExample };
