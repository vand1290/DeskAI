# DeskAI Quick Start Guide

Get up and running with DeskAI's persistent memory system in minutes!

## Installation

```bash
# Clone the repository
git clone https://github.com/vand1290/DeskAI.git
cd DeskAI

# Install dependencies
npm install
```

## Quick Test

```bash
# Run all tests to verify everything works
npm test

# All 91 tests should pass ✓
```

## Try the Examples

### Basic Usage Example
```bash
npm run example:basic
```

This will:
- Initialize the memory system
- Create a conversation
- Exchange messages
- Show conversation history
- Display analytics
- Save everything to `examples/data/conversations.json`

### Router API Example
```bash
npm run example:router
```

This demonstrates the programmatic API for integrating with other systems.

### Workflow Automation Example
```bash
npm run example:workflow
```

This demonstrates the new task chaining feature:
- Creates a workflow with multiple steps
- Executes scan → OCR → summarize → save pipeline
- Shows step-by-step execution results
- Saves workflow to `out/task-chains.json`

## View the Data

After running the examples, check out the stored data:

```bash
# View conversations
cat examples/data/conversations.json

# View workflows
cat out/task-chains.json
```

You'll see all your data stored in human-readable JSON format!

## Build the Project

```bash
# Build backend (TypeScript → JavaScript)
npm run build:backend

# Build frontend (React UI)
npm run build:frontend

# Build everything
npm run build
```

## Development Mode

```bash
# Run in development mode with hot reload
npm run dev
```

## Project Structure

```
DeskAI/
├── src/                    # Backend TypeScript code
│   ├── memory.ts          # Core memory management
│   ├── agent.ts           # Conversation agent
│   ├── router.ts          # API routing
│   ├── taskChain.ts       # Workflow engine
│   └── __tests__/         # Unit tests
│
├── ui/                    # Frontend React code
│   ├── components/        # React components
│   ├── App.tsx            # Main app
│   ├── Dashboard.tsx      # Chat interface
│   └── Workflows.tsx      # Workflow management
│
├── examples/              # Usage examples
│   ├── basic-usage.ts
│   ├── router-api.ts
│   ├── workflow-demo.ts   # Workflow example
│   └── data/             # Example data storage
│
└── out/                   # Your conversation data
    ├── conversations.json # Conversations
    └── task-chains.json   # Workflows
```

## Key Features

✅ **Persistent Memory** - All conversations automatically saved locally  
✅ **Task Chaining** - Create workflows to automate sequences of actions  
✅ **Visual Workflow Builder** - Intuitive UI for workflow creation  
✅ **Search & Filter** - Find past conversations and workflows quickly  
✅ **Analytics** - Track usage patterns and frequent topics  
✅ **100% Offline** - No network calls, completely private  
✅ **Export/Delete** - Full control over your data  
✅ **Type-Safe** - Built with TypeScript  

## Using in Your Code

### Initialize DeskAI
```typescript
import { initializeDeskAI } from './dist/index.js';

const { memory, agent, taskChainManager, router } = await initializeDeskAI('./my-data');
```

### Start a Conversation
```typescript
const conversationId = await agent.startConversation('My Topic', ['tag1', 'tag2']);
```

### Send Messages
```typescript
const response = await agent.processMessage('Hello, DeskAI!');
console.log(response.content);
```

### Get History
```typescript
const conversations = await memory.listConversations();
const analytics = await memory.getAnalytics();
```

### Create and Execute Workflows
```typescript
// Create a workflow
const workflow = await taskChainManager.createChain(
  'My Workflow',
  'Description of what it does',
  ['tag1', 'tag2']
);

// Add steps
await taskChainManager.addStep(workflow.id, 'scan', 'Scan Document');
await taskChainManager.addStep(workflow.id, 'ocr', 'Extract Text');
await taskChainManager.addStep(workflow.id, 'save', 'Save Result');

// Execute
const result = await taskChainManager.executeChain(workflow.id, inputData);
console.log(result.success ? 'Success!' : 'Failed');
```

## Next Steps

- 📖 Read the full [README.md](README.md) for detailed documentation
- 🔒 Check [SECURITY.md](SECURITY.md) for privacy and security info
- 🧪 Explore the [examples/](examples/) directory
- 💻 Browse the [src/](src/) code
- 🎨 Check out the [ui/](ui/) components

## Need Help?

- Run `npm test` to verify your installation
- Check the examples in `examples/` directory
- Review the test files in `src/__tests__/` for usage patterns
- Read the inline code documentation

## Common Commands

```bash
npm test                # Run all tests
npm run lint            # Check code quality
npm run build           # Build everything
npm run example:basic   # Run basic example
npm run example:router  # Run router example
npm run example:workflow # Run workflow example
```

Happy coding! 🚀
