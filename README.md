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
│   ├── taskChain.ts       # Task chaining & workflow engine
│   └── index.ts           # Main entry point
├── ui/                    # Frontend React code
│   ├── components/        # React components
│   │   ├── ConversationHistory.tsx
│   │   ├── LearningSettings.tsx
│   │   └── AdaptiveSuggestions.tsx
│   ├── App.tsx            # Main app component
│   ├── Dashboard.tsx      # Chat dashboard
│   ├── Workflows.tsx      # Workflow views
│   ├── main.tsx           # React entry point
│   └── index.html         # HTML template
├── out/                   # Local data storage
│   ├── conversations.json # Conversation database
│   └── learning.json      # Learning data (patterns, preferences)
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
- [x] Task chaining and workflow automation
- [ ] Real OCR and document processing integration
- [ ] AI-powered summarization
- [ ] Hardware scanner integration

# Tests cover:
# - Router logic and agent selection
# - Tool security and functionality
# - Deterministic behavior
```

## Security Notes
- All operations are performed locally on your device
- No data is sent over the network
- File operations are restricted to the `out` directory
- All tools are allowlisted and deterministic

## License
See LICENSE file for details.
