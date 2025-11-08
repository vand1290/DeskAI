# DocuBrain Desktop App

Native desktop application for Windows/Linux/macOS with full filesystem access.

## Features

- 📁 **Native Folder Browser** - Click and browse anywhere on your PC
- 🖱️ **Drag & Drop Support** - Drop folders directly into the app
- 💬 **AI Chat** - Ask questions about your documents using local Ollama
- 🔍 **Full-Text Search** - Search across all your documents
- 📚 **Document Library** - Manage all your imported documents
- 💾 **Local Storage** - SQLite database, no cloud required
- 🎨 **Modern UI** - Clean, dark-theme interface

## Installation

### 1. Install Dependencies

```powershell
cd desktop-app
pip install -r requirements.txt
```

### 2. Run the Application

```powershell
python main.py
```

## Building Standalone Executable

Create a single `.exe` file that can run without Python installed:

```powershell
pip install pyinstaller
pyinstaller --onefile --windowed --name=DocuBrain --icon=icon.ico main.py
```

The executable will be in `dist/DocuBrain.exe`

## Usage

### Importing Documents

**Method 1: Browse for Folder**
1. Click "📁 Browse for Folder"
2. Navigate to any folder on your PC
3. Select the folder
4. All supported documents will be imported automatically

**Method 2: Import Individual Files**
1. Click "📄 Import Files"
2. Select multiple files (Ctrl+Click)
3. Click Open

**Method 3: Drag & Drop** (Coming Soon)
- Drag folders directly from Windows Explorer
- Drop into the application window

### Supported Formats

- PDF (`.pdf`)
- Word Documents (`.docx`)
- PowerPoint (`.pptx`)
- Excel (`.xlsx`)
- Text Files (`.txt`)
- Markdown (`.md`)
- CSV Files (`.csv`)

### AI Chat

1. Go to the "💬 AI Chat" tab
2. Select a model (tinyllama is fastest)
3. Type your question
4. Press Enter or click Send

The AI will answer based on your imported documents.

## Configuration

### Ollama URL

By default, the app connects to Ollama at `http://192.168.1.78:11434`.

To change this, edit `ai_chat.py`:

```python
self.ollama_url = "http://localhost:11434"  # Change to your Ollama URL
```

### Database Location

Documents are stored in: `C:\Users\YourUsername\DocuBrain\docubrain.db`

To change this, edit `database.py`:

```python
db_path = "C:\custom\path\docubrain.db"
```

## Architecture

```
Native Desktop App (CustomTkinter)
    ↓
Local SQLite Database
    ↓
Ollama API (192.168.1.78:11434)
```

**No Docker Required!** Everything runs natively on your machine.

## Comparison: Web App vs Desktop App

| Feature | Web App (Streamlit) | Desktop App |
|---------|---------------------|-------------|
| Folder Browser | ❌ Drop Zone Only | ✅ Full Native Browser |
| File Access | ⚠️ Limited by Docker | ✅ Full PC Access |
| Performance | 🐢 Docker overhead | ⚡ Native speed |
| Installation | Docker required | Python or .exe |
| UI Framework | Streamlit | CustomTkinter |
| Deployment | localhost:8501 | Standalone app |

## Next Steps

- [ ] Add drag & drop support (tkinterdnd2)
- [ ] Settings dialog for Ollama URL, paths
- [ ] System tray integration
- [ ] Auto-watch folders for new documents
- [ ] Full-text search with highlighting
- [ ] Document preview panel
- [ ] Export/backup database
- [ ] Multi-language support

## Troubleshooting

### "Cannot connect to Ollama"
- Make sure Ollama is running
- Check the URL in Settings
- Test with: `curl http://192.168.1.78:11434/api/tags`

### "Import failed"
- Check file permissions
- Make sure file type is supported
- Check console for error messages

### "Database locked"
- Close other instances of the app
- Delete `docubrain.db-journal` if it exists
