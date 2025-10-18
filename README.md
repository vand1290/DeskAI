# DeskAI

Your professional helpdesk with task chaining automation.

## Overview

DeskAI is an offline desktop application that allows users to create and execute sequences of actions (macros) as a single workflow. It supports document scanning, OCR, text summarization, file management, and more - all running locally without internet connection.

## Features

- **Task Chaining**: Create complex workflows by chaining multiple actions together
- **Offline Operation**: All processing happens locally, no internet required
- **Visual Workflow Builder**: Intuitive UI for creating and managing workflows
- **Workflow Management**: Save, edit, reuse, and delete workflows
- **Built-in Tools**:
  - Document Scanner: Scan documents and convert to images
  - OCR: Extract text from images
  - Text Summarizer: Generate summaries of text content
  - PDF Generator: Save content as PDF files
  - File Management: Copy, move, and organize files

## Installation

1. Clone the repository:
```bash
git clone https://github.com/vand1290/DeskAI.git
cd DeskAI
```

2. Install dependencies:
```bash
npm install
```

3. Build the application:
```bash
npm run build
```

4. Start the application:
```bash
npm start
```

## Usage

### Creating a Workflow

1. Click "New Workflow" in the navigation
2. Enter a name and description for your workflow
3. Select tools from the available tools list
4. Configure parameters for each task
5. Add tasks to build your chain
6. Save the workflow

### Executing a Workflow

1. Go to the "Workflows" tab
2. Find your saved workflow
3. Click "Execute" to run the workflow
4. View the results for each task in the chain

### Example Workflow

A typical document processing workflow:
1. **Scan Document** → Capture document image
2. **OCR** → Extract text from the scanned image
3. **Summarize** → Generate a summary of the extracted text
4. **Save as PDF** → Save the summary to a PDF file

## Development

### Build

```bash
# Development build
npm run build:dev

# Production build
npm run build
```

### Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm test:watch

# Generate coverage report
npm test:coverage
```

## Architecture

DeskAI is built with:
- **Electron**: Cross-platform desktop application framework
- **React**: UI framework
- **TypeScript**: Type-safe development
- **Node.js**: Backend processing

### Project Structure

```
DeskAI/
├── src/
│   ├── main/           # Electron main process
│   │   ├── main.ts     # Application entry point
│   │   ├── toolRegistry.ts        # Tool registration system
│   │   ├── taskChainManager.ts   # Task execution engine
│   │   ├── workflowStorage.ts    # Workflow persistence
│   │   └── tools.ts               # Built-in tool implementations
│   ├── renderer/       # Electron renderer process (UI)
│   │   ├── App.tsx     # Main React component
│   │   ├── components/ # React UI components
│   │   └── index.tsx   # Renderer entry point
│   └── shared/         # Shared types and utilities
│       └── types.ts    # TypeScript interfaces
├── tests/              # Unit tests
└── workflows/          # Saved workflows (created at runtime)
```

## Security

- All processing happens locally
- No data is sent to external servers
- Sandboxed execution environment
- Secure file handling

## License

ISC
