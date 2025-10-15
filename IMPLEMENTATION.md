# Implementation Details - LocalMetaAgent (Offline)

## Overview
This document describes the implementation of the DeskAI LocalMetaAgent system, a fully offline meta-agent that routes user requests to specialized local models.

## Architecture

### 1. Backend (TypeScript in `src/`)

#### Core Components

**types.ts** - Type definitions
- `Message`: Represents conversation messages (user/assistant/system)
- `Tool`: Defines tool interface with execute method
- `Agent`: Defines agent interface with invoke method
- `RouteDecision`: Contains routing decision with reasoning

**agents.ts** - Agent implementations
- `generalAgent`: Default agent for general queries (model: qwen2.5:7b)
- `codeAgent`: Specialized for programming tasks (model: qwen2.5:7b)
- `dataAgent`: Specialized for data analysis (model: qwen2.5:7b)

Each agent has a deterministic stub implementation that can be replaced with actual local model runners.

**router.ts** - Meta-agent routing logic
- `routeRequest()`: Deterministic keyword-based routing
- `getAgent()`: Retrieves agent by name
- `handleRequest()`: Main entry point that routes and executes

Routing is deterministic and based on keyword matching:
- "code", "program", "function", etc. → Code Agent
- "data", "analyze", "chart", etc. → Data Agent
- Everything else → General Agent

**tools.ts** - Offline tool implementations
- `fileReadTool`: Read files from `out/` directory
- `fileWriteTool`: Write files to `out/` directory
- `fileListTool`: List files in `out/` directory

All tools include path validation to prevent directory traversal attacks. All operations are restricted to the `out/` directory.

**index.ts** - Public API exports

### 2. Frontend (React in `ui/`)

#### Components

**App.tsx** - Main application component
- Chat interface with message history
- Input form for user queries
- Agent badge display showing which agent handled each request
- Reasoning display for transparency
- Offline indicator badge

**App.css** - Styles
- Modern gradient header
- Responsive message bubbles
- Smooth animations
- Color-coded agent badges

**main.tsx** - React application entry point
**index.css** - Global styles

#### UI Features
- Real-time message updates
- Visual feedback during processing
- Agent routing information displayed
- 100% client-side processing simulation
- Accessible and keyboard-friendly

### 3. Tauri Integration (`src-tauri/`)

#### Configuration

**tauri.conf.json** - Tauri configuration
- Window settings (1200x800, resizable)
- Security allowlist (minimal permissions)
- Bundle configuration (Windows MSI)
- CSP policy

**Cargo.toml** - Rust dependencies
- Tauri 1.5 with minimal features
- Custom protocol support

**src/main.rs** - Rust entry point
- Minimal Tauri application scaffold
- Windows subsystem configuration for release builds

### 4. Testing

#### Unit Tests

**router.test.ts** - Router and agent tests
- Tests routing logic for different query types
- Verifies deterministic behavior
- Tests edge cases (empty messages, etc.)

**tools.test.ts** - Tool security and functionality tests
- Tests file operations
- Verifies security restrictions
- Tests path validation and error handling

All tests use Jest with TypeScript ESM support.

## Security Considerations

### Path Validation
All file operations validate that paths are within the `out/` directory:
```typescript
function validatePath(filePath: string): string {
  const resolved = path.resolve(OUT_DIR, filePath);
  if (!resolved.startsWith(OUT_DIR)) {
    throw new Error('Access denied: Path is outside allowed directory');
  }
  return resolved;
}
```

### No Network Access
- No fetch/axios imports
- No WebSocket connections
- All processing happens locally
- Tauri allowlist restricts network access

### Deterministic Behavior
- Keyword-based routing (no ML inference)
- Predictable responses for same inputs
- No randomness in stub implementations

## Build Process

### Development Build
1. `npm install` - Install root dependencies
2. `cd ui && npm install` - Install UI dependencies
3. `npm run build:backend` - Compile TypeScript backend
4. `npm run build:ui` - Build React UI with Vite

### Production Build
1. Complete development build steps
2. `npm run tauri:build` - Compile Tauri desktop app
3. Output: Windows .exe in `src-tauri/target/release/`

## Customization Guide

### Adding a New Agent

1. Create agent in `src/agents.ts`:
```typescript
export const myAgent: Agent = {
  name: 'my-agent',
  model: 'qwen2.5:7b',
  description: 'My specialized agent',
  async invoke(messages: Message[]): Promise<string> {
    // Your implementation
    return 'Response';
  }
};
```

2. Add to `allAgents` array
3. Update routing logic in `src/router.ts`
4. Add tests in `src/router.test.ts`

### Adding a New Tool

1. Create tool in `src/tools.ts`:
```typescript
export const myTool: Tool = {
  name: 'my_tool',
  description: 'Does something useful',
  parameters: {
    arg1: 'string - description'
  },
  async execute(args: Record<string, unknown>): Promise<string> {
    // Your implementation
    return 'Result';
  }
};
```

2. Add to `allTools` array
3. Export from `src/index.ts`
4. Add tests in `src/tools.test.ts`

### Integrating Local Models

Replace stub implementations in `src/agents.ts`:

```typescript
import { Ollama } from 'ollama'; // or your preferred library

export const generalAgent: Agent = {
  name: 'general',
  model: 'qwen2.5:7b',
  description: 'General-purpose assistant',
  async invoke(messages: Message[]): Promise<string> {
    const ollama = new Ollama({ host: 'http://localhost:11434' });
    const response = await ollama.chat({
      model: this.model,
      messages: messages.map(m => ({
        role: m.role,
        content: m.content
      }))
    });
    return response.message.content;
  }
};
```

## Performance Considerations

### Backend
- TypeScript compiled to optimized JavaScript
- No heavy dependencies
- Deterministic operations are fast
- File operations use Node.js fs (synchronous for simplicity)

### Frontend
- React with Vite for fast builds
- CSS animations use GPU acceleration
- Minimal bundle size (~145KB gzipped)
- No heavy UI libraries

### Tauri
- Native performance (Rust + WebView)
- Small binary size compared to Electron
- Low memory footprint

## Troubleshooting

### Build Issues

**TypeScript errors**: Run `npm run build:backend` to see detailed errors

**Vite errors**: Run `cd ui && npm run build` separately

**Tauri errors**: Ensure Rust toolchain is installed

### Test Failures

**Jest ESM issues**: Ensure Node 18+ and using experimental VM modules

**File system tests**: Ensure `out/` directory exists and is writable

### Runtime Issues

**Model integration**: Check that your local model server is running

**Path errors**: Verify all file operations use relative paths within `out/`

**UI not loading**: Check that `ui/dist/` was built before running Tauri

## Future Enhancements

Possible improvements:
- [ ] Tool call integration with agents
- [ ] Conversation history persistence
- [ ] Model configuration UI
- [ ] Performance metrics display
- [ ] macOS and Linux support
- [ ] Plugin system for custom tools
- [ ] Streaming responses
- [ ] Voice input/output
- [ ] Dark mode theme
- [ ] Export conversations

## License

See LICENSE file for details.
