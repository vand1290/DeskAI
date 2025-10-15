# Contributing to DeskAI

Thank you for your interest in contributing to DeskAI! This guide will help you set up your development environment and understand the project structure.

## Development Setup

### Prerequisites

1. **Node.js** (v16 or higher)
   - Download from [nodejs.org](https://nodejs.org/)
   - Verify: `node --version`

2. **Rust** (latest stable)
   - Download from [rustup.rs](https://rustup.rs/)
   - Verify: `cargo --version`

3. **Platform-specific dependencies**:

   **Windows:**
   - Visual Studio 2022 or Visual Studio Build Tools
   - WebView2 (usually pre-installed on Windows 11)

   **Linux:**
   ```bash
   sudo apt-get update
   sudo apt-get install -y libwebkit2gtk-4.1-dev \
     libappindicator3-dev \
     librsvg2-dev \
     patchelf
   ```

   **macOS:**
   ```bash
   xcode-select --install
   ```

### Installation

1. Clone the repository:
```bash
git clone https://github.com/vand1290/DeskAI.git
cd DeskAI
```

2. Install dependencies:
```bash
npm install
```

## Development Workflow

### Running in Development Mode

Start the development server with hot-reload:
```bash
npm run tauri:dev
```

This will:
- Start Vite dev server on `http://localhost:1420`
- Launch the Tauri application
- Enable hot-reload for frontend changes
- Show console logs in terminal

### Building for Production

Build the application for your current platform:
```bash
npm run tauri:build
```

**Windows Build Outputs:**
- MSI installer: `src-tauri/target/release/bundle/msi/DeskAI_1.0.0_x64_en-US.msi`
- NSIS installer: `src-tauri/target/release/bundle/nsis/DeskAI_1.0.0_x64-setup.exe`

**Linux Build Outputs:**
- AppImage: `src-tauri/target/release/bundle/appimage/`
- Deb package: `src-tauri/target/release/bundle/deb/`

### Cross-Compilation to Windows

To build for Windows from Linux/macOS:

1. Install Windows target:
```bash
rustup target add x86_64-pc-windows-msvc
```

2. Install cross-compilation tools:
   - On Linux: Install `mingw-w64`
   - On macOS: Use [xwin](https://github.com/Jake-Shadle/xwin)

3. Build:
```bash
npm run tauri build -- --target x86_64-pc-windows-msvc
```

## Project Structure

```
DeskAI/
├── src/                        # Frontend (React + TypeScript)
│   ├── components/             # React components
│   │   ├── ChatInterface.tsx   # Main chat UI
│   │   ├── ModelSelector.tsx   # Model selection sidebar
│   │   └── ToolPanel.tsx       # Tool execution panel
│   ├── services/               # API service layer
│   │   └── api.ts              # Tauri backend API calls
│   ├── App.tsx                 # Main application component
│   ├── main.tsx                # Entry point
│   └── styles.css              # Global styles
│
├── src-tauri/                  # Backend (Rust + Tauri)
│   ├── src/
│   │   └── main.rs             # Main Rust application
│   ├── icons/                  # Application icons
│   ├── Cargo.toml              # Rust dependencies
│   └── tauri.conf.json         # Tauri configuration
│
├── index.html                  # HTML template
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript configuration
└── package.json                # Node dependencies & scripts
```

## Architecture

### Meta-Agent Routing System

DeskAI implements a meta-agent pattern that routes user requests to specialized local models:

1. **Request Routing** (`route_request` in `main.rs`):
   - Analyzes user prompt
   - Selects appropriate model based on request type
   - Returns response from the selected model

2. **Tool Execution** (`execute_tool` in `main.rs`):
   - Executes local tools (calculator, file search, system info)
   - Returns results without network requests

3. **Model Management** (`get_available_models` in `main.rs`):
   - Manages multiple specialized models
   - Provides model metadata and capabilities

### Frontend-Backend Communication

The frontend communicates with Rust backend using Tauri's IPC:

```typescript
// Frontend (TypeScript)
import { invoke } from '@tauri-apps/api/core';

const response = await invoke('route_request', {
  request: { prompt, model, temperature }
});
```

```rust
// Backend (Rust)
#[tauri::command]
fn route_request(request: ModelRequest) -> Result<ModelResponse, String> {
    // Process request and return response
}
```

## Code Style

### Frontend (TypeScript)
- Use functional components with hooks
- Prefer `const` over `let`
- Use TypeScript strict mode
- Follow ESLint rules

### Backend (Rust)
- Use `rustfmt` for formatting: `cargo fmt`
- Use `clippy` for linting: `cargo clippy`
- Follow Rust naming conventions
- Add error handling with `Result<T, String>`

## Testing

### Frontend Tests
```bash
npm test
```

### Rust Tests
```bash
cd src-tauri
cargo test
```

### Type Checking
```bash
npm run build  # Includes TypeScript type checking
```

## Adding New Features

### Adding a New Model

1. Update `get_available_models` in `src-tauri/src/main.rs`:
```rust
AvailableModel {
    id: "your_model".to_string(),
    name: "Your Model".to_string(),
    description: "Description".to_string(),
    capabilities: vec!["capability1".to_string()],
}
```

2. Add routing logic in `route_request`:
```rust
"your_model" => {
    // Your model logic here
}
```

### Adding a New Tool

1. Update `get_available_tools` in `src-tauri/src/main.rs`:
```rust
"your_tool".to_string(),
```

2. Add tool execution logic in `execute_tool`:
```rust
"your_tool" => {
    // Your tool logic here
}
```

## Pull Request Process

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make your changes
4. Test thoroughly
5. Commit with clear messages
6. Push to your fork
7. Open a Pull Request

## Debugging

### Frontend Debugging
- Open DevTools: `Ctrl+Shift+I` (Windows/Linux) or `Cmd+Option+I` (macOS)
- Console logs appear in both DevTools and terminal

### Backend Debugging
- Rust console output appears in terminal
- Add debug prints: `println!("Debug: {:?}", variable);`
- Use `RUST_LOG=debug npm run tauri:dev` for verbose logging

## Common Issues

### Issue: Build fails with missing dependencies
**Solution:** Ensure all platform-specific dependencies are installed (see Prerequisites)

### Issue: Hot-reload not working
**Solution:** Restart the dev server: `Ctrl+C` then `npm run tauri:dev`

### Issue: Icons not loading
**Solution:** Ensure icon files exist in `src-tauri/icons/`

## Getting Help

- Open an issue on GitHub
- Check existing issues for similar problems
- Review the [Tauri documentation](https://tauri.app/)

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.
