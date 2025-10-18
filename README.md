# DeskAI

🤖 **100% Offline Meta-Agent for Desktop**

Your professional helpdesk powered by local AI models and tools - completely offline and private.

## Overview

DeskAI is an offline meta-agent that routes user requests to local models and tools, runs everything on-device, and provides a clean desktop UI. All processing happens locally on your machine with no network calls.

### Key Features

- ✅ **100% Offline** - No network calls, all processing on-device
- ✅ **Deterministic Behavior** - Reproducible results for the same inputs
- ✅ **Privacy First** - Your data never leaves your machine
- ✅ **Secure by Design** - Allowlisted tools, filesystem restricted to sandboxed directories
- ✅ **Windows Packaging** - Distributable as a Windows .exe via Tauri
- ✅ **Local Model Support** - Interface for plugging in your own local model runners
- ✅ **Personal Secretary Tools** - Document processing, OCR, handwriting recognition, file management, and writing tools

## Architecture

### Monorepo Layout

```
DeskAI/
├── src/                    # Backend TypeScript logic (no network calls)
│   ├── agent.ts           # Core meta-agent logic
│   ├── models.ts          # Model reference system
│   ├── tools.ts           # Allowlisted tool definitions
│   ├── router.ts          # Request routing logic
│   └── __tests__/         # Unit tests
├── ui/                     # React frontend
│   ├── App.tsx            # Main application component
│   ├── components/        # UI components
│   └── styles.css         # Application styling
├── src-tauri/             # Tauri desktop wrapper
│   ├── src/main.rs        # Rust entry point
│   └── tauri.conf.json    # Tauri configuration
└── out/                   # Sandboxed output directory for file operations
```

## Getting Started

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 8+
- Rust 1.70+ (for Tauri builds)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/vand1290/DeskAI.git
cd DeskAI
```

2. Install dependencies:
```bash
npm install
cd ui && npm install && cd ..
```

3. Build the backend:
```bash
npm run build
```

### Development

#### Run Tests
```bash
npm test
```

#### Start UI Development Server
```bash
npm run ui:dev
```

The UI will be available at `http://localhost:1420`

#### Run Tauri Development Build
```bash
npm run tauri:dev
```

This starts the desktop application in development mode with hot-reload.

### Building for Production

#### Build Backend and UI
```bash
npm run build
```

#### Build Windows .exe
```bash
npm run tauri:build
```

The Windows installer will be created in `src-tauri/target/release/bundle/`

## Usage

### Basic Request

1. Open the application
2. Select a model from the dropdown (e.g., `qwen2.5:7b`)
3. Enter your request in the text area
4. Click "Submit"

The agent will:
- Parse your request
- Route it to the appropriate model or tool
- Execute any necessary operations
- Return a deterministic response

### Available Tools

#### Basic Tools
- **file_write** - Write content to files in the `out/` directory
- **file_read** - Read content from files in the `out/` directory
- **calculator** - Perform arithmetic calculations
- **text_analysis** - Analyze text properties (word count, character count, etc.)

#### Personal Secretary Tools

##### 📁 File Manager
Organize and manage your files with ease:
- List files in directories with metadata
- Sort files by name, date, size, or client
- Add custom metadata (tags, categories, client names)
- Search files by name or metadata
- Auto-organize files into client folders

**Usage:**
```javascript
// List files
file_manager({ action: 'list', folderPath: 'out/' })

// Sort by date
file_manager({ action: 'sort', folderPath: 'out/', sortBy: 'date', order: 'desc' })

// Add metadata
file_manager({ 
  action: 'addMetadata', 
  filePath: 'out/report.pdf', 
  metadata: { client: 'Acme Corp', tags: ['important', 'Q4'] }
})

// Search
file_manager({ action: 'search', folderPath: 'out/', query: 'important' })
```

##### 📄 Document Processor
Extract and analyze document content:
- Extract text from PDFs (pdf-parse - fully offline)
- Read text files
- Summarize documents
- Extract structured data (dates, emails, amounts)
- Full-text search within documents
- Get document metadata

**Usage:**
```javascript
// Extract from PDF
document_processor({ action: 'extractPDF', filePath: 'out/document.pdf' })

// Extract emails from text
document_processor({ 
  action: 'extractData', 
  text: 'Contact us at support@example.com', 
  dataType: 'emails' 
})

// Search within document
document_processor({ 
  action: 'search', 
  text: documentContent, 
  query: 'important term' 
})
```

##### ✍️ Writing Tool
Create and edit documents with templates:
- Create documents in .txt or .md format
- Edit existing documents
- Format as markdown or plain text
- Use built-in templates (business letter, memo, meeting notes)
- Auto-save functionality

**Usage:**
```javascript
// Create document
writing({ 
  action: 'create', 
  title: 'Meeting Notes', 
  content: '# Notes\n\nDiscussion points...', 
  format: 'md' 
})

// Use template
writing({ action: 'useTemplate', templateName: 'business_letter' })

// Format document
writing({ 
  action: 'format', 
  content: '# Title\n\n**Bold**', 
  style: 'plain' 
})
```

##### 🔍 OCR Tool
Extract text from images using Tesseract.js:
- Support for JPG, PNG, BMP, WebP formats
- Multi-language support (English, German, French, Spanish, and more)
- Extract text with layout information (bounding boxes)
- Batch process multiple images
- Image preprocessing for better accuracy

**Usage:**
```javascript
// Extract text from image
ocr({ action: 'extract', imagePath: 'out/scan.jpg', language: 'eng' })

// Get supported languages
ocr({ action: 'languages' })

// Batch process
ocr({ action: 'batch', imagePaths: ['image1.jpg', 'image2.jpg'] })
```

##### ✏️ Handwriting Recognition
Specialized OCR for handwritten text:
- Enhanced recognition for handwriting
- Confidence scoring for extracted text
- Correction suggestions for low-confidence words
- Support for cursive, print, and mixed writing
- Validation of recognition quality

**Usage:**
```javascript
// Recognize handwriting
handwriting({ action: 'recognize', imagePath: 'out/handwritten.jpg' })

// Validate recognition
handwriting({ 
  action: 'validate', 
  text: recognizedText, 
  imagePath: 'out/handwritten.jpg' 
})
```

### Supported Models (Stubs)

The current implementation includes stub models that demonstrate the architecture:

- `qwen2.5:7b`
- `llama2:7b`
- `mistral:7b`

**Note:** These are deterministic stubs. To use actual local models, you'll need to implement the `LocalModel` interface with your preferred model runner (e.g., Ollama, llama.cpp, etc.).

## Security

### Filesystem Restrictions

All file operations are strictly sandboxed to the `out/` directory. The application cannot:
- Access files outside the `out/` directory
- Delete or modify system files
- Execute arbitrary shell commands

### Network Isolation

The application makes **zero network calls**. This is enforced by:
- No network libraries in dependencies
- Tauri's allowlist configuration blocks HTTP requests
- Content Security Policy (CSP) prevents external resource loading

### Tool Allowlisting

Only explicitly allowlisted tools can be executed. Each tool:
- Has a defined interface
- Implements security checks
- Operates within sandboxed constraints

## Extending DeskAI

### Adding a New Tool

1. Create a class implementing the `Tool` interface in `src/tools.ts`:

```typescript
export class MyCustomTool implements Tool {
  name = 'my_tool';
  description = 'Description of what my tool does';

  isAllowed(): boolean {
    return true;
  }

  async execute(params: any): Promise<any> {
    // Implementation
    return { success: true, result: 'value' };
  }
}
```

2. Register it in the `ToolRegistry` constructor:

```typescript
this.registerTool(new MyCustomTool());
```

### Connecting Real Local Models

To use actual local model inference:

1. Install your preferred local model runner (e.g., Ollama)
2. Implement the `LocalModel` interface:

```typescript
export class OllamaModel implements LocalModel {
  name: string;
  
  async load(): Promise<void> {
    // Connect to Ollama
  }
  
  async infer(prompt: string): Promise<string> {
    // Call Ollama API
  }
}
```

3. Register your model in the `ModelRegistry`

## API Reference

### Agent Interface

```typescript
interface AgentRequest {
  query: string;      // User's request
  model?: string;     // Optional model selection
  context?: any;      // Optional context
}

interface AgentResponse {
  result: string;         // Response text
  route: string;          // Route taken (e.g., "model:qwen2.5:7b")
  toolsUsed: string[];    // List of tools executed
  deterministic: boolean; // Whether result is deterministic
}
```

### Tool Interface

```typescript
interface Tool {
  name: string;
  description: string;
  execute(params: any): Promise<any>;
  isAllowed(): boolean;
}
```

### Model Interface

```typescript
interface LocalModel {
  name: string;
  load(): Promise<void>;
  infer(prompt: string): Promise<string>;
}
```

## Development Workflow

1. Make changes to backend code in `src/`
2. Run tests: `npm test`
3. Build: `npm run build`
4. Test UI changes: `npm run ui:dev`
5. Test desktop app: `npm run tauri:dev`
6. Build for production: `npm run tauri:build`

## Personal Secretary UI

The application includes a dedicated secretary mode accessible via the "Secretary Tools" button in the header:

1. **Secretary Dashboard** - Grid view of all available tools
2. **Individual Tool Interfaces** - Dedicated UI for each tool with intuitive controls
3. **Easy Navigation** - Switch between Agent and Secretary modes seamlessly

## Troubleshooting

### Build Issues

**Error: Rust not found**
- Install Rust from https://rustup.rs/

**Error: Node version too old**
- Install Node.js 18+ from https://nodejs.org/

**Error: npm install fails**
- Try `npm install --force` if there are peer dependency conflicts
- Clear npm cache: `npm cache clean --force`

### Runtime Issues

**Tools not working**
- Ensure the `out/` directory exists and is writable
- Check filesystem permissions

**Models not loading**
- Verify model stubs are registered in `ModelRegistry`
- For real models, ensure your local model runner is running

**OCR not working**
- Tesseract.js downloads language data on first use
- Ensure internet connection for initial setup, then fully offline
- Supported image formats: JPG, PNG, BMP, WebP

**PDF extraction fails**
- Ensure the PDF is not encrypted
- Check that the file path is correct and accessible
- Some PDFs with complex layouts may not extract perfectly

**File manager can't access folders**
- Check that folder paths are correct
- Ensure the application has read/write permissions
- On Windows, use forward slashes or double backslashes in paths

## Contributing

This is a proof-of-concept implementation. Contributions are welcome!

Areas for improvement:
- Real local model integration
- Additional tools
- Enhanced UI/UX
- Performance optimizations
- Cross-platform testing

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Built with [Tauri](https://tauri.app/) for desktop packaging
- UI powered by [React](https://react.dev/)
- Backend in TypeScript for type safety and maintainability
