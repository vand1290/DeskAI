# DeskAI - LocalMetaAgent (Offline)

## Overview
DeskAI is an offline meta-agent that routes user requests to local models and tools, runs everything on-device, and provides a desktop UI. It targets Windows packaging via Tauri.

## Key Constraints
- **100% Offline**: No network calls are made
- **Deterministic Behavior**: All responses are predictable and reproducible
- **Windows Packaging**: Packaged as a Windows .exe using Tauri

## Monorepo Layout
- **`src/`** - Backend TypeScript logic (no network calls)
- **`ui/`** - React-based user interface
- **`src-tauri/`** - Minimal Tauri scaffold for desktop app
- **`out/`** - Generated artifacts and workspace directory

## Getting Started (Development)

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

### Packaging (Tauri)
```bash
# Build the Tauri app into a Windows executable
npm run tauri:build
```

The built executable will be located in `src-tauri/target/release/`.

## Offline Usage
Models are referenced by name (e.g., `qwen2.5:7b`), but loading and inference are user-provided via local runners. The provided agents are deterministic stubs by default; you can plug in your local model runners later.

### Integrating Local Models
To connect your own local models:
1. Edit `src/agents.ts`
2. Replace the stub `invoke` methods with calls to your local model runtime (e.g., Ollama, llama.cpp, etc.)

## Architecture

### Meta-Agent Router
The system uses a deterministic keyword-based router that directs queries to specialized agents:
- **General Agent**: Default agent for general queries
- **Code Agent**: Specialized for programming and debugging tasks
- **Data Agent**: Focused on data analysis and visualization

### Tools System
All tools are allowlisted and deterministic:
- **file_read**: Read files from the `out` directory
- **file_write**: Write files to the `out` directory
- **file_list**: List files in the `out` directory

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

## Testing
```bash
# Run all unit tests
npm test

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
