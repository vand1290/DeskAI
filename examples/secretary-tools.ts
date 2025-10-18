/**
 * Example: Using DeskAI Secretary Tools
 * 
 * This example demonstrates the new secretary tools:
 * - Writing Tool: Create and manage text documents
 * - Photo Tool: Image info and OCR (stub)
 * - Document Tool: Summarize and extract data
 * - File Sorting: Organize files by various criteria
 */

import { initializeDeskAI } from '../src/index.js';
import * as path from 'path';

async function main() {
  console.log('=== DeskAI Secretary Tools Example ===\n');

  // Initialize DeskAI with a test data directory
  const dataDir = path.join(process.cwd(), 'examples', 'data');
  const { router } = await initializeDeskAI(dataDir);

  console.log('✓ DeskAI initialized\n');

  // 1. Writing Tool - Create a document
  console.log('1️⃣  Writing Tool - Creating a document...');
  const createResult = await router.handleRequest({
    action: 'createDocument',
    params: {
      filename: 'meeting-notes.txt',
      content: `Meeting Notes - October 18, 2025

Attendees:
- Alice (alice@company.com)
- Bob (bob@company.com)
- Carol (carol@company.com)

Action Items:
1. Review Q4 budget by 10/25/2025
2. Schedule follow-up meeting
3. Contact vendor at 555-123-4567

Next Meeting: 11/01/2025`
    }
  });
  
  if (createResult.success) {
    console.log('✓ Document created:', (createResult.data as any).filename);
  } else {
    console.log('✗ Error:', createResult.error);
  }
  console.log();

  // 2. Document Tool - Get document info
  console.log('2️⃣  Document Tool - Getting document info...');
  const infoResult = await router.handleRequest({
    action: 'getDocumentInfo',
    params: { filename: 'meeting-notes.txt' }
  });
  
  if (infoResult.success) {
    const info = infoResult.data as any;
    console.log(`✓ Document info:
   - Size: ${info.size} bytes
   - Words: ${info.wordCount}
   - Lines: ${info.lineCount}`);
  }
  console.log();

  // 3. Document Tool - Extract structured data
  console.log('3️⃣  Document Tool - Extracting data (emails, dates, phones)...');
  const extractResult = await router.handleRequest({
    action: 'extractData',
    params: { filename: 'meeting-notes.txt' }
  });
  
  if (extractResult.success) {
    const extracted = (extractResult.data as any).extracted;
    console.log('✓ Extracted data:');
    console.log('   Emails:', extracted.emails);
    console.log('   Dates:', extracted.dates);
    console.log('   Phones:', extracted.phones);
  }
  console.log();

  // 4. Document Tool - Summarize
  console.log('4️⃣  Document Tool - Summarizing document...');
  const summaryResult = await router.handleRequest({
    action: 'summarizeDocument',
    params: { filename: 'meeting-notes.txt' }
  });
  
  if (summaryResult.success) {
    const summary = summaryResult.data as any;
    console.log('✓ Summary created:');
    console.log('   Original length:', summary.originalLength, 'chars');
    console.log('   Summary length:', summary.summaryLength, 'chars');
    console.log('\n   Summary:');
    console.log('   ' + summary.summary.split('\n').join('\n   '));
  }
  console.log();

  // 5. Writing Tool - Create another document
  console.log('5️⃣  Writing Tool - Creating another document...');
  await router.handleRequest({
    action: 'createDocument',
    params: {
      filename: 'project-plan.txt',
      content: 'Project Plan: New Feature Implementation\n\nTimeline: Q4 2025\nBudget: $50,000'
    }
  });
  console.log('✓ Second document created');
  console.log();

  // 6. Writing Tool - List all documents
  console.log('6️⃣  Writing Tool - Listing all documents...');
  const listResult = await router.handleRequest({
    action: 'listDocuments'
  });
  
  if (listResult.success) {
    const docs = (listResult.data as any).documents;
    console.log(`✓ Found ${docs.length} documents:`);
    docs.forEach((doc: any) => {
      console.log(`   - ${doc.filename} (${doc.size} bytes)`);
    });
  }
  console.log();

  // 7. File Sorting - Sort files by name
  console.log('7️⃣  File Sorting - Sorting files by name...');
  const sortResult = await router.handleRequest({
    action: 'sortFiles',
    params: {
      directory: path.join(dataDir, 'documents'),
      criteria: { by: 'name', order: 'asc' }
    }
  });
  
  if (sortResult.success) {
    const sorted = sortResult.data as any;
    console.log(`✓ Sorted ${sorted.fileCount} files by name:`);
    sorted.files.forEach((file: any) => {
      console.log(`   ${file.filename}`);
    });
  }
  console.log();

  // 8. File Sorting - Organize by type
  console.log('8️⃣  File Sorting - Organizing files by type...');
  const organizeResult = await router.handleRequest({
    action: 'organizeByType',
    params: {
      directory: path.join(dataDir, 'documents')
    }
  });
  
  if (organizeResult.success) {
    const organized = organizeResult.data as any;
    console.log(`✓ Organized into ${organized.groupCount} type groups:`);
    Object.entries(organized.groups).forEach(([type, files]: [string, any]) => {
      console.log(`   ${type}: ${files.length} files`);
    });
  }
  console.log();

  // 9. Photo Tool - Extract text (stub demonstration)
  console.log('9️⃣  Photo Tool - OCR extraction (stub)...');
  const ocrResult = await router.handleRequest({
    action: 'extractTextFromImage',
    params: { filename: 'sample.jpg' }
  });
  
  if (ocrResult.success) {
    const ocr = ocrResult.data as any;
    console.log('✓ OCR stub response:');
    console.log('   Message:', ocr.message);
    console.log('   (This is a placeholder - real OCR would use Tesseract)');
  } else {
    console.log('ℹ️  OCR stub - file not found (expected for demo)');
  }
  console.log();

  // 10. Handwriting Recognition - Extract handwriting (stub demonstration)
  console.log('🔟 Handwriting Tool - HTR extraction (stub)...');
  const htrResult = await router.handleRequest({
    action: 'extractHandwriting',
    params: { filename: 'handwritten-note.jpg' }
  });
  
  if (htrResult.success) {
    const htr = htrResult.data as any;
    console.log('✓ HTR stub response:');
    console.log('   Message:', htr.message);
    console.log('   (This is a placeholder - real HTR would use TrOCR)');
  }
  console.log();

  // 11. Reading a document
  console.log('1️⃣1️⃣ Writing Tool - Reading a document...');
  const readResult = await router.handleRequest({
    action: 'readDocument',
    params: { filename: 'meeting-notes.txt' }
  });
  
  if (readResult.success) {
    const doc = readResult.data as any;
    console.log('✓ Document read successfully');
    console.log(`   Content preview: ${doc.content.substring(0, 50)}...`);
  }
  console.log();

  console.log('=== All Secretary Tools Demonstrated ===');
  console.log('\nKey Features:');
  console.log('✓ Writing Tool - Create, edit, read, list, delete documents');
  console.log('✓ Photo Tool - Image info, OCR text extraction (stub)');
  console.log('✓ Document Tool - Summarize, extract data, get metadata');
  console.log('✓ Handwriting Tool - HTR extraction (stub)');
  console.log('✓ File Sorting - Sort by criteria, organize by date/type');
  console.log('\n💾 Documents saved in:', path.join(dataDir, 'documents'));
  console.log('🔒 All operations are 100% offline and secure\n');
}

main().catch(console.error);
