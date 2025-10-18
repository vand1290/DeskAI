# DeskAI

Your professional AI helpdesk with persistent memory - 100% offline and secure.

## Features

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
│   ├── scanner.ts         # OCR and scan processing
│   └── index.ts           # Main entry point
├── ui/                    # Frontend React code
│   ├── components/        # React components
│   │   ├── ConversationHistory.tsx
│   │   ├── ScanUpload.tsx
│   │   └── ScanSearch.tsx
│   ├── App.tsx            # Main app component
│   ├── Dashboard.tsx      # Chat dashboard
│   ├── main.tsx           # React entry point
│   └── index.html         # HTML template
├── out/                   # Local data storage
│   ├── conversations.json # Conversation database
│   └── scanned-documents.json # Scanned documents database
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

### Using Scan-to-Search

1. Click "Scan Document" in the navigation
2. Upload an image or scanned document (PNG, JPG, etc.)
3. Wait for OCR processing to complete
4. View extracted text and structured data (names, dates, numbers)
5. Click "Search Scans" to find information across all scanned documents
6. Use filters to search by specific data types (names, dates, keywords)
7. View full document details by clicking "View" on any search result

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
   - Integrates with memory system
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
