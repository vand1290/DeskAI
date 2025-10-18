# DeskAI - LocalMetaAgent (Offline)

## Overview
DeskAI is an offline meta-agent that routes user requests to local models and tools, runs everything on-device, and provides a desktop UI. It targets Windows packaging via Tauri.

## Key Constraints
- **100% Offline**: No network calls are made
- **Deterministic Behavior**: All responses are predictable and reproducible
- **Windows Packaging**: Packaged as a Windows .exe using Tauri

### 🔗 Task Chaining & Workflows
- **Visual workflow builder** - Create and edit task chains with an intuitive UI
- **Reusable workflows** - Save and execute common task sequences
- **Chain execution** - Run multiple tools in sequence with data passing between steps
- **Built-in tools** - Scanner, OCR, Summarizer, File Saver, and custom tool support
- **Workflow management** - Browse, edit, delete, and organize workflows with tags
- **Real-time execution** - Monitor workflow progress and see step-by-step results

### 🧠 Persistent Memory System
- **Automatic conversation logging** - All interactions are saved locally
- **Conversation history** - Browse, search, and filter past discussions
- **Context awareness** - Reference previous conversations in new queries
- **Session continuation** - Pick up where you left off

### 📄 Scan-to-Search
- **OCR text extraction** - Upload scanned documents or images to extract text
- **Smart data extraction** - Automatically extract names, dates, numbers, and keywords
- **Advanced search** - Search across all scanned documents by any extracted data
- **Document linking** - Link scanned documents to related conversations
- **Offline processing** - All OCR and text extraction happens locally
- **Related documents** - Automatically suggest related documents based on content similarity

### 📊 Local Analytics
- **Usage statistics** - Track conversation and message counts
- **Topic analysis** - Discover frequent discussion topics
- **Trend detection** - Understand your interaction patterns over time
- **Privacy-focused** - All analytics computed locally, never sent anywhere

### 🔒 Security & Privacy
- **100% offline operation** - No network calls, no cloud storage
- **Local-only storage** - Data stored in `out/conversations.json` and `out/learning.json`
- **User control** - Export, delete, or manage your data anytime
- **Transparent** - Open source and auditable

### 💬 Intelligent Chat Interface
- **Real-time responses** - Interactive conversation experience
- **Multi-conversation support** - Manage multiple discussion threads
- **Tag system** - Organize conversations by topic
- **Search functionality** - Find past messages quickly

### Prerequisites
1. Node.js 18+ installed
2. Rust toolchain installed
3. Tauri prerequisites for your platform (see [Tauri docs](https://tauri.app/v1/guides/getting-started/prerequisites))

### Installation
```bash
# Install root dependencies
npm install

# Install UI dependencies
cd ui && npm install && cd ..
```

### Development Commands
```bash
# Build backend and UI
npm run build

# Run unit tests
npm test

# Run UI in development mode (offline)
npm run ui:dev
```

## Project Structure

```
DeskAI/
├── src/                    # Backend TypeScript code
│   ├── memory.ts          # Core memory manager
│   ├── learning.ts        # Learning mode manager
│   ├── agent.ts           # AI agent logic
│   ├── router.ts          # Request routing
│   ├── scanner.ts         # OCR and scan processing
│   └── index.ts           # Main entry point
├── ui/                    # Frontend React code
│   ├── components/        # React components
│   │   ├── ConversationHistory.tsx
│   │   ├── ScanUpload.tsx
│   │   └── ScanSearch.tsx
│   ├── App.tsx            # Main app component
│   ├── Dashboard.tsx      # Chat dashboard
│   ├── Workflows.tsx      # Workflow views
│   ├── main.tsx           # React entry point
│   └── index.html         # HTML template
├── out/                   # Local data storage
│   ├── conversations.json # Conversation database
│   └── scanned-documents.json # Scanned documents database
├── dist/                  # Compiled backend code
└── dist-ui/               # Compiled frontend code
```

The built executable will be located in `src-tauri/target/release/`.

## Offline Usage
Models are referenced by name (e.g., `qwen2.5:7b`), but loading and inference are user-provided via local runners. The provided agents are deterministic stubs by default; you can plug in your local model runners later.

### Integrating Local Models
To connect your own local models:
1. Edit `src/agents.ts`
2. Replace the stub `invoke` methods with calls to your local model runtime (e.g., Ollama, llama.cpp, etc.)

### Creating Workflows

1. Navigate to the "Workflows" tab
2. Click "Create New Workflow"
3. Enter a name and description
4. Add workflow steps by selecting from available tools:
   - **Scan**: Document scanner (placeholder)
   - **OCR**: Text extraction from images (placeholder)
   - **Summarize**: Text summarization (placeholder)
   - **Save**: File saver (placeholder)
5. Reorder steps using the up/down arrows
6. Add tags for organization
7. Save the workflow

### Executing Workflows

1. Go to the Workflows tab
2. Click the "Execute Workflow" button on any workflow
3. View execution results showing:
   - Success/failure status
   - Execution duration
   - Step-by-step results
4. Edit workflows anytime by clicking the edit (✎) button

### Managing Workflows

- **Edit**: Click the pencil icon to modify workflow steps
- **Delete**: Click the trash icon to remove a workflow
- **Filter**: Use tags to find specific workflows
- **Execute**: Run workflows directly from the list view

### Using Scan-to-Search

1. Click "Scan Document" in the navigation
2. Upload an image or scanned document (PNG, JPG, etc.)
3. Wait for OCR processing to complete
4. View extracted text and structured data (names, dates, numbers)
5. Click "Search Scans" to find information across all scanned documents
6. Use filters to search by specific data types (names, dates, keywords)
7. View full document details by clicking "View" on any search result

### Viewing Analytics

### Meta-Agent Router
The system uses a deterministic keyword-based router that directs queries to specialized agents:
- **General Agent**: Default agent for general queries
- **Code Agent**: Specialized for programming and debugging tasks
- **Data Agent**: Focused on data analysis and visualization

### Using Learning Mode

1. Navigate to the "Learning" tab in the navigation
2. Enable or disable learning mode with the toggle
3. View learning statistics showing tracked actions, tools, workflows, and topics
4. Click "View Detailed Data" to see:
   - Tool usage patterns with frequency counts
   - Common workflow sequences you follow
   - Frequent topics from your conversations
5. See adaptive suggestions in the Dashboard based on your patterns
6. Reset learning data anytime from the Learning Settings page

**Privacy Note**: Learning mode operates entirely locally. All pattern analysis and suggestions are generated on your device. No data is sent to any external service.

## Memory System Architecture

**Security Note**: Shell and filesystem access are restricted to the `out` directory by default.

## Project Structure
```
DeskAI/
├── src/                    # Backend TypeScript
│   ├── types.ts           # Type definitions
│   ├── agents.ts          # Agent implementations
│   ├── router.ts          # Meta-agent routing logic
│   ├── tools.ts           # Offline tools
│   └── index.ts           # Main exports
├── ui/                     # React UI
│   ├── src/
│   │   ├── App.tsx        # Main React component
│   │   ├── App.css        # Styles
│   │   └── main.tsx       # Entry point
│   └── package.json
├── src-tauri/              # Tauri desktop app
│   ├── src/
│   │   └── main.rs        # Rust entry point
│   ├── tauri.conf.json    # Tauri configuration
│   └── Cargo.toml         # Rust dependencies
├── out/                    # Workspace directory
├── package.json            # Root package configuration
└── README.md               # This file
```

Workflows are stored as JSON in `out/task-chains.json`:

```json
{
  "id": "unique-id",
  "name": "Workflow Name",
  "description": "What this workflow does",
  "steps": [
    {
      "id": "step-id",
      "type": "scan|ocr|summarize|save|custom",
      "name": "Step Name",
      "order": 0,
      "config": {}
    }
  ],
  "createdAt": 1234567890,
  "updatedAt": 1234567890,
  "tags": ["automation", "document"]
}
```

Learning data is stored in `out/learning.json`:

```json
{
  "enabled": true,
  "actions": [...],
  "toolUsage": {...},
  "workflows": [...],
  "frequentTopics": {...},
  "preferences": {...},
  "lastAnalyzed": 1234567890
}
```

### Key Components

1. **MemoryManager** (`src/memory.ts`)
   - Handles all data persistence
   - Provides CRUD operations for conversations and scanned documents
   - Implements search and analytics

2. **Scanner** (`src/scanner.ts`)
   - OCR processing using Tesseract.js
   - Extracts structured data (names, dates, numbers, keywords)
   - Provides search and document similarity algorithms
   - 100% offline operation

3. **Agent** (`src/agent.ts`)
   - Processes user messages
   - Integrates with memory and learning systems
   - Maintains conversation context

4. **Router** (`src/router.ts`)
   - Routes API requests to handlers
   - Coordinates between components
   - Provides unified interface

5. **ConversationHistory** (`ui/components/ConversationHistory.tsx`)
   - Visual interface for browsing history
   - Search and filter functionality
   - Conversation detail view

6. **ScanUpload** (`ui/components/ScanUpload.tsx`)
   - File upload interface
   - OCR processing indicators
   - Extracted data preview

7. **ScanSearch** (`ui/components/ScanSearch.tsx`)
   - Search interface for scanned documents
   - Filter by data type
   - Document detail modal

## Privacy & Security

DeskAI is built with privacy as a core principle:

- ✅ **No telemetry or tracking** - We collect nothing
- ✅ **No network calls** - Everything runs locally
- ✅ **No cloud storage** - Your data stays on your device
- ✅ **User-controlled** - Delete or export anytime
- ✅ **Open source** - Audit the code yourself

For detailed security information, see [SECURITY.md](SECURITY.md).

## Data Management

### Exporting Data

Export your conversation history:
1. Go to History view
2. Click "Export" to download as JSON
3. Or manually copy `out/conversations.json` and `out/scanned-documents.json`

### Deleting Data

Remove conversations or scanned documents:
1. Individual: Click × on any item
2. All: Delete the `out/conversations.json` or `out/scanned-documents.json` files
3. Reset: Use the clear function (if implemented)

### Backing Up

Your data is stored in these files:
- `out/conversations.json` - Conversation history
- `out/scanned-documents.json` - Scanned documents and extracted data

Include these files in your backup strategy if you want to preserve your history.

## Future Enhancements

Planned features:
- [ ] Advanced semantic search with local embeddings
- [ ] Conversation summarization
- [x] Multi-modal support (images, documents)
- [ ] Enhanced context extraction
- [ ] Learning from file content
- [ ] Richer analytics dashboards
- [ ] Optional encryption at rest
- [ ] Import/export in multiple formats
- [x] OCR and document scanning capabilities

## Security Notes
- All operations are performed locally on your device
- No data is sent over the network
- File operations are restricted to the `out` directory
- All tools are allowlisted and deterministic

## License
See LICENSE file for details.
