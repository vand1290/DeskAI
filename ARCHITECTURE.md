# DeskAI Architecture

## Overview

DeskAI is an offline meta-agent desktop application that routes user requests to local models and tools, with everything running on-device for maximum privacy and security.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        DeskAI Desktop UI                     │
│                      (Tauri Window)                          │
└─────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┴─────────────────────┐
        │                                            │
        ▼                                            ▼
┌──────────────────┐                      ┌──────────────────┐
│   Frontend UI    │                      │  Backend Engine  │
│ (React + TS)     │◄────IPC (Tauri)─────►│  (Rust)          │
└──────────────────┘                      └──────────────────┘
        │                                            │
        │                                            │
        ▼                                            ▼
┌──────────────────┐                      ┌──────────────────┐
│  UI Components   │                      │  Meta-Agent      │
│  - ChatInterface │                      │  Router          │
│  - ModelSelector │                      │                  │
│  - ToolPanel     │                      │  ┌────────────┐  │
└──────────────────┘                      │  │ Model 1    │  │
        │                                 │  │ (General)  │  │
        │                                 │  └────────────┘  │
        ▼                                 │  ┌────────────┐  │
┌──────────────────┐                      │  │ Model 2    │  │
│  API Service     │                      │  │ (Code)     │  │
│  Layer           │                      │  └────────────┘  │
│  - api.ts        │                      │  ┌────────────┐  │
└──────────────────┘                      │  │ Model 3    │  │
                                          │  │ (Creative) │  │
                                          │  └────────────┘  │
                                          └──────────────────┘
                                                     │
                                                     ▼
                                          ┌──────────────────┐
                                          │  Local Tools     │
                                          │  - Calculator    │
                                          │  - File Search   │
                                          │  - System Info   │
                                          └──────────────────┘
```

## Component Details

### Frontend Layer (React + TypeScript)

**Location:** `src/`

#### 1. Main Application (`App.tsx`)
- Entry point for the application
- Manages global state (models, tools, messages)
- Coordinates between UI components
- Handles user interactions

#### 2. UI Components (`src/components/`)

**ChatInterface.tsx**
- Displays conversation history
- Handles message input/output
- Shows loading states
- Provides quick action suggestions

**ModelSelector.tsx**
- Lists available models
- Shows model capabilities
- Handles model selection
- Updates active model state

**ToolPanel.tsx**
- Lists available tools
- Triggers tool execution
- Displays tool icons and names

#### 3. Service Layer (`src/services/`)

**api.ts**
- Wraps Tauri IPC calls
- Provides TypeScript type safety
- Exports clean API for components
- Handles error cases

### Backend Layer (Rust)

**Location:** `src-tauri/src/`

#### 1. Meta-Agent Router (`main.rs`)

**Core Functions:**

```rust
#[tauri::command]
fn route_request(request: ModelRequest) -> Result<ModelResponse, String>
```
- Receives user prompts
- Analyzes request type
- Routes to appropriate model
- Returns model response

```rust
#[tauri::command]
fn execute_tool(request: ToolRequest) -> Result<ToolResponse, String>
```
- Executes local tools
- Processes parameters
- Returns execution results

```rust
#[tauri::command]
fn get_available_models() -> Result<Vec<AvailableModel>, String>
```
- Returns list of available models
- Includes model metadata
- Describes capabilities

```rust
#[tauri::command]
fn get_available_tools() -> Result<Vec<String>, String>
```
- Returns list of available tools
- Provides tool names

### Communication Flow

#### User Message Flow

```
User Input
    ↓
ChatInterface (UI)
    ↓
App.tsx (State Management)
    ↓
api.ts (Service Layer)
    ↓
Tauri IPC
    ↓
route_request() [Rust]
    ↓
Model Selection Logic
    ↓
Model Processing
    ↓
Response
    ↓
Tauri IPC
    ↓
App.tsx
    ↓
ChatInterface (Display)
```

#### Tool Execution Flow

```
Tool Button Click
    ↓
ToolPanel (UI)
    ↓
App.tsx
    ↓
api.ts
    ↓
Tauri IPC
    ↓
execute_tool() [Rust]
    ↓
Tool Logic Execution
    ↓
Result
    ↓
Tauri IPC
    ↓
ChatInterface (Display)
```

## Data Structures

### Frontend Types

```typescript
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model?: string;
}

interface AvailableModel {
  id: string;
  name: string;
  description: string;
  capabilities: string[];
}
```

### Backend Types

```rust
struct ModelRequest {
    prompt: String,
    model: String,
    temperature: Option<f32>,
}

struct ModelResponse {
    response: String,
    model: String,
    tokens_used: u32,
}

struct ToolRequest {
    tool: String,
    parameters: HashMap<String, String>,
}

struct ToolResponse {
    result: String,
    tool: String,
}
```

## Offline Design Principles

1. **No External Dependencies**: All models and tools run locally
2. **On-Device Processing**: No data leaves the user's machine
3. **Local State Management**: All state stored in application memory
4. **Native Desktop**: True desktop application, not a web wrapper
5. **Resource Efficient**: Minimal memory footprint

## Security Features

1. **Content Security Policy (CSP)**: Configured in `tauri.conf.json`
2. **IPC Validation**: All commands validated in Rust
3. **Type Safety**: TypeScript + Rust type checking
4. **Sandboxed Execution**: Tauri security model
5. **No Network Access**: Application operates entirely offline

## Build Configuration

### Tauri Configuration (`tauri.conf.json`)

- **Product Name**: DeskAI
- **Identifier**: com.deskai.app
- **Bundle Targets**: MSI, NSIS (Windows)
- **Window Size**: 1200x800 (min: 800x600)

### Frontend Build (`vite.config.ts`)

- **Dev Server**: Port 1420
- **Build Target**: ES2021, Chrome 100+
- **Hot Reload**: Enabled in development
- **Production**: Minified, optimized

### Backend Build (`Cargo.toml`)

- **Tauri Version**: 2.x
- **Dependencies**: serde, serde_json
- **Features**: shell plugin
- **Edition**: 2021

## Deployment

### Windows Packaging

The application builds two installer types:

1. **MSI Installer**
   - Standard Windows installer
   - Supports enterprise deployment
   - Location: `src-tauri/target/release/bundle/msi/`

2. **NSIS Installer**
   - Lightweight installer
   - Custom installation options
   - Location: `src-tauri/target/release/bundle/nsis/`

### CI/CD Pipeline

GitHub Actions workflow (`.github/workflows/build.yml`):
- Builds on Windows and Linux
- Runs tests
- Creates installers
- Uploads artifacts

## Future Enhancements

### Potential Extensions

1. **Model Integration**
   - Integrate with ONNX Runtime for ML models
   - Support for Llama.cpp
   - GGUF model loading

2. **Tool Expansion**
   - File system operations
   - Data analysis tools
   - Image processing
   - PDF operations

3. **UI Enhancements**
   - Dark/light theme toggle
   - Conversation history
   - Export conversations
   - Settings panel

4. **Performance**
   - Model caching
   - Streaming responses
   - Background processing
   - Memory optimization

## Development Patterns

### Adding New Models

1. Define model in `get_available_models()`
2. Add routing logic in `route_request()`
3. Implement model-specific processing
4. Test with various inputs

### Adding New Tools

1. Add tool name to `get_available_tools()`
2. Implement logic in `execute_tool()`
3. Add UI icon/button in `ToolPanel.tsx`
4. Test tool execution

### State Management

- React hooks for local state
- Props drilling for component communication
- Service layer for backend calls
- No external state management (Redux, etc.)

## Performance Characteristics

- **Startup Time**: < 2 seconds
- **Memory Usage**: ~50-100 MB
- **CPU Usage**: Idle: <1%, Active: varies by model
- **Bundle Size**: ~10-15 MB installed

## Testing Strategy

1. **Frontend Tests**: Component testing with React Testing Library
2. **Backend Tests**: Rust unit tests with `cargo test`
3. **Integration Tests**: End-to-end Tauri tests
4. **Manual Testing**: UI/UX verification on target platforms

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Verify system dependencies
   - Check Rust/Node versions
   - Clear node_modules and cargo cache

2. **IPC Errors**
   - Verify command names match
   - Check parameter types
   - Review Tauri logs

3. **UI Issues**
   - Check browser console
   - Verify component props
   - Review CSS conflicts
