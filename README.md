# DeskAI

🤖 **100% Offline Meta-Agent for Desktop**

Your professional helpdesk powered by local AI models and tools - completely offline and private.

## Overview

DeskAI is an offline meta-agent that routes user requests to local models and tools, runs everything on-device, and provides a clean desktop UI. All processing happens locally on your machine with no network calls.

### Key Features

- ✅ **100% Offline** - No network calls, all processing on-device
- ✅ **Deterministic Behavior** - Reproducible results for the same inputs
- ✅ **Privacy First** - Your data never leaves your machine
- ✅ **Secure by Design** - Allowlisted tools, filesystem restricted to `out/` directory
- ✅ **Windows Packaging** - Distributable as a Windows .exe via Tauri
- ✅ **Local Model Support** - Interface for plugging in your own local model runners

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

- **file_write** - Write content to files in the `out/` directory
- **file_read** - Read content from files in the `out/` directory
- **calculator** - Perform arithmetic calculations
- **text_analysis** - Analyze text properties (word count, character count, etc.)

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

## Troubleshooting

### Build Issues

**Error: Rust not found**
- Install Rust from https://rustup.rs/

**Error: Node version too old**
- Install Node.js 18+ from https://nodejs.org/

### Runtime Issues

**Tools not working**
- Ensure the `out/` directory exists and is writable
- Check filesystem permissions

**Models not loading**
- Verify model stubs are registered in `ModelRegistry`
- For real models, ensure your local model runner is running

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
