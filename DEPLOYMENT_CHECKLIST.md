# DocuBrain Windows Deployment Checklist

## 📋 Pre-Deployment Verification

### EXE Files Built
- [ ] `desktop-app/dist/DocuBrain.exe` exists (44.25 MB)
- [ ] `router/dist/DocuBrainRouter.exe` exists (12.91 MB)
- [ ] `router/dist/start_router.bat` exists

### Installer Components
- [ ] `installer/Install.ps1` exists and is readable
- [ ] `INSTALL.bat` exists and is executable
- [ ] `INSTALLATION_GUIDE.md` is complete
- [ ] `BUILD_SUMMARY.md` is complete

### Code Quality
- [ ] No syntax errors in router/router.py (hardcoded localhost)
- [ ] No syntax errors in desktop-app/main.py
- [ ] All spec files have `upx=False` set
- [ ] All spec files have `target_arch='x86_64'` set

---

## 🚀 Test Installation on Clean Machine

### Prerequisites
- [ ] Windows 10 or 11 (64-bit)
- [ ] Administrator access
- [ ] Ollama installed separately (optional for initial test)
- [ ] 4GB RAM minimum

### Installation Test
- [ ] Create test directory (e.g., `C:\DocBrainTest\`)
- [ ] Copy all distribution files to test directory
- [ ] Right-click `INSTALL.bat` → "Run as Administrator"
- [ ] Approve any Windows Defender/UAC prompts
- [ ] Verify no errors in installer output
- [ ] Check `C:\Program Files\DocuBrain\` directory created
- [ ] Verify Desktop shortcut created
- [ ] Verify Start Menu folder created

### Functionality Test (Optional - requires Ollama)
- [ ] Click Desktop "DocuBrain" shortcut
- [ ] Verify app launches within 5 seconds
- [ ] Verify no error dialogs
- [ ] Verify GUI is responsive
- [ ] If Ollama installed: Import a document
- [ ] If Ollama installed: Send a query
- [ ] If Ollama installed: Verify response received

### Uninstall Test
- [ ] Go to Settings → Apps → Apps & Features
- [ ] Find "DocuBrain" in list
- [ ] Click Uninstall
- [ ] Verify uninstallation completes
- [ ] Verify shortcuts removed from Desktop/Start Menu
- [ ] Verify directory cleaned up

---

## 📦 Package for Distribution

### Prepare Distribution Folder
```
DocuBrain_Windows_Setup_v1.0/
├── INSTALL.bat                    (Entry point - users run this)
├── INSTALLATION_GUIDE.md          (User manual)
├── README.md                      (Quick overview)
├── DocuBrain.exe                  (Main application)
├── DocuBrainRouter.exe            (Service component)
├── start_router.bat               (Router launcher)
└── Install.ps1                    (Installer logic)
```

### Create Release Package
- [ ] Create `.zip` archive of distribution folder
- [ ] Name: `DocuBrain_v1.0_Windows.zip`
- [ ] Calculate file size and note it (users need to download)
- [ ] Compute SHA256 checksum of ZIP (optional, for integrity)

### Upload to Distribution Channel
- [ ] Upload to GitHub Releases (if using GitHub)
- [ ] Upload to website download page
- [ ] Create release notes mentioning:
  - [ ] System requirements
  - [ ] What's new
  - [ ] Known issues (if any)
  - [ ] Installation instructions link to INSTALLATION_GUIDE.md

---

## 🔍 Quality Assurance

### User Experience
- [ ] Installation completes in under 2 minutes
- [ ] No error messages during installation
- [ ] Shortcuts work from Desktop and Start Menu
- [ ] Application launches on first click
- [ ] No console windows appear (silent operation)

### Documentation
- [ ] README is clear and welcoming
- [ ] INSTALLATION_GUIDE.md covers all scenarios:
  - [ ] Standard installation
  - [ ] Manual installation
  - [ ] Batch file installation
- [ ] Troubleshooting section addresses common issues
- [ ] Ollama setup instructions are clear

### Compatibility
- [ ] Built with `target_arch='x86_64'` (64-bit)
- [ ] UPX compression disabled (`upx=False`)
- [ ] Tested on Windows 10 (minimum)
- [ ] Tested on Windows 11
- [ ] No missing runtime dependencies

---

## ⚠️ Known Limitations & Notes

### Ollama Integration
- **Note**: Ollama must be installed separately by user
- **Note**: User must pull at least one model before using DocuBrain
- **Default**: Code connects to `http://localhost:11434`
- **Fix**: If changed, modify `router/router.py` line 60-65

### System Requirements
- **OS**: Windows 10 Build 19041+ or Windows 11
- **Architecture**: 64-bit only
- **RAM**: 4GB minimum (8GB recommended with AI models)
- **Disk**: 500MB for application + model size
- **.NET Runtime**: Not required (Python bundled in EXEs)

### Offline Usage
- **Network**: Desktop app can work offline
- **Router**: Requires connection to Ollama
- **First launch**: May require internet for dependency checks

---

## 📊 File Sizes Reference

| Component | Size | Notes |
|-----------|------|-------|
| DocuBrain.exe | 44.25 MB | Main GUI application |
| DocuBrainRouter.exe | 12.91 MB | Service component |
| Total EXE Size | ~57 MB | Combined |
| Installation Folder | ~75 MB | After unpacking |
| Typical Models | 4-7 GB | Downloaded separately (Ollama) |

---

## 🔐 Security Considerations

### Unsigned EXE
- **Status**: Not code-signed (current)
- **Impact**: Windows may show security warnings on first run
- **Solution**: Organizations can code-sign EXEs with company certificate
- **Timeline**: Code signing is optional for initial release

### Antivirus Compatibility
- [ ] Test with Windows Defender (default)
- [ ] If available, test with corporate antivirus
- [ ] False positives common for packed executables
- [ ] If blocked: Add to exclusions or sign EXEs

### Data Privacy
- [ ] SQLite database stored in user's home directory
- [ ] No cloud upload (all local processing)
- [ ] All AI processing via local Ollama instance
- [ ] No telemetry or tracking

---

## 🎯 Go/No-Go Decision

### APPROVE RELEASE IF:
- [ ] Both EXEs built successfully
- [ ] Installation test passes on clean Windows machine
- [ ] Documentation is complete and accurate
- [ ] No critical bugs found during testing
- [ ] Ollama connectivity verified (if testing with Ollama)

### HOLD RELEASE IF:
- [ ] Installation fails
- [ ] Shortcuts not created properly
- [ ] Application crashes on launch
- [ ] Documentation has errors
- [ ] Antivirus flags as malware

---

## 📝 Release Notes Template

```markdown
# DocuBrain v1.0 - Windows Release

## What's New
- Initial Windows desktop application release
- Silent router service for Ollama integration
- Automated installation script
- Complete offline-capable document processing

## System Requirements
- Windows 10 (Build 19041) or Windows 11 (64-bit)
- 4GB RAM minimum
- 500MB disk space
- Ollama installed separately (optional)

## Installation
1. Extract DocuBrain_v1.0_Windows.zip
2. Right-click INSTALL.bat → Run as Administrator
3. Follow on-screen prompts

## New Features
- Document import and processing
- AI-powered chat interface
- Local SQLite database
- Silent router service
- Desktop and Start Menu shortcuts

## Known Issues
- Ollama must be installed separately
- First launch may take 5 seconds (service initialization)
- Requires Administrator privileges for installation

## Support
- See INSTALLATION_GUIDE.md for detailed instructions
- Check troubleshooting section for common issues
- Visit [GitHub URL] for issue reports

## Download
- File: DocuBrain_v1.0_Windows.zip
- Size: [INSERT SIZE]
- SHA256: [INSERT HASH]
```

---

## ✅ Final Verification

### Before Clicking "Release"
1. [ ] All checklist items completed
2. [ ] Installation tested on clean machine
3. [ ] Documentation reviewed
4. [ ] No breaking changes since last build
5. [ ] Version numbers updated consistently
6. [ ] Release notes prepared
7. [ ] Download link verified
8. [ ] Support contact information available

---

**Status**: Ready for deployment once all items checked ✓

**Distribution Date**: [Fill in]
**Release Version**: 1.0.0
**Release Manager**: [Name]
**Approved By**: [Name/Manager]
