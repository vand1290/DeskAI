# DeskAI

Your professional AI helpdesk with persistent memory - 100% offline and secure.

## Features

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

### 📊 Local Analytics
- **Usage statistics** - Track conversation and message counts
- **Topic analysis** - Discover frequent discussion topics
- **Trend detection** - Understand your interaction patterns over time
- **Privacy-focused** - All analytics computed locally, never sent anywhere

### 🔒 Security & Privacy
- **100% offline operation** - No network calls, no cloud storage
- **Local-only storage** - Data stored in `out/conversations.json`
- **User control** - Export, delete, or manage your data anytime
- **Transparent** - Open source and auditable

### 💬 Intelligent Chat Interface
- **Real-time responses** - Interactive conversation experience
- **Multi-conversation support** - Manage multiple discussion threads
- **Tag system** - Organize conversations by topic
- **Search functionality** - Find past messages quickly

## Installation

```bash
# Clone the repository
git clone https://github.com/vand1290/DeskAI.git
cd DeskAI

# Install dependencies
npm install

# Build the project
npm run build

# Start the application
npm start
```

## Development

```bash
# Run in development mode with hot reload
npm run dev

# Build TypeScript backend only
npm run build:backend

# Build React frontend only  
npm run build:frontend

# Run tests
npm test

# Lint code
npm run lint
```

## Project Structure

```
DeskAI/
├── src/                    # Backend TypeScript code
│   ├── memory.ts          # Core memory manager
│   ├── agent.ts           # AI agent logic
│   ├── router.ts          # Request routing
│   ├── taskChain.ts       # Task chaining & workflow engine
│   └── index.ts           # Main entry point
├── ui/                    # Frontend React code
│   ├── components/        # React components
│   │   ├── ConversationHistory.tsx
│   │   ├── WorkflowList.tsx       # Workflow management
│   │   └── WorkflowBuilder.tsx    # Visual workflow editor
│   ├── App.tsx            # Main app component
│   ├── Dashboard.tsx      # Chat dashboard
│   ├── Workflows.tsx      # Workflow views
│   ├── main.tsx           # React entry point
│   └── index.html         # HTML template
├── out/                   # Local data storage
│   ├── conversations.json # Conversation database
│   └── task-chains.json   # Saved workflows
├── dist/                  # Compiled backend code
└── dist-ui/               # Compiled frontend code
```

## Usage

### Starting a Conversation

1. Launch DeskAI and navigate to the Dashboard
2. Type your message in the input box
3. Conversations are automatically created and saved

### Browsing History

1. Click the "History" button in the navigation
2. View all past conversations with message counts and timestamps
3. Click any conversation to view full details
4. Use the search bar to find specific content

### Managing Conversations

- **Delete**: Click the × button on any conversation
- **Continue**: Select a conversation from history to continue it in the dashboard
- **Export**: Use the export function to download all your data
- **Tags**: Add tags to conversations for better organization

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

### Viewing Analytics

1. Click "Show Analytics" in the Dashboard
2. View statistics about your usage
3. Explore frequent topics and patterns
4. Track conversations over time

## Memory System Architecture

### Storage Format

Conversations are stored as JSON in `out/conversations.json`:

```json
{
  "id": "unique-id",
  "title": "Conversation Title",
  "messages": [
    {
      "id": "message-id",
      "role": "user|agent",
      "content": "Message text",
      "timestamp": 1234567890
    }
  ],
  "createdAt": 1234567890,
  "updatedAt": 1234567890,
  "tags": ["topic1", "topic2"]
}
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

### Key Components

1. **MemoryManager** (`src/memory.ts`)
   - Handles all data persistence
   - Provides CRUD operations for conversations
   - Implements search and analytics

2. **Agent** (`src/agent.ts`)
   - Processes user messages
   - Integrates with memory system
   - Maintains conversation context

3. **TaskChainManager** (`src/taskChain.ts`)
   - Manages workflow creation and execution
   - Provides tool registry for chain steps
   - Handles data flow between steps

4. **Router** (`src/router.ts`)
   - Routes API requests to handlers
   - Coordinates between components
   - Provides unified interface

5. **WorkflowBuilder** (`ui/components/WorkflowBuilder.tsx`)
   - Visual workflow creation and editing
   - Step management and reordering
   - Workflow execution interface

6. **ConversationHistory** (`ui/components/ConversationHistory.tsx`)
   - Visual interface for browsing history
   - Search and filter functionality
   - Conversation detail view

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
3. Or manually copy `out/conversations.json`

### Deleting Data

Remove conversations:
1. Individual: Click × on any conversation
2. All: Delete the `out/conversations.json` file
3. Reset: Use the clear function (if implemented)

### Backing Up

Your data is stored in:
- `out/conversations.json` - Conversation history
- `out/task-chains.json` - Saved workflows

Include these files in your backup strategy if you want to preserve your history and workflows.

## Workflow Tool System

### Built-in Tools

DeskAI comes with several built-in tools for task chaining:

1. **Document Scanner** (`scan`)
   - Scans documents or images
   - Placeholder for hardware/software integration

2. **OCR Text Extraction** (`ocr`)
   - Extracts text from images using OCR
   - Placeholder for OCR library integration

3. **Text Summarizer** (`summarize`)
   - Summarizes text content
   - Placeholder for AI/NLP integration

4. **File Saver** (`save`)
   - Saves content to files
   - Supports configuration for filenames

### Creating Custom Tools

You can register custom tools programmatically:

```typescript
import { TaskChainManager, ChainTool } from './src/taskChain';

const customTool: ChainTool = {
  type: 'my-custom-tool',
  name: 'My Custom Tool',
  description: 'Does something custom',
  execute: async (input: unknown, config?: Record<string, unknown>) => {
    // Your custom logic here
    return { result: 'processed', data: input };
  }
};

const manager = new TaskChainManager('./out');
await manager.initialize();
manager.registerTool(customTool);
```

### Using Workflows Programmatically

```typescript
import { initializeDeskAI } from './src/index';

const { taskChainManager } = await initializeDeskAI();

// Create a workflow
const chain = await taskChainManager.createChain(
  'Document Processing',
  'Scan, OCR, and save documents',
  ['document', 'ocr']
);

// Add steps
await taskChainManager.addStep(chain.id, 'scan', 'Scan Document');
await taskChainManager.addStep(chain.id, 'ocr', 'Extract Text');
await taskChainManager.addStep(chain.id, 'save', 'Save Result', {
  filename: 'output.pdf'
});

// Execute the workflow
const result = await taskChainManager.executeChain(chain.id, inputData);
console.log(result.success ? 'Success!' : 'Failed:', result.error);
```

## Future Enhancements

Planned features:
- [ ] Advanced semantic search with local embeddings
- [ ] Conversation summarization
- [ ] Multi-modal support (images, documents)
- [ ] Enhanced context extraction
- [ ] Learning from file content
- [ ] Richer analytics dashboards
- [ ] Optional encryption at rest
- [ ] Import/export in multiple formats
- [x] Task chaining and workflow automation
- [ ] Real OCR and document processing integration
- [ ] AI-powered summarization
- [ ] Hardware scanner integration

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

- 📖 Documentation: This README and SECURITY.md
- 🐛 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions
- 📧 Contact: Repository maintainers

---

**DeskAI** - Your conversations, your device, your control.
