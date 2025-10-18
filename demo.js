#!/usr/bin/env node

/**
 * Demo script to showcase DeskAI Scan-to-Search capabilities
 * This script demonstrates the API without requiring actual image files
 */

import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3001/api';

// Sample documents with OCR-like extracted text
const sampleDocuments = [
  {
    fileName: 'invoice-2024-01-15.jpg',
    extractedText: `INVOICE
Invoice #: INV-2024-001
Date: January 15, 2024

Bill To:
John Smith
123 Main Street
New York, NY 10001

Items:
1. Professional Services - $1,500.00
2. Consulting Fee - $750.00
3. Software License - $250.00

Subtotal: $2,500.00
Tax (8%): $200.00
Total Due: $2,700.00

Payment Terms: Net 30
Due Date: February 15, 2024`,
    metadata: { confidence: 95.5, wordCount: 85, lineCount: 22 }
  },
  {
    fileName: 'contract-acme-corp.jpg',
    extractedText: `SERVICE AGREEMENT

This Service Agreement ("Agreement") is entered into on January 20, 2024
between Acme Corporation and DeskAI Services.

Client: Acme Corporation
Address: 456 Business Ave, San Francisco, CA 94102
Contact: Jane Doe, CEO

Service Provider: DeskAI Services
Project Start Date: February 1, 2024
Project End Date: July 31, 2024

Total Contract Value: $50,000.00
Payment Schedule: Monthly installments of $8,333.33

Terms and Conditions:
1. Services will be provided as outlined in Exhibit A
2. Payment due within 15 days of invoice
3. Either party may terminate with 30 days notice`,
    metadata: { confidence: 92.3, wordCount: 120, lineCount: 25 }
  },
  {
    fileName: 'receipt-office-supplies.jpg',
    extractedText: `Office Depot Receipt
Store #1542
789 Commerce Blvd

Date: January 10, 2024
Time: 14:35

Items Purchased:
- Copy Paper (10 reams) - $45.99
- Pens (Box of 50) - $12.99
- Stapler - $8.99
- File Folders (25 pack) - $15.99

Subtotal: $83.96
Tax: $7.56
Total: $91.52

Payment Method: Credit Card ending in 1234
Transaction ID: TXN-20240110-1435`,
    metadata: { confidence: 96.8, wordCount: 65, lineCount: 20 }
  },
  {
    fileName: 'meeting-notes-2024-01-15.jpg',
    extractedText: `Meeting Notes - Q1 Planning
Date: January 15, 2024
Attendees: John Smith, Jane Doe, Bob Johnson

Agenda:
1. Review Q4 2023 Results
2. Set Q1 2024 Goals
3. Budget Allocation

Discussion Points:
- Revenue exceeded target by 15%
- Customer satisfaction score: 4.7/5.0
- Plan to hire 3 new team members
- Marketing budget: $25,000
- R&D budget: $35,000

Action Items:
- John Smith: Prepare hiring plan by Jan 22
- Jane Doe: Review vendor contracts by Jan 25
- Bob Johnson: Update project timeline by Jan 20

Next Meeting: February 15, 2024`,
    metadata: { confidence: 94.2, wordCount: 110, lineCount: 28 }
  },
  {
    fileName: 'expense-report-jan-2024.jpg',
    extractedText: `EXPENSE REPORT
Employee: John Smith
Department: Sales
Period: January 1-31, 2024

Business Travel:
- Airfare to Chicago - $450.00
- Hotel (3 nights) - $540.00
- Meals - $180.00
- Taxi/Uber - $95.00

Client Entertainment:
- Dinner with Acme Corp - $250.00
- Coffee meeting - $15.00

Office Supplies:
- Laptop accessories - $125.00

Total Expenses: $1,655.00

Manager Approval: Jane Doe
Date Approved: February 1, 2024`,
    metadata: { confidence: 93.7, wordCount: 82, lineCount: 24 }
  }
];

async function simulateDocumentUpload(doc, index) {
  console.log(`\n📄 Simulating upload: ${doc.fileName}`);
  
  // In a real scenario, this would be a file upload
  // For demo purposes, we'll directly index via the search engine
  
  // Create a mock document ID
  const documentId = `demo-doc-${index + 1}`;
  
  console.log(`   ✓ Document ID: ${documentId}`);
  console.log(`   ✓ Extracted ${doc.metadata.wordCount} words`);
  console.log(`   ✓ Confidence: ${doc.metadata.confidence}%`);
  
  return documentId;
}

async function demonstrateSearch(query, type = 'all') {
  console.log(`\n🔍 Searching: "${query}" (type: ${type})`);
  
  try {
    const response = await fetch(
      `${API_BASE_URL}/search?q=${encodeURIComponent(query)}&type=${type}&limit=5`
    );
    const data = await response.json();
    
    console.log(`   Found ${data.count} result(s)`);
    
    if (data.results && data.results.length > 0) {
      data.results.forEach((result, i) => {
        console.log(`   ${i + 1}. ${result.data.fileName || 'Untitled'} (score: ${result.score.toFixed(1)})`);
        const preview = result.data.text ? result.data.text.substring(0, 80) : '';
        console.log(`      ${preview}...`);
      });
    }
  } catch (error) {
    console.log(`   ⚠ Error: ${error.message}`);
  }
}

async function checkServerHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    
    if (data.status === 'ok') {
      console.log('✅ Server is running and healthy');
      return true;
    }
  } catch (error) {
    console.log('❌ Server is not responding. Please start with: npm start');
    console.log('   Error:', error.message);
    return false;
  }
  return false;
}

async function runDemo() {
  console.log('='.repeat(60));
  console.log('DeskAI Scan-to-Search Demo');
  console.log('='.repeat(60));
  
  // Check if server is running
  console.log('\n📡 Checking server status...');
  const isHealthy = await checkServerHealth();
  
  if (!isHealthy) {
    console.log('\n⚠ Demo requires the server to be running.');
    console.log('Please run: npm start');
    return;
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('DEMO SCENARIOS');
  console.log('='.repeat(60));
  
  // Simulate uploads
  console.log('\n📤 Simulating Document Uploads');
  console.log('-'.repeat(60));
  
  for (let i = 0; i < sampleDocuments.length; i++) {
    await simulateDocumentUpload(sampleDocuments[i], i);
  }
  
  // Wait a moment
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Demonstrate various searches
  console.log('\n\n🔍 Search Demonstrations');
  console.log('-'.repeat(60));
  
  // Search by name
  await demonstrateSearch('John Smith', 'name');
  
  // Search by date
  await demonstrateSearch('January 15, 2024', 'date');
  
  // Search by number/amount
  await demonstrateSearch('2700', 'number');
  
  // Search by text/keyword
  await demonstrateSearch('invoice', 'text');
  
  // Search by company name
  await demonstrateSearch('Acme Corporation', 'text');
  
  console.log('\n' + '='.repeat(60));
  console.log('Demo Complete!');
  console.log('='.repeat(60));
  console.log('\nTo try the full application:');
  console.log('1. Keep the server running (npm start)');
  console.log('2. Open frontend/src/index.html in your browser');
  console.log('3. Upload real scanned documents');
  console.log('4. Search and explore the features!');
  console.log('\nDocumentation: docs/SCAN_TO_SEARCH.md');
  console.log('User Guide: docs/USER_GUIDE.md');
}

// Run the demo
runDemo().catch(console.error);
