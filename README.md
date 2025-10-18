# DeskAI

Your professional AI helpdesk with persistent memory - 100% offline and secure.

## Features

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

### 🔧 Secretary Tools (NEW)
- **Writing Tool** - Create, edit, and manage text documents offline
- **Photo Tool** - Preview images and extract text via OCR (stub for Tesseract integration)
- **Document Tool** - Summarize documents and extract structured data (emails, dates, etc.)
- **File Sorting** - Organize files by date, name, size, or type
- **Handwriting Recognition** - Stub for offline HTR integration (TrOCR-ready)
- **100% offline** - All processing happens locally on your machine

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

# Run examples
npm run example:basic      # Basic usage demo
npm run example:router     # Router API demo
npm run example:secretary  # Secretary tools demo (NEW)
```

## Project Structure

```
DeskAI/
├── src/                    # Backend TypeScript code
│   ├── memory.ts          # Core memory manager
│   ├── agent.ts           # AI agent logic
│   ├── router.ts          # Request routing
│   ├── tools.ts           # Secretary tools (NEW)
│   └── index.ts           # Main entry point
├── ui/                    # Frontend React code
│   ├── components/        # React components
│   │   ├── ConversationHistory.tsx
│   │   └── ToolsPanel.tsx        # Secretary tools UI (NEW)
│   ├── App.tsx            # Main app component
│   ├── Dashboard.tsx      # Chat dashboard
│   ├── main.tsx           # React entry point
│   └── index.html         # HTML template
├── out/                   # Local data storage
│   ├── conversations.json # Conversation database
│   ├── documents/         # User documents (NEW)
│   └── photos/            # User photos (NEW)
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

### Using Secretary Tools

1. Click the "Tools" tab in the navigation
2. Select a tool category:
   - **Writing Tool**: Create and edit text documents
   - **Photo Tool**: View images and extract text (OCR stub)
   - **Document Tool**: Summarize and extract data from documents
   - **File Sorting**: Organize files by various criteria
3. Follow the on-screen instructions for each tool
4. All operations are performed locally on your machine

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

### Key Components

1. **MemoryManager** (`src/memory.ts`)
   - Handles all data persistence
   - Provides CRUD operations for conversations
   - Implements search and analytics

2. **Agent** (`src/agent.ts`)
   - Processes user messages
   - Integrates with memory system
   - Maintains conversation context

3. **Router** (`src/router.ts`)
   - Routes API requests to handlers
   - Coordinates between components
   - Provides unified interface

4. **ConversationHistory** (`ui/components/ConversationHistory.tsx`)
   - Visual interface for browsing history
   - Search and filter functionality
   - Conversation detail view

5. **ToolsPanel** (`ui/components/ToolsPanel.tsx`) _(NEW)_
   - Secretary tools interface
   - Tabbed navigation between tools
   - File management and preview

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

Your conversations are stored in `out/conversations.json`. Include this file in your backup strategy if you want to preserve your history.

## Future Enhancements

Planned features:
- [ ] Advanced semantic search with local embeddings
- [ ] Full OCR integration with Tesseract
- [ ] Handwriting recognition with TrOCR/HTR
- [ ] PDF document support
- [ ] LLM integration for document summarization
- [ ] Multi-modal support (more document formats)
- [ ] Enhanced context extraction
- [ ] Richer analytics dashboards
- [ ] Optional encryption at rest
- [ ] Import/export in multiple formats

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
