// Import from the compiled JavaScript files
// @ts-expect-error - Importing from dist
const { initializeDeskAI } = await import('../dist/index.js');

/**
 * Example demonstrating the task chaining feature
 * This shows how to create and execute workflows programmatically
 */
async function workflowExample() {
  console.log('=== DeskAI Workflow Example ===\n');

  // Initialize DeskAI
  const { taskChainManager } = await initializeDeskAI('./out');

  console.log('1. Creating a document processing workflow...');
  const workflow = await taskChainManager.createChain(
    'Document Processing Pipeline',
    'Scan, OCR, summarize and save documents',
    ['document', 'ocr', 'automation']
  );
  console.log(`✓ Created workflow: ${workflow.name} (ID: ${workflow.id})\n`);

  console.log('2. Adding workflow steps...');
  await taskChainManager.addStep(workflow.id, 'scan', 'Scan Document');
  console.log('  ✓ Added step: Scan Document');

  await taskChainManager.addStep(workflow.id, 'ocr', 'Extract Text');
  console.log('  ✓ Added step: Extract Text');

  await taskChainManager.addStep(workflow.id, 'summarize', 'Summarize Content');
  console.log('  ✓ Added step: Summarize Content');

  await taskChainManager.addStep(workflow.id, 'save', 'Save Result', {
    filename: 'processed-document.pdf'
  });
  console.log('  ✓ Added step: Save Result\n');

  console.log('3. Listing all workflows...');
  const allWorkflows = await taskChainManager.listChains();
  console.log(`Found ${allWorkflows.length} workflow(s):`);
  allWorkflows.forEach(w => {
    console.log(`  - ${w.name} (${w.steps.length} steps)`);
  });
  console.log();

  console.log('4. Executing the workflow...');
  const startTime = Date.now();
  const result = await taskChainManager.executeChain(
    workflow.id,
    { document: 'sample-document.pdf', content: 'Sample text to process' }
  );
  const duration = Date.now() - startTime;

  if (result.success) {
    console.log(`✓ Workflow executed successfully in ${duration}ms\n`);
    
    console.log('Step Results:');
    result.stepResults.forEach((stepResult, index) => {
      const step = workflow.steps[index];
      console.log(`  ${index + 1}. ${step.name}:`);
      console.log(`     Status: ${stepResult.success ? 'Success' : 'Failed'}`);
      console.log(`     Duration: ${stepResult.endTime - stepResult.startTime}ms`);
      if (stepResult.output) {
        console.log(`     Output: ${JSON.stringify(stepResult.output, null, 2)}`);
      }
    });
  } else {
    console.log(`✗ Workflow execution failed: ${result.error}`);
  }
  console.log();

  console.log('5. Demonstrating workflow filtering by tags...');
  const documentWorkflows = await taskChainManager.listChains(['document']);
  console.log(`Found ${documentWorkflows.length} workflow(s) tagged with 'document'\n`);

  console.log('6. Available tools:');
  const tools = taskChainManager.getAvailableTools();
  tools.forEach(tool => {
    console.log(`  - ${tool.name} (${tool.type}): ${tool.description}`);
  });
  console.log();

  console.log('=== Example Complete ===');
  console.log('\nThe workflow has been saved to ./out/task-chains.json');
  console.log('You can view and manage it in the DeskAI UI by running: npm run dev');
}

// Run the example
workflowExample().catch(error => {
  console.error('Error running workflow example:', error);
  process.exit(1);
});
