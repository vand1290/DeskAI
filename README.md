# 🤖 DeskAI - Offline Meta-Agent Desktop Assistant

A 100% offline AI-powered desktop assistant with OCR capabilities, local model integration, and intelligent secretary tools.

![DeskAI Screenshot](https://img.shields.io/badge/Platform-Windows-blue)
![Rust](https://img.shields.io/badge/Rust-1.70+-orange)
![React](https://img.shields.io/badge/React-18.2-61DAFB)
![License](https://img.shields.io/badge/License-MIT-green)

## ✨ Features

### 🧠 AI Integration
- **8 Local Ollama Models** integrated out-of-the-box:
  - `granite3.1-dense:8b` - IBM's enterprise AI model
  - `ALIENTELLIGENCE/ai2ndbrain:latest` - Specialized reasoning
  - `aya-expanse:latest` - Multilingual support
  - `gemma3:12b` - Google's efficient model
  - `qwen2.5-coder:7b` - Advanced coding assistant
  - `qwen2.5:7b` - General purpose model
  - `llama3:latest` - Meta's flagship model
  - `deepseek-r1:8b` - Deep reasoning capabilities

### 📷 OCR (Optical Character Recognition)
- **Single Image OCR** - Extract text from individual images
- **Bulk OCR** - Scan all images in your system automatically
- **Search in OCR Results** - Find specific text across all scanned images
- Supports: PNG, JPG, JPEG, BMP, GIF

### 🔍 File Management
- **Recursive File Search** - Search entire directory trees (depth 3)
- **Smart Filtering** - Limit results to top 50 matches
- **Quick Preview** - View file contents instantly
- **Network Search Ready** - Extensible to search on intranet

### 🛠️ Secretary Tools
- **📁 File Search** - Local and network file discovery
- **📷 OCR** - Text extraction from images
- **📅 Calendar** - Event management (coming soon)
- **📧 Email** - Email integration (coming soon)

## 🚀 Installation

### Prerequisites

1. **Install Ollama** (AI Backend)
   ```powershell
   winget install Ollama.Ollama
   ```
   Or download from: https://ollama.ai

2. **Install Tesseract OCR**
   ```powershell
   winget install UB-Mannheim.TesseractOCR
   ```
   Or download from: https://github.com/UB-Mannheim/tesseract/wiki

3. **Pull AI Models**
   ```powershell
   ollama pull qwen2.5:7b
   ollama pull llama3:latest
   ollama pull deepseek-r1:8b
   # Add more models as needed
   ```

### Quick Start

1. **Download the installer** from [Releases](https://github.com/vand1290/DeskAI/releases)
2. Run `DeskAI_1.0.0_x64-setup.exe`
3. Launch DeskAI from Start Menu
4. Start chatting with your local AI!

## 🛠️ Development Setup

### Prerequisites
- **Rust** 1.70+ ([Install](https://rustup.rs/))
- **Node.js** 18+ ([Install](https://nodejs.org/))
- **Cargo** (comes with Rust)
- **npm** (comes with Node.js)

### Build from Source

```powershell
# Clone the repository
git clone https://github.com/vand1290/DeskAI.git
cd DeskAI

# Install UI dependencies
cd ui
npm install
cd ..

# Build the app
npm run tauri:build

# Or run in development mode
npm run tauri:dev
```

The installer will be generated at:
```
src-tauri/target/release/bundle/nsis/DeskAI_1.0.0_x64-setup.exe
```

## 📁 Project Structure

```
DeskAI/
├── src-tauri/          # Rust backend
│   ├── src/
│   │   └── main.rs     # Main application logic
│   ├── Cargo.toml      # Rust dependencies
│   └── tauri.conf.json # Tauri configuration
├── ui/                 # React frontend
│   ├── App.tsx         # Main UI component
│   ├── App.css         # Styling
│   └── package.json    # Node dependencies
├── backend/            # Python AI orchestration
│   ├── agent.py        # Meta-agent logic
│   └── tools/          # Tool implementations
└── README.md
```

## 🎨 Tech Stack

### Backend
- **Rust** - High-performance system integration
- **Tauri 1.5** - Cross-platform desktop framework
- **Tokio** - Async runtime
- **Reqwest** - HTTP client for Ollama API

### Frontend
- **React 18** - UI framework
- **TypeScript 5** - Type safety
- **Vite 4** - Build tool
- **Tauri API** - Native system access

### AI & Tools
- **Ollama** - Local LLM inference
- **Tesseract OCR** - Text extraction
- **Python** - Meta-agent orchestration

## 🔧 Configuration

### Custom Ollama URL
Edit `src-tauri/src/main.rs`:
```rust
let ollama_url = "http://localhost:11434/api/generate";
```

### Custom Tesseract Path
Default: `C:\Program Files\Tesseract-OCR\tesseract.exe`

Update in `src-tauri/src/main.rs` if installed elsewhere.

### Search Depth & Limits
In `search_files()` function:
```rust
if depth > 3 { return; }  // Max recursion depth
if results.len() >= 50 { return; }  // Max results
```

## 📸 Screenshots

### Agent View
![Agent Interface](https://via.placeholder.com/800x450?text=Agent+Interface)

### Secretary Tools
![Secretary Tools](https://via.placeholder.com/800x450?text=Secretary+Tools)

### OCR in Action
![OCR Feature](https://via.placeholder.com/800x450?text=OCR+Feature)

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Roadmap

- [x] Ollama integration with 8 models
- [x] OCR with Tesseract
- [x] File search
- [x] Bulk OCR scanning
- [ ] Calendar integration (Outlook, Google Calendar)
- [ ] Email integration (IMAP, Exchange)
- [ ] Network file search (SMB, NFS)
- [ ] Voice input/output
- [ ] Multi-language OCR
- [ ] Document summarization
- [ ] Code analysis tools

## 🐛 Known Issues

- OCR requires Tesseract to be in PATH
- Some antivirus software may flag the installer (false positive)
- Large OCR batches may take time (20+ images)

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- [Tauri](https://tauri.app/) - Desktop framework
- [Ollama](https://ollama.ai/) - Local LLM runtime
- [Tesseract OCR](https://github.com/tesseract-ocr/tesseract) - Text recognition
- [React](https://react.dev/) - UI framework

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/vand1290/DeskAI/issues)
- **Discussions**: [GitHub Discussions](https://github.com/vand1290/DeskAI/discussions)

---

Made with ❤️ by the DeskAI Team
