# DeskAI

Your professional AI helpdesk with persistent memory - 100% offline and secure.

## Features

### 🧠 Persistent Memory System
- **Automatic conversation logging** - All interactions are saved locally
- **Conversation history** - Browse, search, and filter past discussions
- **Context awareness** - Reference previous conversations in new queries
- **Session continuation** - Pick up where you left off

### 📄 Scan-to-Search Feature
- **OCR text extraction** - Extract text from scanned documents and images offline
- **Smart metadata extraction** - Automatically identify names, dates, amounts, and keywords
- **Powerful search** - Search across all scanned documents by any criteria
- **Document linking** - Automatically suggest related conversations based on content
- **Privacy-focused** - All processing done locally using Tesseract.js

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
│   ├── scan-processor.ts  # OCR and scan processing
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
│   ├── scans.json         # Scan metadata database
│   └── scans/             # Scanned document files
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

1. **Upload Scans**: Click "Upload Scan" in the navigation
2. **Process Documents**: Drag and drop or select an image file (JPG, PNG, etc.)
3. **View Results**: See extracted names, dates, amounts, and keywords
4. **Link to Conversations**: Review and link suggested related conversations
5. **Search Scans**: Use "Search Scans" to find specific information across all documents
6. **Manage Scans**: View, search, and delete scanned documents as needed

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
  "tags": ["topic1", "topic2"],
  "linkedScans": ["scan-id-1", "scan-id-2"]
}
```

Scanned documents are stored in `out/scans.json`:

```json
{
  "id": "scan-id",
  "filename": "document.jpg",
  "extractedText": "Full OCR text...",
  "metadata": {
    "names": ["John Smith", "Jane Doe"],
    "dates": ["01/15/2024"],
    "totals": ["$1,234.56"],
    "keywords": ["invoice", "payment"]
  },
  "uploadedAt": 1234567890,
  "filePath": "out/scans/scan-id_document.jpg",
  "linkedConversations": ["conv-id-1"]
}
```

### Key Components

1. **MemoryManager** (`src/memory.ts`)
   - Handles all data persistence for conversations and scans
   - Provides CRUD operations for conversations and scanned documents
   - Implements search and analytics
   - Manages linking between scans and conversations

2. **ScanProcessor** (`src/scan-processor.ts`)
   - Performs OCR using Tesseract.js (offline)
   - Extracts structured metadata (names, dates, amounts, keywords)
   - Processes and stores scanned images
   - Provides search functionality across scanned documents

3. **Agent** (`src/agent.ts`)
   - Processes user messages
   - Integrates with memory system
   - Maintains conversation context

4. **Router** (`src/router.ts`)
   - Routes API requests to handlers
   - Coordinates between components
   - Provides unified interface for conversations and scans

5. **ConversationHistory** (`ui/components/ConversationHistory.tsx`)
   - Visual interface for browsing history
   - Search and filter functionality
   - Conversation detail view

6. **ScanUpload** (`ui/components/ScanUpload.tsx`)
   - Drag-and-drop file upload interface
   - Real-time OCR processing feedback
   - Display extracted metadata
   - Show suggested related conversations

7. **ScanSearch** (`ui/components/ScanSearch.tsx`)
   - Search interface for scanned documents
   - Browse all scans
   - View detailed scan information
   - Manage scanned documents

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
- [ ] Conversation summarization
- [x] Multi-modal support (images, documents) - Scan-to-search implemented
- [ ] Enhanced context extraction
- [x] Learning from file content - OCR and metadata extraction implemented
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
