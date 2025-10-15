# DeskAI

Your professional helpdesk - an offline meta-agent that runs everything on your device.

## Features

- 🔒 **100% Offline**: All processing happens on your device
- 🎯 **Smart Routing**: Automatically routes requests to appropriate local models
- 🛠️ **Built-in Tools**: Calculator, file search, system info, and more
- 💻 **Desktop UI**: Native desktop application built with Tauri
- 🪟 **Windows Ready**: Packaged for Windows via MSI and NSIS installers
- 🚀 **Fast & Lightweight**: Efficient Rust backend with modern React frontend

## Architecture

DeskAI is a meta-agent that:
1. Receives user requests through a desktop UI
2. Routes requests to appropriate local models based on task type
3. Executes local tools when needed
4. Returns results through the same interface

All data stays on your device - no internet required!

## Prerequisites

- Node.js (v16 or higher)
- Rust (latest stable version)
- For Windows builds: Visual Studio Build Tools

## Installation

1. Clone the repository:
```bash
git clone https://github.com/vand1290/DeskAI.git
cd DeskAI
```

2. Install dependencies:
```bash
npm install
```

## Development

Run the app in development mode:
```bash
npm run tauri:dev
```

This will start the Vite dev server and launch the Tauri application.

## Building for Windows

Build the Windows installer:
```bash
npm run tauri:build
```

This will create:
- MSI installer at `src-tauri/target/release/bundle/msi/`
- NSIS installer at `src-tauri/target/release/bundle/nsis/`

## Available Models

The meta-agent includes three specialized models:

1. **General Assistant**: General purpose conversational model for everyday questions
2. **Code Assistant**: Specialized in programming, debugging, and code generation
3. **Creative Writer**: Focused on creative writing and content generation

## Available Tools

- **Calculator**: Perform mathematical calculations
- **File Search**: Search for files on your system
- **System Info**: Get system information

## Project Structure

```
DeskAI/
├── src/                    # Frontend React application
│   ├── components/         # React components
│   ├── services/           # API services
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Entry point
│   └── styles.css         # Global styles
├── src-tauri/             # Tauri Rust backend
│   ├── src/
│   │   └── main.rs        # Rust backend with routing logic
│   ├── icons/             # Application icons
│   ├── Cargo.toml         # Rust dependencies
│   └── tauri.conf.json    # Tauri configuration
├── index.html             # HTML template
├── vite.config.ts         # Vite configuration
└── package.json           # Node dependencies

```

## Technology Stack

- **Frontend**: React, TypeScript, Vite
- **Backend**: Rust, Tauri
- **Packaging**: Tauri (MSI/NSIS for Windows)
- **Styling**: CSS3

## License

MIT
