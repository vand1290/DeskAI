/**
 * Scan-to-Search Feature Example
 * 
 * This example demonstrates how to use the scan-to-search functionality
 * to process scanned documents, extract information, and search through them.
 */

import { initializeDeskAI } from '../dist/index.js';
import * as path from 'path';

async function main() {
  console.log('=== DeskAI Scan-to-Search Example ===\n');

  // Initialize DeskAI
  const dataDir = './out-scan-example';
  const { memory, scanProcessor, router } = await initializeDeskAI(dataDir);

  console.log('✓ DeskAI initialized\n');

  // Example 1: Create a sample conversation
  console.log('1. Creating a sample conversation...');
  const conv = await memory.createConversation('Project Alpha Invoice Discussion', ['project', 'invoice']);
  await memory.addMessage(conv.id, 'user', 'We need to review the invoice from John Smith for Project Alpha');
  await memory.addMessage(conv.id, 'agent', 'I can help you review the invoice. Please provide the details.');
  await memory.addMessage(conv.id, 'user', 'The invoice is dated January 15, 2024 and totals $5,250.00');
  console.log(`✓ Created conversation: "${conv.title}"\n`);

  // Example 2: Simulate processing a scanned invoice
  // Note: In a real scenario, you would use an actual image file
  console.log('2. Simulating scan processing...');
  console.log('   (In production, you would upload an actual image file)\n');

  // Create a mock scan document directly (skipping actual OCR for this example)
  const mockScan = {
    id: `scan-${Date.now()}`,
    filename: 'invoice_project_alpha.jpg',
    extractedText: `INVOICE

From: John Smith Consulting
123 Business Street
New York, NY 10001

To: ABC Company
456 Corporate Ave
Boston, MA 02101

Invoice Number: INV-2024-001
Date: January 15, 2024
Due Date: January 30, 2024

Description: Consulting Services - Project Alpha
Hours: 35 @ $150/hour

Subtotal: $5,250.00
Tax (0%): $0.00
Total Due: $5,250.00

Payment Terms: Net 15 days
Please remit payment to: accounts@johnsmith.com`,
    metadata: {
      names: ['John Smith', 'ABC Company'],
      dates: ['January 15, 2024', 'January 30, 2024'],
      totals: ['$5,250.00', '$150', '$0.00'],
      keywords: ['invoice', 'consulting', 'project', 'alpha', 'payment', 'services']
    },
    uploadedAt: Date.now(),
    filePath: path.join(dataDir, 'scans', 'mock_invoice.jpg'),
    linkedConversations: []
  };

  await memory.addScan(mockScan);
  console.log(`✓ Processed scan: "${mockScan.filename}"`);
  console.log(`  - Found ${mockScan.metadata.names.length} names`);
  console.log(`  - Found ${mockScan.metadata.dates.length} dates`);
  console.log(`  - Found ${mockScan.metadata.totals.length} amounts`);
  console.log(`  - Found ${mockScan.metadata.keywords.length} keywords\n`);

  // Example 3: Get suggested conversations for the scan
  console.log('3. Finding related conversations...');
  const suggestions = await memory.getSuggestedConversations(mockScan.id, 5);
  console.log(`✓ Found ${suggestions.length} related conversation(s):`);
  suggestions.forEach((suggestion, idx) => {
    console.log(`   ${idx + 1}. "${suggestion.title}" (${suggestion.messageCount} messages)`);
  });
  console.log();

  // Example 4: Link the scan to the conversation
  if (suggestions.length > 0) {
    console.log('4. Linking scan to conversation...');
    const linked = await memory.linkScanToConversation(mockScan.id, suggestions[0].id);
    console.log(`✓ Linked: ${linked}\n`);
  }

  // Example 5: Search for scans
  console.log('5. Searching scans...');
  
  const searchQueries = ['John Smith', '$5,250', 'January 2024', 'Project Alpha'];
  
  for (const query of searchQueries) {
    const results = await memory.searchScans(query);
    console.log(`   Query: "${query}"`);
    console.log(`   Results: ${results.length} match(es)`);
    if (results.length > 0) {
      results.forEach((result, idx) => {
        console.log(`     ${idx + 1}. ${result.filename} (score: ${result.score.toFixed(1)})`);
        result.matches.slice(0, 2).forEach(match => {
          console.log(`        - ${match.type}: ${match.value}`);
        });
      });
    }
    console.log();
  }

  // Example 6: List all scans
  console.log('6. Listing all scans...');
  const allScans = await memory.listScans();
  console.log(`✓ Total scans: ${allScans.length}`);
  allScans.forEach((scan, idx) => {
    console.log(`   ${idx + 1}. ${scan.filename}`);
    console.log(`      Uploaded: ${new Date(scan.uploadedAt).toLocaleString()}`);
    console.log(`      Text length: ${scan.extractedText.length} characters`);
  });
  console.log();

  // Example 7: Using the Router API
  console.log('7. Using Router API...');
  
  // Search via router
  const searchResponse = await router.handleRequest({
    action: 'searchScans',
    params: { query: 'invoice' }
  });
  
  if (searchResponse.success) {
    const data = searchResponse.data as { results: any[] };
    console.log(`✓ Router search found ${data.results.length} result(s)\n`);
  }

  // Get suggested conversations via router
  const suggestionsResponse = await router.handleRequest({
    action: 'getSuggestedConversations',
    params: { scanId: mockScan.id, limit: 3 }
  });
  
  if (suggestionsResponse.success) {
    const data = suggestionsResponse.data as { suggestions: any[] };
    console.log(`✓ Router found ${data.suggestions.length} suggestion(s)\n`);
  }

  // Example 8: Export data
  console.log('8. Exporting data...');
  const exportedConversations = await memory.exportConversations();
  const exportedScans = await memory.listScans();
  console.log(`✓ Exported ${exportedConversations.length} conversation(s)`);
  console.log(`✓ Exported ${exportedScans.length} scan(s)\n`);

  // Display summary
  console.log('=== Summary ===');
  const analytics = await memory.getAnalytics();
  console.log(`Total Conversations: ${analytics.totalConversations}`);
  console.log(`Total Messages: ${analytics.totalMessages}`);
  console.log(`Total Scans: ${allScans.length}`);
  console.log(`\nData stored in: ${dataDir}/`);
  console.log(`  - conversations.json: Conversation data`);
  console.log(`  - scans.json: Scan metadata`);
  console.log(`  - scans/: Scanned document files`);

  console.log('\n✓ Example completed successfully!\n');
}

// Run the example
main().catch(error => {
  console.error('Error running example:', error);
  process.exit(1);
});
