# DeskAI

Your professional AI helpdesk with persistent memory - 100% offline and secure.

## Features

### 🧠 Persistent Memory System
- **Automatic conversation logging** - All interactions are saved locally
- **Conversation history** - Browse, search, and filter past discussions
- **Context awareness** - Reference previous conversations in new queries
- **Session continuation** - Pick up where you left off

### 🎓 Adaptive Learning Mode
- **Pattern recognition** - Learns from your usage patterns and behaviors
- **Smart suggestions** - Provides personalized tool and workflow recommendations
- **Privacy-first** - All learning happens locally, no cloud processing
- **User control** - Enable/disable learning and review or reset learned data
- **Workflow detection** - Identifies common action sequences
- **Topic tracking** - Understands your frequent discussion topics

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
│   ├── learning.ts        # Learning mode manager
│   ├── agent.ts           # AI agent logic
│   ├── router.ts          # Request routing
│   └── index.ts           # Main entry point
├── ui/                    # Frontend React code
│   ├── components/        # React components
│   │   ├── ConversationHistory.tsx
│   │   ├── LearningSettings.tsx
│   │   └── AdaptiveSuggestions.tsx
│   ├── App.tsx            # Main app component
│   ├── Dashboard.tsx      # Chat dashboard
│   ├── main.tsx           # React entry point
│   └── index.html         # HTML template
├── out/                   # Local data storage
│   ├── conversations.json # Conversation database
│   └── learning.json      # Learning data (patterns, preferences)
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

### Viewing Analytics

1. Click "Show Analytics" in the Dashboard
2. View statistics about your usage
3. Explore frequent topics and patterns
4. Track conversations over time

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
   - Provides CRUD operations for conversations
   - Implements search and analytics

2. **LearningManager** (`src/learning.ts`)
   - Tracks user interactions and behavior patterns
   - Detects workflow sequences
   - Generates adaptive suggestions
   - Manages learning preferences

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

6. **LearningSettings** (`ui/components/LearningSettings.tsx`)
   - Learning mode controls
   - Data review interface
   - Reset functionality

7. **AdaptiveSuggestions** (`ui/components/AdaptiveSuggestions.tsx`)
   - Displays personalized recommendations
   - Shows confidence scores
   - Context-aware suggestions

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

Your conversations are stored in `out/conversations.json` and learning data in `out/learning.json`. Include these files in your backup strategy if you want to preserve your history and learned patterns.

## Learning Mode Details

### How It Works

DeskAI's learning mode analyzes your usage patterns entirely on your device:

1. **Action Tracking**: Records your interactions (messages, searches, analytics views)
2. **Pattern Detection**: Identifies frequently used tools and common workflows
3. **Topic Analysis**: Tracks conversation topics from tags
4. **Suggestion Generation**: Creates personalized recommendations based on patterns

### What Gets Tracked

- Tool usage (chat, search, analytics, filters)
- Action sequences (workflow patterns)
- Conversation topics (from tags)
- Usage frequency and timing

### What Doesn't Get Tracked

- Message content (only metadata)
- Personal information
- Any data outside the application
- Network activity (none exists)

### Privacy Guarantees

- ✅ **Local only** - All processing happens on your device
- ✅ **No cloud sync** - Data never leaves your computer
- ✅ **User controlled** - Enable/disable anytime
- ✅ **Transparent** - Review all learned data
- ✅ **Deletable** - Reset learning data completely

### Suggestions

The learning mode provides several types of suggestions:

- **Tool Suggestions**: Frequently used features
- **Workflow Suggestions**: Common action sequences
- **Topic Suggestions**: Frequent discussion areas

Each suggestion includes:
- Confidence score (High/Medium/Low)
- Usage reasoning
- Contextual information

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
